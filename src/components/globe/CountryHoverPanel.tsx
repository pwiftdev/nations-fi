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

function MobileTokenChip({ coin }: { coin: NationCoinRow }) {
  return (
    <li className="w-[9.25rem] shrink-0 snap-start">
      <div className="flex h-full flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)]/90 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <TokenAvatar
            src={coin.tokenImageUrl}
            mint={coin.contractAddress ?? coin.id}
            symbol={coin.baseSymbol}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-[var(--foreground)]">
              {coin.baseSymbol}
            </p>
            <p className="truncate text-[9px] text-[var(--muted)]">
              {coin.pairLabel}
            </p>
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-1 font-mono text-[10px] tabular-nums">
          <span className="text-[var(--foreground-secondary)]">
            {formatUsd(coin.priceUsd)}
          </span>
          <span className={`font-medium ${pctClass(coin.change24h)}`}>
            {formatPercent(coin.change24h)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[9px] text-[var(--muted-faint)]">
          <span>
            MC{" "}
            <span className="font-mono tabular-nums text-[var(--muted)]">
              {formatCompactUsd(coin.marketCapUsd)}
            </span>
          </span>
          <DexBadge dexLabel={coin.dexLabel} />
        </div>
      </div>
    </li>
  );
}

/** Token carousel above the mobile bottom bar (header + zoom live in bottom chrome). */
export function MobileCountrySheet({
  state,
  embedded = false,
}: {
  state: CountryHoverState;
  embedded?: boolean;
}) {
  const { displayName, coins } = state;

  const shellClass = embedded
    ? "nf-panel-pop overflow-hidden rounded-t-[var(--radius-lg)] border border-b-0 border-[var(--border-strong)] bg-[var(--surface-glass)] shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.4)] backdrop-blur-xl"
    : "nf-panel-pop pointer-events-auto absolute inset-x-3 bottom-[5.25rem] z-20 max-h-[38vh] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-glass)] shadow-[0_-8px_40px_-8px_rgba(0,0,0,0.55),var(--shadow-elevated)] backdrop-blur-xl";

  return (
    <div
      className={shellClass}
      role="dialog"
      aria-label={`Nation sector: ${displayName}`}
    >
      {!embedded ? (
        <>
          <div className="flex justify-center pt-2 pb-0.5" aria-hidden>
            <div className="h-1 w-9 rounded-full bg-[var(--border-strong)]" />
          </div>
          <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-3 py-2">
            <span className="text-xl leading-none">
              {state.iso2 ? flagEmoji(state.iso2) : "◎"}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-brand text-[14px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                {displayName}
              </h2>
              <p className="text-[10px] text-[var(--muted)]">
                {coins.length === 0
                  ? "No listed pairs"
                  : `${coins.length} listed pair${coins.length === 1 ? "" : "s"}`}
              </p>
            </div>
            {coins.length > 0 ? (
              <span className="shrink-0 rounded-full border border-[var(--border-accent)]/40 bg-[var(--accent-dim)] px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-[var(--accent)]">
                {coins.length}
              </span>
            ) : null}
          </div>
        </>
      ) : null}

      {coins.length > 0 ? (
        <ul
          className={`flex gap-2 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [-webkit-overflow-scrolling:touch] ${
            embedded ? "max-h-[min(24vh,11rem)] px-3 py-2.5" : "px-3 py-2.5"
          }`}
        >
          {coins.map((c) => (
            <MobileTokenChip key={c.id} coin={c} />
          ))}
        </ul>
      ) : embedded ? null : (
        <p className="px-3 py-3 text-center text-[11px] text-[var(--muted)]">
          No tokens mapped for this country yet.
        </p>
      )}

      {!embedded ? (
        <p className="border-t border-[var(--border)]/80 px-3 py-1.5 text-center text-[9px] tracking-wide text-[var(--muted-faint)]">
          Tap country again to filter screener
        </p>
      ) : null}
    </div>
  );
}

function DesktopCountryPanel({ state }: { state: CountryHoverState }) {
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

export function CountryHoverPanel({ state }: { state: CountryHoverState }) {
  return <DesktopCountryPanel state={state} />;
}
