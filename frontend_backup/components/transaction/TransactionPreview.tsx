import type { ProposedTransaction } from "@/app/page";

type Props = {
  preview: ProposedTransaction | null;
  onClear: () => void;
};

const riskCopy: Record<ProposedTransaction["riskLevel"], string> = {
  low: "Low · Simple asset movement on a single chain.",
  medium: "Medium · Cross-chain or multi-hop routing.",
  high: "High · Complex XCM or elevated protocol risk."
};

export function TransactionPreview({ preview, onClear }: Props) {
  if (!preview) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#27272A] bg-[#111111] text-center">
        <p className="text-xs font-medium text-zinc-300">
          No transaction prepared yet.
        </p>
        <p className="max-w-xs text-[0.7rem] text-zinc-500">
          Describe what you want to do with your DOT or USDT. When the agent
          proposes something on-chain, the full route and risk will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-[#E6007A] bg-[#1E1E1E] p-4 shadow-[0_0_40px_rgba(230,0,122,0.45)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6007A] bg-[#E6007A]/10 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-[#F9A8D4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E6007A]" />
            {preview.intentType} · Proposed on-chain action
          </div>
          <p className="mt-3 text-xs text-zinc-200">{preview.summary}</p>
        </div>
        <button
          onClick={onClear}
          className="text-[0.7rem] text-zinc-500 hover:text-zinc-300"
        >
          Clear
        </button>
      </div>

      <div className="grid gap-2 text-xs text-zinc-200">
        <div className="flex items-center justify-between rounded-xl border border-[#27272A] bg-[#111111] px-3 py-2">
          <span className="text-zinc-400">Asset</span>
          <span className="font-medium text-white">
            {preview.amount} {preview.asset}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#27272A] bg-[#111111] px-3 py-2">
          <span className="text-zinc-400">Network</span>
          <span className="font-medium text-white">{preview.network}</span>
        </div>
        {preview.from && (
          <div className="flex items-center justify-between rounded-xl border border-[#27272A] bg-[#111111] px-3 py-2">
            <span className="text-zinc-400">From</span>
            <span className="font-mono text-[0.7rem] text-zinc-100">
              {preview.from}
            </span>
          </div>
        )}
        {preview.to && (
          <div className="flex items-center justify-between rounded-xl border border-[#27272A] bg-[#111111] px-3 py-2">
            <span className="text-zinc-400">To</span>
            <span className="font-mono text-[0.7rem] text-zinc-100">
              {preview.to}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#27272A] bg-[#111111] px-3 py-2 text-[0.7rem]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Risk</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${
                preview.riskLevel === "low"
                  ? "bg-emerald-500/10 text-emerald-300"
                  : preview.riskLevel === "medium"
                    ? "bg-amber-500/10 text-amber-300"
                    : "bg-rose-500/10 text-rose-300"
              }`}
            >
              {preview.riskLevel.toUpperCase()}
            </span>
          </div>
          <p className="max-w-xs text-zinc-500">{riskCopy[preview.riskLevel]}</p>
        </div>
        <button className="inline-flex h-9 items-center justify-center rounded-xl bg-[#E6007A] px-4 text-xs font-semibold text-white shadow-lg shadow-[#E6007A]/60 transition hover:brightness-110">
          Execute via pallet-revive
        </button>
      </div>
    </div>
  );
}

