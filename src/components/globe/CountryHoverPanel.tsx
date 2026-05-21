"use client";

import { useState } from "react";
import type { NationCoinRow } from "@/types/screener";
import {
  formatCompactUsd,
  formatPercent,
  formatUsd,
  shortenAddress,
} from "@/lib/format";
import { flagEmoji } from "@/lib/flags";
import { ChartButton } from "@/components/screener/chart-button";
import { DexscreenerChartModal } from "@/components/screener/dexscreener-chart-modal";
import { TradeButton } from "@/components/screener/trade-button";
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

function chartAddressFor(coin: NationCoinRow): string | undefined {
  return coin.chartAddress ?? coin.contractAddress;
}

function CountryTokenChip({
  coin,
  onChart,
}: {
  coin: NationCoinRow;
  onChart: (coin: NationCoinRow) => void;
}) {
  const chartAddr = chartAddressFor(coin);

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
        <div className="flex items-center justify-between gap-1.5 text-[9px] text-[var(--muted-faint)]">
          <span className="min-w-0 truncate">
            MC{" "}
            <span className="font-mono tabular-nums text-[var(--muted)]">
              {formatCompactUsd(coin.marketCapUsd)}
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <ChartButton
              compact
              disabled={!chartAddr}
              onClick={() => onChart(coin)}
            />
            <TradeButton mint={coin.contractAddress} compact />
          </div>
        </div>
      </div>
    </li>
  );
}

const TOKEN_CAROUSEL_CLASS =
  "nf-country-token-carousel flex h-full min-h-0 w-full flex-nowrap gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-3 py-2.5 pb-3 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] sm:px-4";

function CountryTokenCarousel({
  coins,
  onChart,
  className = "",
}: {
  coins: NationCoinRow[];
  onChart: (coin: NationCoinRow) => void;
  className?: string;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <ul className={`${TOKEN_CAROUSEL_CLASS} ${className}`.trim()}>
        {coins.map((c) => (
          <CountryTokenChip key={c.id} coin={c} onChart={onChart} />
        ))}
      </ul>
    </div>
  );
}

/** Token carousel above the mobile bottom bar (header + zoom live in bottom chrome). */
export function MobileCountrySheet({
  state,
  embedded = false,
  onChart,
}: {
  state: CountryHoverState;
  embedded?: boolean;
  onChart: (coin: NationCoinRow) => void;
}) {
  const { displayName, coins } = state;

  const shellClass = embedded
    ? "nf-panel-pop overflow-hidden rounded-t-[var(--radius-lg)] border border-b-0 border-[var(--border-strong)] bg-[var(--surface-glass)] shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.4)] backdrop-blur-xl"
    : "nf-panel-pop pointer-events-auto absolute inset-x-3 bottom-[5.25rem] z-20 max-h-[38vh] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-glass)] shadow-[0_-8px_40px_-8px_rgba(0,0,0,0.55),var(--shadow-elevated)] backdrop-blur-xl";

  return (
    <div
      className={`${shellClass} flex max-h-[inherit] flex-col`}
      role="dialog"
      aria-label={`Nation sector: ${displayName}`}
    >
      {!embedded ? (
        <>
          <div className="flex shrink-0 justify-center pt-2 pb-0.5" aria-hidden>
            <div className="h-1 w-9 rounded-full bg-[var(--border-strong)]" />
          </div>
          <div className="flex shrink-0 items-center gap-2.5 border-b border-[var(--border)] px-3 py-2">
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
        <CountryTokenCarousel
          coins={coins}
          onChart={onChart}
          className={embedded ? "max-h-[min(24vh,11rem)]" : undefined}
        />
      ) : embedded ? null : (
        <p className="px-3 py-3 text-center text-[11px] text-[var(--muted)]">
          No tokens mapped for this country yet.
        </p>
      )}
    </div>
  );
}

