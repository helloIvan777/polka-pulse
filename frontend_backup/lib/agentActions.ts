import type { JsonRpcSigner, TransactionRequest } from "ethers";
import { Contract } from "ethers";
import { PULSE_VAULT_ABI } from "./abi/pulseVault";

export type AgentIntentType = "send" | "xcm";

export type AgentIntentAsset = "DOT" | "USDT";

export type AgentIntentPayload = {
  type: AgentIntentType;
  asset: AgentIntentAsset;
  amount: string;
  to?: string;
  xcmDestination?: string;
  feeAssetId?: number;
};

export type PreparedAgentAction = {
  description: string;
  request: TransactionRequest;
};

function toAssetKind(asset: AgentIntentAsset): number {
  // Mirrors the AssetKind enum in PulseVault.sol (0 = DOT, 1 = USDT).
  return asset === "DOT" ? 0 : 1;
}

/// Prepare a low-level transaction request for the PulseVault contract based on
/// a high-level intent JSON coming from the AI stack.
export async function prepareAgentAction(
  intent: AgentIntentPayload,
  signer: JsonRpcSigner,
  vaultAddress: string
): Promise<PreparedAgentAction> {
  const vault = new Contract(vaultAddress, PULSE_VAULT_ABI, signer);

  if (intent.type === "send") {
    if (!intent.to) throw new Error("Missing recipient address for send intent");

    const tx = await vault.populateTransaction.sendAsset(
      toAssetKind(intent.asset),
      intent.to,
      intent.amount
    );

    return {
      description: `Send ${intent.amount} ${intent.asset} to ${intent.to} via PulseVault`,
      request: tx
    };
  }

  if (intent.type === "xcm") {
    if (!intent.xcmDestination) {
      throw new Error("Missing XCM destination for xcm intent");
    }

    const tx = await vault.populateTransaction.xcmTransferAsset(
      toAssetKind(intent.asset),
      intent.amount,
      intent.xcmDestination,
      intent.feeAssetId ?? 0
    );

    return {
      description: `Route ${intent.amount} ${intent.asset} over XCM to ${intent.xcmDestination}`,
      request: tx
    };
  }

  throw new Error(`Unsupported agent intent type: ${intent.type}`);
}

