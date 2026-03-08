"use client";

import { ChatPanel } from "@/components/chat/ChatPanel";
import { TransactionPreview } from "@/components/transaction/TransactionPreview";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { interpretCommand } from "@/lib/mockAi";

export type Role = "user" | "agent";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

export type ProposedTransaction = {
  id: string;
  intentType: "send" | "swap" | "stake" | "xcm" | "deposit";
  asset: string;
  amount: string;
  from?: string;
  to?: string;
  network: string;
  summary: string;
  riskLevel: "low" | "medium" | "high";
};

export default function Page() {
  const { address, connect } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content:
        "Hey, I’m your Polka Pulse agent. Tell me what you want to do with your Polkadot assets and I’ll orchestrate the XCM magic for you.",
      createdAt: Date.now()
    }
  ]);

  const [preview, setPreview] = useState<ProposedTransaction | null>(null);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);

    const intent = interpretCommand(content);
    const vaultAddress = process.env.NEXT_PUBLIC_PULSE_VAULT_ADDRESS ?? "0x789...PulseVault";

    const agentMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "agent",
      content: intent.action === "deposit" 
        ? `I've parsed this as a deposit of ${intent.amount} ${intent.asset}. Review the preview.`
        : "Intent parsed. Review the transaction details.",
      createdAt: Date.now()
    };

    setTimeout(() => {
      setMessages(prev => [...prev, agentMessage]);
      setPreview({
        id: crypto.randomUUID(),
        intentType: intent.action,
        asset: intent.asset,
        amount: intent.amount,
        from: address ?? "Not connected",
        to: vaultAddress,
        network: "Polkadot Hub Testnet",
        summary: `Execute ${intent.action} for ${intent.amount} ${intent.asset} via pallet-revive.`,
        riskLevel: "low"
      });
    }, 600);
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full blur-[1px] shadow-pulse-pink animate-pulse" />
            <span className="text-2xl font-black tracking-tighter uppercase italic">
              Polka <span className="text-primary font-normal not-italic">Pulse</span>
            </span>
          </div>
          
          <button 
            onClick={connect}
            className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20 border border-primary/20"
          >
            {address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* LEFT: CHAT */}
          <section className="flex flex-col gap-6">
            <div className="flex items-end justify-between px-2">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Agent Console</h1>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">
                  Engine: v3-flash // Status: Active
                </p>
              </div>
            </div>
            
            <div className="bg-secondary border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/5 min-h-[500px] flex flex-col">
              <ChatPanel messages={messages} onSend={handleSend} />
            </div>
          </section>

          {/* RIGHT: PREVIEW */}
          <section className="flex flex-col gap-6">
            <div className="px-2">
              <h2 className="text-xl font-bold tracking-tight">Transaction Preview</h2>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">
                L2: Pallet-Revive (Solidity)
              </p>
            </div>

            <div className="bg-secondary border border-white/5 rounded-[2rem] p-2 shadow-2xl shadow-primary/5 sticky top-32">
              <TransactionPreview
                preview={preview}
                onClear={() => setPreview(null)}
              />
            </div>
          </section>

        </div>
      </div>

      {/* FOOTER DECOR */}
      <div className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </main>
  );
}