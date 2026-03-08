export const PULSE_VAULT_ABI = [
  {
    inputs: [
      {
        internalType: "enum AssetKind",
        name: "asset",
        type: "uint8"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "sendAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "enum AssetKind",
        name: "asset",
        type: "uint8"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "dest",
        type: "bytes"
      },
      {
        internalType: "uint128",
        name: "feeAsset",
        type: "uint128"
      }
    ],
    name: "xcmTransferAsset",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

