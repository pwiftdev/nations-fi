import type { NationCoinRow } from "@/types/screener";

const DEX_STYLES: Record<string, { label: string; className: string }> = {
  Raydium: {
    label: "RD",
    className:
      "border-amber-400/20 bg-[rgba(251,191,36,0.08)] text-amber-100/95",
  },
  Orca: {
    label: "OR",
    className:
      "border-indigo-400/20 bg-[rgba(129,140,248,0.1)] text-indigo-100/95",
  },
  Meteora: {
    label: "ME",
    className:
      "border-emerald-400/20 bg-[rgba(52,211,153,0.1)] text-emerald-100/95",
  },
};

export function DexBadge({ dexLabel }: Pick<NationCoinRow, "dexLabel">) {
  const cfg = DEX_STYLES[dexLabel] ?? {
    label: dexLabel.slice(0, 2).toUpperCase(),
    className:
      "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--muted)]",
  };
  return (
    <span
      title={dexLabel}
      className={`inline-flex h-[22px] min-w-[28px] items-center justify-center rounded-[var(--radius-sm)] border px-1.5 font-mono text-[10px] font-semibold tracking-wide transition-[transform,filter,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:shadow-[0_0_12px_-4px_rgba(255,255,255,0.12)] active:scale-95 ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
