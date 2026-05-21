import { pumpFunTradeUrl } from "@/lib/pump-fun";

export function TradeButton({
  mint,
  compact = false,
}: {
  mint: string | undefined;
  compact?: boolean;
}) {
  if (!mint) {
    return <span className="text-[var(--muted)]">—</span>;
  }

  return (
    <a
      href={pumpFunTradeUrl(mint)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--accent-dim)] font-semibold uppercase tracking-wide text-[var(--accent)] shadow-[0_0_12px_-4px_var(--accent-glow)] transition-[background,border-color,transform,box-shadow] duration-200 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent-dim)_70%,var(--surface-3))] hover:shadow-[0_0_16px_-4px_var(--accent-glow)] active:scale-[0.97] ${
        compact
          ? "px-2 py-0.5 text-[9px]"
          : "px-2.5 py-1 text-[10px]"
      }`}
    >
      Trade
    </a>
  );
}
