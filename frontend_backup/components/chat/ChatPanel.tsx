 "use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/app/page";

type Props = {
  messages: ChatMessage[];
  onSend: (content: string) => void | Promise<void>;
};

export function ChatPanel({ messages, onSend }: Props) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const value = input.trim();
    setIsSending(true);
    setInput("");
    try {
      await onSend(value);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-[#27272A] bg-[#050505] shadow-[0_0_40px_rgba(0,0,0,0.85)]">
      <div
        ref={viewportRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-700/70"
      >
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl border px-3 py-2 text-xs font-mono shadow-[0_0_18px_rgba(0,0,0,0.9)] ${
                message.role === "user"
                  ? "border-[#E6007A] bg-[#18181B] text-white"
                  : "border-[#27272A] bg-[#111111] text-zinc-200"
              }`}
            >
              <div className="mb-1 text-[0.6rem] font-sans uppercase tracking-wide text-zinc-400">
                {message.role === "user" ? "You" : "Pulse Agent"}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {!messages.length && (
          <div className="flex h-full items-center justify-center font-mono text-[0.7rem] text-zinc-400">
            Ask anything like “Swap 25 DOT to USDT on Asset Hub and bridge to
            HydraDX”.
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-t border-[#27272A] bg-black px-3 py-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            className="min-h-[40px] max-h-[96px] flex-1 resize-none rounded-xl border border-[#27272A] bg-[#18181B] px-3 py-2 font-mono text-xs text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-[#E6007A] focus:bg-black focus:outline-none focus:ring-1 focus:ring-[#E6007A]/70"
            placeholder='e.g. "Send 10 DOT to 5F... and stake the rest"'
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#E6007A] px-4 text-xs font-medium text-white shadow-[0_0_24px_rgba(230,0,122,0.75)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Thinking…" : "Send"}
          </button>
        </div>
        <div className="mt-1 flex justify-between text-[0.65rem] text-zinc-500">
          <span>Natural language in. Pulsed intents out.</span>
          <span>SHIFT+ENTER for newline</span>
        </div>
      </form>
    </div>
  );
}

