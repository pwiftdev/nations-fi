const DEX_ID_LABELS: Record<string, string> = {
  raydium: "Raydium",
  orca: "Orca",
  meteora: "Meteora",
  phoenix: "Phoenix",
  lifinity: "Lifinity",
  pumpfun: "Pump.fun",
  "pump.fun": "Pump.fun",
};

export function dexIdToLabel(dexId: string): string {
  const known = DEX_ID_LABELS[dexId.toLowerCase()];
  if (known) return known;
  return dexId
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
