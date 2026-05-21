"use client";

import type { NationCoinRow } from "@/types/screener";
import {
  formatCompactUsd,
  formatPercent,
  formatUsd,
  shortenAddress,
} from "@/lib/format";
import { flagEmoji } from "@/lib/flags";
import { DexBadge } from "@/components/screener/dex-badge";
import { TokenAvatar } from "@/components/screener/token-avatar";

export type CountryHoverState = {
  iso2: string | null;
  displayName: string;
  coins: NationCoinRow[];
};

function pctClass(n: number): string {
  if (n > 0) return "text-[var(--positive)]";
  if (n < 0) return "text-[var(--negative)]";
  return "text-[var(--muted)]";
}

export function CountryHoverPanel({ state }: { state: CountryHoverState }) {
  const { iso2, displayName, coins } = state;

  return (
    <div
      className="nf-panel-pop pointer-events-none absolute left-4 top-4 z-20 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-accent)]/35 bg-[var(--surface-glass)] shadow-[0_0_40px_-12px_var(--accent-glow),var(--shadow-elevated)] backdrop-blur-xl"
      role="dialog"
      aria-label={`Nation sector: ${displayName}`}
    >
      <div
        className="h-0.5 w-full bg-gradient-to-r from-[var(--accent)]/80 via-[var(--brand-fi)]/60 to-[var(--accent)]/40"
        aria-hidden
      />
      <div className="border-b border-[var(--border)] px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none drop-shadow-sm">
            {iso2 ? flagEmoji(iso2) : "◎"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-faint)]">
              Nation sector
            </p>
            <h2 className="font-brand text-[16px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
              {displayName}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
              {coins.length === 0
                ? "No listed pairs in preview data for this territory."
                : `${coins.length} listed pair${coins.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </div>

      {coins.length > 0 ? (
        <ul className="max-h-[min(50vh,320px)] divide-y divide-[var(--border)] overflow-y-auto overscroll-contain">
          {coins.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-2 border-l-2 border-transparent px-4 py-3 transition-[background-color,border-color,box-shadow] duration-200 hover:border-l-[var(--accent)]/40 hover:bg-[var(--surface-hover)] hover:shadow-[inset_0_0_20px_-12px_var(--accent-glow)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <TokenAvatar
                    src={c.tokenImageUrl}
                    mint={c.contractAddress ?? c.id}
                    symbol={c.baseSymbol}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold tracking-tight text-[var(--foreground)]">
                      {c.baseSymbol}
                    </div>
                    <div className="truncate text-[11px] text-[var(--muted)]">
                      {c.pairLabel}
                    </div>
                  </div>
                </div>
                <DexBadge dexLabel={c.dexLabel} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums">
                <span className="text-[var(--muted-faint)]">Price</span>
                <span className="text-right text-[var(--foreground-secondary)]">
                  {formatUsd(c.priceUsd)}
                </span>
                <span className="text-[var(--muted-faint)]">24h</span>
                <span className={`text-right ${pctClass(c.change24h)}`}>
                  {formatPercent(c.change24h)}
                </span>
                <span className="text-[var(--muted-faint)]">Volume</span>
                <span className="text-right text-[var(--foreground-secondary)]">
                  {formatCompactUsd(c.volume24h)}
                </span>
                <span className="text-[var(--muted-faint)]">MC</span>
                <span className="text-right text-[var(--foreground-secondary)]">
                  {formatCompactUsd(c.marketCapUsd)}
                </span>
              </div>
              {c.contractAddress ? (
                <div className="font-mono text-[10px] text-[var(--muted-faint)]">
                  <span className="text-[var(--muted-faint)]">CA </span>
                  <span
                    className="text-[var(--accent)]/95"
                    title={c.contractAddress}
                  >
                    {shortenAddress(c.contractAddress, 6, 4)}
                  </span>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