function DesktopCountryPanel({
  state,
  onDismiss,
  onChart,
}: {
  state: CountryHoverState;
  onDismiss?: () => void;
  onChart: (coin: NationCoinRow) => void;
}) {
  const { iso2, displayName, coins } = state;

  return (
    <div
      className="nf-country-panel nf-panel-pop pointer-events-auto absolute bottom-4 left-4 top-4 z-20 flex w-[min(24rem,calc(100%-2rem))] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-accent)]/35 bg-[var(--surface-glass)] shadow-[0_0_40px_-12px_var(--accent-glow),var(--shadow-elevated)] backdrop-blur-xl"
      role="dialog"
      aria-label={`Nation sector: ${displayName}`}
    >
      <div
        className="h-0.5 w-full shrink-0 bg-gradient-to-r from-[var(--accent)]/80 via-[var(--brand-fi)]/60 to-[var(--accent)]/40"
        aria-hidden
      />
      <div className="shrink-0 border-b border-[var(--border)] px-4 py-3.5">
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
                ? "No listed pairs for this territory."
                : `${coins.length} token${coins.length === 1 ? "" : "s"}`}
            </p>
          </div>
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[10px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground-secondary)]"
              aria-label="Close country panel"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      {coins.length > 0 ? (
        <ul className="min-h-0 flex-1 divide-y divide-[var(--border)] overflow-y-auto overscroll-contain">
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
                <div className="flex shrink-0 items-center gap-1">
                  <ChartButton
                    compact
                    disabled={!chartAddressFor(c)}
                    onClick={() => onChart(c)}
                  />
                  <TradeButton mint={c.contractAddress} compact />
                </div>
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
      ) : (
        <p className="flex min-h-0 flex-1 items-center justify-center px-4 py-6 text-center text-[11px] text-[var(--muted)]">
          No tokens mapped for this country yet.
        </p>
      )}
    </div>
  );
}

/** Bottom strip over the desktop map (country panel + token carousel). */
function DesktopBottomCountryPanel({
  state,
  onDismiss,
  onChart,
}: {
  state: CountryHoverState;
  onDismiss?: () => void;
  onChart: (coin: NationCoinRow) => void;
}) {
  const { iso2, displayName, coins } = state;

  return (
    <div
      className="nf-country-panel nf-panel-pop pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex h-[min(38vh,220px)] max-h-[min(38vh,220px)] flex-col overflow-hidden rounded-t-[var(--radius-lg)] border border-b-0 border-[var(--border-accent)]/35 bg-[var(--surface-glass)] shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      role="dialog"
      aria-label={`Nation sector: ${displayName}`}
    >
      <div
        className="h-0.5 w-full shrink-0 bg-gradient-to-r from-[var(--accent)]/80 via-[var(--brand-fi)]/60 to-[var(--accent)]/40"
        aria-hidden
      />
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[var(--border)] px-3 py-2 sm:px-4">
        <span className="text-xl leading-none sm:text-2xl">
          {iso2 ? flagEmoji(iso2) : "◎"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-faint)] sm:text-[10px]">
            Nation sector
          </p>
          <h2 className="truncate font-brand text-[14px] font-semibold tracking-[-0.02em] text-[var(--foreground)] sm:text-[15px]">
            {displayName}
          </h2>
          <p className="text-[10px] text-[var(--muted)]">
            {coins.length === 0
              ? "No listed pairs"
              : `${coins.length} token${coins.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[10px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground-secondary)]"
            aria-label="Close country panel"
          >
            Close
          </button>
        ) : null}
      </div>
      {coins.length > 0 ? (
        <CountryTokenCarousel coins={coins} onChart={onChart} />
      ) : (
        <p className="px-4 py-4 text-center text-[11px] text-[var(--muted)]">
          No tokens mapped for this country yet.
        </p>
      )}
    </div>
  );
}

export function CountryHoverPanel({
  state,
  onDismiss,
  layout = "side",
}: {
  state: CountryHoverState;
  onDismiss?: () => void;
  layout?: "side" | "bottom";
}) {
  const [chartCoin, setChartCoin] = useState<NationCoinRow | null>(null);

  return (
    <>
      {layout === "bottom" ? (
        <DesktopBottomCountryPanel
          state={state}
          onDismiss={onDismiss}
          onChart={setChartCoin}
        />
      ) : (
        <DesktopCountryPanel
          state={state}
          onDismiss={onDismiss}
          onChart={setChartCoin}
        />
      )}
      <DexscreenerChartModal
        open={chartCoin != null}
        onClose={() => setChartCoin(null)}
        symbol={chartCoin?.baseSymbol ?? ""}
        pairLabel={chartCoin?.pairLabel}
        chartAddress={
          chartCoin ? chartAddressFor(chartCoin) : undefined
        }
      />
    </>
  );
}
