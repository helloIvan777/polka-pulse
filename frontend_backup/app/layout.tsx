import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { WalletStatus } from "@/components/wallet/WalletStatus";

export const metadata = {
  title: "Polka Pulse",
  description: "Agentic interface for Polkadot DeFi"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-[#27272A] bg-black/70 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#E6007A] to-[#f97316] shadow-lg shadow-[#E6007A]/50" />
                  <div>
                    <div className="text-sm font-semibold tracking-wide text-white">
                      Polka Pulse
                    </div>
                    <div className="text-xs text-zinc-400">
                      AI Agent for Polkadot Assets
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="hidden items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live · Hub Testnet
                  </span>
                  <span className="hidden sm:inline text-zinc-400">
                    Future of decentralized finance
                  </span>
                  <WalletStatus />
                </div>
              </div>
            </header>
            <main className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-6xl px-4 py-6">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

