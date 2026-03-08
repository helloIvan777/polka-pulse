export type MockIntent = {
  action: "deposit";
  asset: "DOT" | "USDT";
  amount: string;
};

const AMOUNT_REGEX = /(\d+(\.\d+)?)/;

/// Very small, deterministic "AI" mock that turns natural language strings like
/// "Deposit 1 DOT" into a structured intent the rest of the app can consume.
export function interpretCommand(input: string): MockIntent {
  const lower = input.toLowerCase();

  const amountMatch = lower.match(AMOUNT_REGEX);
  const amount = amountMatch ? amountMatch[1] : "1";

  const asset: "DOT" | "USDT" = lower.includes("usdt") ? "USDT" : "DOT";

  // For now, everything is treated as a deposit intent. Future versions can branch
  // into swap / stake / send once the AI core is wired in.
  return {
    action: "deposit",
    asset,
    amount
  };
}

