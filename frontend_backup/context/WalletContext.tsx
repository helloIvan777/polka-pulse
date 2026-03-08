"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

type WalletContextValue = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

declare global {
  interface Window {
    // Injected by wallets such as MetaMask / Talisman configured for Polkadot Hub RPC.
    ethereum?: unknown;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum || isConnecting) return;
    setIsConnecting(true);
    try {
      const browserProvider = new BrowserProvider(window.ethereum as any);

      // Optionally enforce Polkadot Hub Testnet (EVM) via chain id if provided.
      const expectedChainIdHex = process.env.NEXT_PUBLIC_HUB_CHAIN_ID_HEX;
      if (expectedChainIdHex) {
        try {
          const network = await browserProvider.getNetwork();
          const currentHex = `0x${network.chainId.toString(16)}`;
          if (currentHex.toLowerCase() !== expectedChainIdHex.toLowerCase()) {
            await browserProvider.send("wallet_switchEthereumChain", [
              { chainId: expectedChainIdHex }
            ]);
          }
        } catch {
          // If the wallet doesn't support switching or the chain isn't added,
          // we simply fall back to the user's current network.
        }
      }

      // Request accounts from the injected wallet. The user should already have
      // their wallet pointed at the Polkadot Hub Testnet EVM RPC.
      await browserProvider.send("eth_requestAccounts", []);
      const nextSigner = await browserProvider.getSigner();
      const nextAddress = await nextSigner.getAddress();

      setProvider(browserProvider);
      setSigner(nextSigner);
      setAddress(nextAddress);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    // There is no standard "disconnect" for injected wallets, so we simply
    // drop local references. The user can disconnect in their wallet UI.
    setProvider(null);
    setSigner(null);
    setAddress(null);
  }, []);

  const value: WalletContextValue = useMemo(
    () => ({
      provider,
      signer,
      address,
      isConnecting,
      isConnected: !!address && !!signer,
      connect,
      disconnect
    }),
    [address, connect, disconnect, isConnecting, provider, signer]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}

