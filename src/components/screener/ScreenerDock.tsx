"use client";

import { useMemo, useState } from "react";
import type { NationCoinRow, ScreenerSortKey } from "@/types/screener";
import { formatCompactUsd } from "@/lib/format";
import { ScreenerToolbar } from "./ScreenerToolbar";
import { ScreenerTable } from "./ScreenerTable";

export interface ScreenerDockProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount: number;
  rows: NationCoinRow[];
  /** Full listed universe (ignores search/nation filters) for aggregate MC stats. */
  aggregateRows?: NationCoinRow[];
  statsLoading?: boolean;
  sortKey: ScreenerSortKey;
  sortDir: "asc" | "desc";
  onSortChange: (key: ScreenerSortKey) => void;
  hoveredRowId: string | null;
  onHoverRow: (id: string | null) => void;
  nationFilter?: string | null;
  nationOptions?: { code: string; name: string }[];
  onNationChange?: (iso2: string | null) => void;
  watchlistIds?: Set<string>;
  onToggleWatchlist?: (id: string) => void;
  onRowMapFocus?: (row: NationCoinRow) => void;
  showWatchlist?: boolean;
}

function useMcAggregates(rows: NationCoinRow[]) {
  return useMemo(() => {
    let totalMc = 0;
    let top: NationCoinRow | null = null;
    for (const r of rows) {
      const mc = r.marketCapUsd;
      if (!Number.isFinite(mc) || mc <= 0) continue;
      totalMc += mc;
      if (!top || mc > top.marketCapUsd) top = r;
    }
    return { totalMc, topByMc: top };
  }, [rows]);
}

export function ScreenerDock(props: ScreenerDockProps) {
  const [tall, setTall] = useState(false);
  const statsSource = props.aggregateRows ?? props.rows;
  const { totalMc, topByMc } = useMcAggregates(statsSource);

  return (
    <div
      className={`relative flex w-full min-w-0 shrink-0 flex-col overflow-hidden border border-[var(--border)] border-b-0 border-t-[rgba(34,211,238,0.22)] bg-transparent shadow-[0_-12px_48px_-20px_rgba(34,211,238,0.12)] transition-[max-height,box-shadow] duration-300 ease-[var(--ease-out-expo)] ${
        tall ? "max-h-[min(46vh,440px)]" : "max-h-[min(28vh,220px)]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div className="nf-dock-sheen absolute inset-0 opacity-[0.16]" />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent motion-safe:animate-[nf-dock-topline_4s_ease-in-out_infinite]"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 border-b border-[var(--border)] bg-[var(--screener-band)] px-3 py-2.5 backdrop-blur-[2px] sm:grid-cols-[auto_minmax(0,1fr)_auto]">
          <span className="col-start-1 row-start-1 shrink-0 bg-gradient-to-r from-[var(--foreground-secondary)] to-[var(--accent)]/90 bg-clip-text font-brand text-[11px] font-semibold uppercase tracking-[0.16em] text-transparent">
            Screener
          </span>
          <button
            type="button"
            aria-expanded={tall}
            aria-controls="nf-screener-dock-body"
            onClick={() => setTall((v) => !v)}
            className="col-start-2 row-start-1 justify-self-end rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)] transition-[background,border-color,color,transform,box-shadow] duration-200 hover:border-[var(--border-accent)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground-secondary)] hover:shadow-[0_0_16px_-4px_rgba(34,211,238,0.25)] active:scale-[0.97] sm:col-start-3 sm:row-start-1 sm:justify-self-auto"
          >
            {tall ? "Collapse" : "Expand"}
          </button>
          <div className="col-span-2 row-start-2 flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-[var(--border)]/60 pt-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:border-t-0 sm:justify-start sm:pt-0">
            {props.statsLoading ? (
              <span className="text-[10px] text-[var(--muted)]">Loading totals…</span>
            ) : statsSource.length === 0 ? null : (
              <>
                <p
                  className="min-w-0 truncate text-center text-[10px] leading-snug text-[var(--muted)] sm:text-left"
                  title={
                    totalMc > 0
                      ? `Combined market cap of listed tokens: ${formatCompactUsd(totalMc)}`
                      : undefined
                  }
                >
                  <span className="font-semibold text-[var(--foreground-secondary)]">
                    Nations.Fi MC
                  </span>
                  <span className="mx-1.5 text-[var(--border)]">·</span>
                  <span className="font-medium tabular-nums text-[var(--foreground-secondary)]">
                    {totalMc > 0 ? formatCompactUsd(totalMc) : "—"}
                  </span>
                  <span className="ml-1 hidden text-[var(--muted)] lg:inline">
                    ({statsSource.length} listed)
                  </span>
                </p>
                {topByMc ? (
                  <span
                    className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-[var(--border-accent)]/35 bg-[var(--surface-2)]/90 px-2.5 py-0.5 text-[10px] shadow-[0_0_12px_-4px_rgba(34,211,238,0.2)]"
                    title={`Largest listed market cap: ${topByMc.baseSymbol} (${topByMc.nationName})`}
                  >
                    <span className="shrink-0 font-semibold uppercase tracking-wide text-[var(--accent)]">
                      Top MC
                    </span>
                    <span className="truncate font-semibold text-[var(--foreground-secondary)]">
                      {topByMc.baseSymbol}
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--muted)]">
                      {formatCompactUsd(topByMc.marketCapUsd)}
                    </span>
                  </span>
                ) : null}
              </>
            )}
          </div>
        </div>
        <div id="nf-screener-dock-body" className="flex min-h-0 flex-1 flex-col">
        <ScreenerToolbar
          query={props.query}
          onQueryChange={props.onQueryChange}
          resultCount={props.resultCount}
          compact
          nationFilter={props.nationFilter ?? null}
          nationOptions={props.nationOptions ?? []}
          onNationChange={props.onNationChange}
        />
        <div className="min-h-0 flex-1 overflow-auto">
          <ScreenerTable
            rows={props.rows}
            sortKey={props.sortKey}
            sortDir={props.sortDir}
            onSortChange={props.onSortChange}
            hoveredRowId={props.hoveredRowId}
            onHoverRow={props.onHoverRow}
            variant="compact"
            watchlistIds={props.watchlistIds}
            onToggleWatchlist={props.onToggleWatchlist}
            onRowMapFocus={props.onRowMapFocus}
            showWatchlist={props.showWatchlist}
          />
        </div>
        </div>
      </div>
    </div>
  );
}
