"use client";

import { useMemo, useState } from "react";
import type { NationCoinRow, ScreenerSortKey } from "@/types/screener";
import type { TokenCategoryId } from "@/types/token-category";
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
  categoryFilter?: TokenCategoryId | null;
  categoryCounts?: Record<TokenCategoryId, number>;
  onCategoryChange?: (category: TokenCategoryId | null) => void;
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
  /**
   * dock — bottom panel under the map (desktop); expands on hover.
   * panel — full-height screener (mobile tab); always expanded, no max-height cap.
   */
  layout?: "dock" | "panel";
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
  const layout = props.layout ?? "dock";
  const isPanel = layout === "panel";

  const [hovered, setHovered] = useState(false);

  const tall = isPanel || hovered;
  const statsSource = props.aggregateRows ?? props.rows;
  const { totalMc, topByMc } = useMcAggregates(statsSource);

  const outerClass = isPanel
    ? "relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden border-0 bg-[var(--dock-bg)]"
    : `relative flex w-full min-w-0 shrink-0 flex-col overflow-hidden border border-[var(--border)] border-b-0 bg-[var(--dock-bg)]/96 shadow-[0_-18px_60px_-22px_rgba(0,0,0,0.6)] transition-[max-height,box-shadow] duration-300 ease-[var(--ease-out-expo)] ${
        tall
          ? "max-h-[min(46vh,440px)]"
          : "max-h-[min(42vh,330px)]"
      }`;

  return (
    <div
      onMouseEnter={isPanel ? undefined : () => setHovered(true)}
      onMouseLeave={isPanel ? undefined : () => setHovered(false)}
      className={outerClass}
    >
      {!isPanel ? (
        <>
          <div
            className="nf-map-dock-seam pointer-events-none absolute -top-6 left-0 right-0 z-[2] h-6"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            aria-hidden
          >
            <div className="nf-dock-sheen absolute inset-0 opacity-[0.16]" />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[var(--brand-fi)]/55 to-transparent motion-safe:animate-[nf-dock-topline_4s_ease-in-out_infinite]"
            aria-hidden
          />
        </>
      ) : null}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[var(--border)] bg-[var(--screener-band)] px-3 py-2.5 backdrop-blur-[2px]">
          <span className="shrink-0 bg-gradient-to-r from-[var(--brand-fi)] via-[var(--foreground-secondary)] to-[var(--accent)] bg-clip-text font-brand text-[11px] font-semibold uppercase tracking-[0.16em] text-transparent">
            Screener
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-3 gap-y-1.5 sm:justify-start">
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
                    className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-[var(--border-accent)]/35 bg-[var(--surface-2)]/90 px-2.5 py-0.5 text-[10px] shadow-[0_0_12px_-4px_var(--accent-glow)]"
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
            categoryFilter={props.categoryFilter ?? null}
            categoryCounts={props.categoryCounts}
            onCategoryChange={props.onCategoryChange}
            nationFilter={props.nationFilter ?? null}
            nationOptions={props.nationOptions ?? []}
            onNationChange={props.onNationChange}
          />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
