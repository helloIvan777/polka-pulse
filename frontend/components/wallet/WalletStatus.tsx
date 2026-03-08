"use client";

import { useWallet } from "@/context/WalletContext";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletStatus() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  return (
    <div className="flex items-center gap-2">
      {isConnected && address && (
        <span className="hidden items-center rounded-full border border-[#27272A] bg-[#111111] px-2.5 py-1 text-[0.65rem] font-mono text-zinc-300 sm:inline-flex">
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {truncateAddress(address)}
        </span>
      )}
      <button
        type="button"
        onClick={isConnected ? disconnect : connect}
        disabled={isConnecting}
        className="inline-flex items-center rounded-full border border-white bg-[#E6007A] px-3 py-1.5 text-[0.7rem] font-medium text-white shadow-[0_0_18px_rgba(230,0,122,0.65)] transition hover:brightness-110 disabled:opacity-60"
      >
        {isConnecting
          ? "Connecting…"
          : isConnected
            ? "Disconnect"
            : "Connect Wallet"}
      </button>
    </div>
  );
}

