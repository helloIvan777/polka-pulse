// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PulseVault - Intent-driven asset vault on Polkadot pallet-revive (PVM)
/// @notice This vault is designed to sit behind an AI intent layer. The AI produces a
///         structured intent (send / swap / stake / XCM), and this contract executes the
///         corresponding low-level calls against Polkadot precompiles exposed in pallet-revive.
/// @dev The exact ABI and addresses of the DOT / USDT / XCM precompiles are chain-specific.
///      For the Polkadot Hub Testnet, configure those addresses at deployment time and keep
///      this contract as a thin, auditable router for agent-generated intents.

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @dev Minimal ERC20-like interface used by pallet-revive precompiles for DOT / USDT.
///      On many PVM deployments, native assets are surfaced as precompiled contracts that
///      expose an ERC20-compatible `transfer` ABI. If your target chain differs, adjust
///      this interface to match the actual precompile.
interface IAssetsPrecompile {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @dev Minimal XCM transactor interface. The real precompile may support richer routing
///      options (fee asset, weight hints, multilocation builders, etc). The AI stack is
///      responsible for building the correct `dest` payload for the target chain.
interface IXcmTransactor {
    function xcmTransfer(
        bytes calldata dest,
        uint128 amount,
        uint64 feeAsset
    ) external payable;
}

contract PulseVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Asset types the agent can reason about.
    /// @dev These map directly to DOT / USDT precompiles configured at deployment.
    enum AssetKind {
        DOT,
        USDT
    }

    /// @notice Precompile entrypoints for pallet-revive on this chain.
    /// @dev
    /// - `dotPrecompile`  : logical handle for native DOT (may be a special system address).
    /// - `usdtPrecompile` : handle for a USDT asset precompile (ERC20 compatible).
    /// - `xcmPrecompile`  : entrypoint that exposes XCM routing functions.
    ///
    /// These are intentionally not hard-coded, so the same bytecode can be reused on
    /// different Polkadot ecosystem chains (Polkadot Hub Testnet, Asset Hub, parachains).
    address public immutable dotPrecompile;
    address public immutable usdtPrecompile;
    address public immutable xcmPrecompile;

    event Deposited(address indexed user, AssetKind asset, uint256 amount);
    event Withdrawn(address indexed caller, AssetKind asset, uint256 amount, address to);
    event XcmRouted(
        address indexed caller,
        AssetKind asset,
        uint256 amount,
        bytes dest
    );

    constructor(
        address _dotPrecompile,
        address _usdtPrecompile,
        address _xcmPrecompile,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_dotPrecompile != address(0), "dot precompile required");
        require(_usdtPrecompile != address(0), "usdt precompile required");
        require(_xcmPrecompile != address(0), "xcm precompile required");
        require(initialOwner != address(0), "owner required");

        dotPrecompile = _dotPrecompile;
        usdtPrecompile = _usdtPrecompile;
        xcmPrecompile = _xcmPrecompile;
    }

    /// @notice Accept native DOT deposits directly into the vault.
    /// @dev On pallet-revive chains, the PVM usually treats native DOT as the base currency.
    ///      This `receive` hook lets users or higher-level agents fund the vault with DOT
    ///      without needing an explicit function call.
    receive() external payable {
        emit Deposited(msg.sender, AssetKind.DOT, msg.value);
    }

    /// @notice Explicit native DOT deposit entrypoint.
    /// @dev Mirrors the `receive` hook but is easier for off-chain tooling to reason about.
    function deposit() external payable nonReentrant {
        require(msg.value > 0, "zero value");
        emit Deposited(msg.sender, AssetKind.DOT, msg.value);
    }

    /// @notice Deposit ERC20-style assets (e.g. USDT) that are exposed via a precompile.
    /// @param asset Logical asset identifier (DOT / USDT). For DOT this will typically be
    ///              a wrapped or precompile-surfaced representation.
    /// @param amount Amount of tokens to pull from the caller.
    function depositErc20(AssetKind asset, uint256 amount) external nonReentrant {
        address token = _assetToToken(asset);
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, asset, amount);
    }

    /// @notice Withdraw DOT or USDT from the vault back to a user-controlled address.
    /// @dev Restricted to the owner (e.g. a multisig or agent executor) so that the off-chain
    ///      AI can orchestrate flows without users having to reason about low-level calls.
    function withdraw(
        AssetKind asset,
        uint256 amount,
        address to
    ) external nonReentrant onlyOwner {
        require(to != address(0), "zero to");

        if (asset == AssetKind.DOT) {
            // For native DOT, we use a plain value transfer. On pallet-revive this will debit
            // the contract's DOT balance held in the PVM and credit `to` on the same chain.
            (bool ok, ) = to.call{value: amount}("");
            require(ok, "dot send failed");
        } else {
            address token = _assetToToken(asset);
            IERC20(token).safeTransfer(to, amount);
        }

        emit Withdrawn(msg.sender, asset, amount, to);
    }

    /// @notice Execute a local transfer using the DOT / USDT precompiles.
    /// @dev This is the on-chain primitive that backs the "send" intent class from the AI.
    ///      The precompile will update balances in the underlying Polkadot runtime.
    function sendAsset(
        AssetKind asset,
        address to,
        uint256 amount
    ) external nonReentrant onlyOwner {
        require(to != address(0), "zero to");

        if (asset == AssetKind.DOT) {
            IAssetsPrecompile(dotPrecompile).transfer(to, amount);
        } else {
            IAssetsPrecompile(usdtPrecompile).transfer(to, amount);
        }
    }

    /// @notice Trigger an XCM transfer through the pallet-revive XCM precompile.
    /// @param asset      Logical asset kind (DOT / USDT) to move.
    /// @param amount     Amount to move across chains.
    /// @param dest       Encoded XCM destination (parachain + account multilocation).
    /// @param feeAsset   Identifier for the asset used to pay XCM fees (runtime specific).
    /// @dev The AI / intent layer is responsible for:
    ///      - building the `dest` byte payload for the target parachain,
    ///      - selecting the correct `feeAsset` and fee budget,
    ///      - optionally simulating or quoting the XCM route.
    ///      This function simply forwards the call into the precompile.
    function xcmTransferAsset(
        AssetKind asset,
        uint256 amount,
        bytes calldata dest,
        uint128 feeAsset
    ) external payable nonReentrant onlyOwner {
        // Note: in a full production implementation you may want to:
        //  - validate `dest` against an allowlist of parachains,
        //  - cap `amount` and fees per call,
        //  - emit richer telemetry for indexing.
        IXcmTransactor(xcmPrecompile).xcmTransfer(dest, uint128(amount), uint64(feeAsset));
        emit XcmRouted(msg.sender, asset, amount, dest);
    }

    /// @notice Generic execution hook for pallet-revive precompiles (advanced flows).
    /// @dev Restricted to known precompile addresses so the surface remains narrow and
    ///      auditable. Intended for future XCM / router upgrades driven by AI agents.
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external nonReentrant onlyOwner returns (bytes memory result) {
        require(
            target == dotPrecompile || target == usdtPrecompile || target == xcmPrecompile,
            "target not allowed"
        );

        (bool ok, bytes memory res) = target.call{value: value}(data);
        require(ok, "precompile call failed");
        return res;
    }

    /// @dev Resolve the ERC20-compatible token address for the given asset kind.
    function _assetToToken(AssetKind asset) internal view returns (address) {
        if (asset == AssetKind.DOT) {
            return dotPrecompile;
        }

        return usdtPrecompile;
    }
}

