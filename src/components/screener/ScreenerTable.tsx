"use client";

import { useMemo, useState } from "react";
import type { NationCoinRow, ScreenerSortKey } from "@/types/screener";
import { getCategoryLabel } from "@/types/token-category";
import {
  formatAge,
  formatCompactUsd,
  formatPercent,
  formatUsd,
  shortenAddress,
} from "@/lib/format";
import { flagEmoji } from "@/lib/flags";
import { DexBadge } from "./dex-badge";
import { TokenAvatar } from "./token-avatar";
import { DexscreenerChartModal } from "./dexscreener-chart-modal";
import { ScreenerRowActions } from "./screener-row-actions";

function SortCaret({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  return (
    <span
      className={`ml-0.5 inline-block text-[10px] ${active ? "text-[var(--accent)]" : "text-[var(--muted)] opacity-40"}`}
      aria-hidden
    >
      {active ? (direction === "asc" ? "▲" : "▼") : "◇"}
    </span>
  );
}

export interface ScreenerTableProps {
  rows: NationCoinRow[];
  sortKey: ScreenerSortKey;
  sortDir: "asc" | "desc";
  onSortChange: (key: ScreenerSortKey) => void;
  hoveredRowId: string | null;
  onHoverRow: (id: string | null) => void;
  variant?: "full" | "compact";
  watchlistIds?: Set<string>;
  onToggleWatchlist?: (id: string) => void;
  onRowMapFocus?: (row: NationCoinRow) => void;
  showWatchlist?: boolean;
}

function pctClass(n: number): string {
  if (n > 0) return "text-[var(--positive)]";
  if (n < 0) return "text-[var(--negative)]";
  return "text-[var(--muted)]";
}

function showsNationBadge(row: NationCoinRow): boolean {
  return row.category === "country" || Boolean(row.mapAnchor);
}

const COMPACT_HEADERS_BASE: { key: ScreenerSortKey | null; label: string }[] = [
  { key: null, label: "#" },
  { key: null, label: "Nation" },
  { key: null, label: "Pair" },
  { key: "priceUsd", label: "Price" },
  { key: "change24h", label: "24H" },
  { key: "volume24h", label: "Vol" },
  { key: "marketCapUsd", label: "MC" },
  { key: null, label: "CA" },
  { key: null, label: "" },
];

export function ScreenerTable({
  rows,
  sortKey,
  sortDir,
  onSortChange,
  hoveredRowId,
  onHoverRow,
  variant = "full",
  watchlistIds = new Set<string>(),
  onToggleWatchlist,
  onRowMapFocus,
  showWatchlist = false,
}: ScreenerTableProps) {
  const [chartRow, setChartRow] = useState<NationCoinRow | null>(null);

  const fullHeaders: {
    key: ScreenerSortKey | null;
    label: string;
  }[] = [
    { key: null, label: "#" },
    { key: null, label: "Nation" },
    { key: null, label: "Pair" },
    { key: null, label: "DEX" },
    { key: "priceUsd", label: "Price" },
    { key: "change24h", label: "5M / 1H / 24H" },
    { key: null, label: "Txns" },
    { key: null, label: "Makers" },
    { key: "volume24h", label: "Volume" },
    { key: "liquidityUsd", label: "Liquidity" },
    { key: "marketCapUsd", label: "MC" },
    { key: "ageHours", label: "Age" },
    { key: null, label: "CA" },
    { key: null, label: "" },
  ];

  const compactHeaders = showWatchlist
    ? [{ key: null, label: "★" }, ...COMPACT_HEADERS_BASE]
    : COMPACT_HEADERS_BASE;

  const headers = variant === "compact" ? compactHeaders : fullHeaders;

  const toggleSort = (key: ScreenerSortKey | null) => {
    if (!key) return;
    onSortChange(key);
  };

  const colTemplateFull = useMemo(
    () =>
      "grid grid-cols-[44px_minmax(120px,1.1fr)_minmax(140px,1.2fr)_44px_minmax(88px,0.9fr)_minmax(120px,1fr)_minmax(72px,0.7fr)_minmax(56px,0.5fr)_minmax(72px,0.75fr)_minmax(72px,0.75fr)_minmax(64px,0.65fr)_52px_minmax(88px,0.85fr)_108px]",
    [],
  );

  const colTemplateCompact = useMemo(
    () =>
      showWatchlist
        ? "grid grid-cols-[28px_32px_minmax(96px,1fr)_minmax(112px,1.15fr)_minmax(76px,0.85fr)_minmax(52px,0.6fr)_minmax(68px,0.72fr)_minmax(60px,0.62fr)_minmax(72px,0.85fr)_108px]"
        : "grid grid-cols-[36px_minmax(100px,1fr)_minmax(120px,1.2fr)_minmax(80px,0.9fr)_minmax(56px,0.65fr)_minmax(72px,0.75fr)_minmax(64px,0.65fr)_minmax(72px,0.85fr)_108px]",
    [showWatchlist],
  );

  const colTemplate =
    variant === "compact" ? colTemplateCompact : colTemplateFull;

  const rowPad = variant === "compact" ? "py-1.5" : "py-2.5";
  const textMain = variant === "compact" ? "text-[12px]" : "text-[13px]";
  const textMono = variant === "compact" ? "text-[11px]" : "text-[12px]";

  const chartAddress =
    chartRow?.chartAddress ?? chartRow?.contractAddress ?? chartRow?.id;

  return (
    <>
    <DexscreenerChartModal
      open={chartRow != null}
      onClose={() => setChartRow(null)}
      symbol={chartRow?.baseSymbol ?? ""}
      pairLabel={chartRow?.pairLabel}
      chartAddress={chartAddress}
    />
    <div
      className={
        variant === "compact"
          ? showWatchlist
            ? "min-w-[860px]"
            : "min-w-[820px]"
          : "min-w-[1200px]"
      }
    >
      <div
        className={`${colTemplate} border-b border-[var(--border)] bg-gradient-to-r from-[var(--screener-band)] via-[var(--accent-secondary-dim)] to-[var(--screener-band)] px-3 py-1.5 text-left font-brand text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]`}
        role="row"
      >
        {headers.map((h) =>
          h.key ? (
            <button
              key={h.label}
              type="button"
              onClick={() => toggleSort(h.key)}
              className="group/sort flex cursor-pointer select-none items-center justify-start gap-0.5 rounded-[var(--radius-sm)] text-left transition-[color,transform,background-color] duration-200 hover:bg-[var(--accent-dim)] hover:text-[var(--foreground)] active:scale-[0.98]"
            >
              {h.label}
              <span className="transition-transform duration-200 group-hover/sort:translate-x-0.5">
                <SortCaret active={sortKey === h.key} direction={sortDir} />
              </span>
            </button>
          ) : (
            <div
              key={h.label}
              className="flex cursor-default items-center justify-start gap-0.5 text-left"
            >
              {h.label}
            </div>
          ),
        )}
      </div>

      {rows.map((row) => {
        const isHover = hoveredRowId === row.id;
        return (
          <div
            key={row.id}
            role="row"
            onMouseEnter={() => onHoverRow(row.id)}
            onMouseLeave={() => onHoverRow(null)}
            onClick={(e) => {
              if (!onRowMapFocus || !row.mapAnchor) return;
              const t = e.target as HTMLElement;
              if (t.closest("button") || t.closest("a")) return;
              onRowMapFocus(row);
            }}
            className={`${colTemplate} items-center border-b border-[var(--border)] px-3 ${rowPad} ${textMain} transition-[background-color,box-shadow] duration-200 ease-[var(--ease-out-expo)] ${
              onRowMapFocus && row.mapAnchor ? "cursor-pointer" : ""
            } ${
              isHover
                ? "bg-[var(--screener-row-hover)] shadow-[inset_3px_0_0_0_var(--screener-row-bar),0_0_28px_-14px_var(--screener-row-glow)]"
                : "bg-transparent shadow-[inset_3px_0_0_0_transparent] hover:bg-[var(--screener-row-hover)]/85 hover:shadow-[inset_3px_0_0_0_color-mix(in_srgb,var(--screener-row-bar)_45%,transparent),0_0_20px_-16px_var(--screener-row-glow)]"
            }`}
          >
            {variant === "compact" ? (
              <>
                {showWatchlist ? (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist?.(row.id);
                      }}
                      className={`rounded-[var(--radius-sm)] px-0.5 text-[13px] leading-none transition-colors ${
                        watchlistIds.has(row.id)
                          ? "text-[var(--brand-fi)] hover:text-amber-200"
                          : "text-[var(--muted)] hover:text-[var(--foreground-secondary)]"
                      }`}
                      aria-label={
                        watchlistIds.has(row.id)
                          ? "Remove from watchlist"
                          : "Add to watchlist"
                      }
                    >
                      {watchlistIds.has(row.id) ? "★" : "☆"}
                    </button>
                  </div>
                ) : null}
                <span
                  className={`font-mono text-[10px] text-[var(--muted)] tabular-nums ${textMono}`}
                >
                  {row.rank}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  {showsNationBadge(row) ? (
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="text-base leading-none"
                        title={row.nationName}
                      >
                        {flagEmoji(row.nationCode)}
                      </span>
                      <span className="truncate text-[var(--foreground)]">
                        {row.nationName}
                      </span>
                    </div>
                  ) : (
                    <span
                      className="truncate text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]/90"
                      title={getCategoryLabel(row.category)}
                    >
                      {row.categoryLabel}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <TokenAvatar
                    src={row.tokenImageUrl}
                    mint={row.contractAddress ?? row.id}
                    symbol={row.baseSymbol}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium tracking-tight text-[var(--foreground)]">
                      {row.pairLabel}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1">
                      <DexBadge dexLabel={row.dexLabel} />
                    </div>
                  </div>
                </div>
                <span
                  className={`font-mono tabular-nums text-[var(--foreground)] ${textMono}`}
                >
                  {formatUsd(row.priceUsd)}
                </span>
                <span
                  className={`font-mono tabular-nums ${textMono} ${pctClass(row.change24h)}`}
                >
                  {formatPercent(row.change24h)}
                </span>
                <span
                  className={`font-mono tabular-nums text-[var(--foreground)] ${textMono}`}
                >
                  {formatCompactUsd(row.volume24h)}
                </span>
                <span
                  className={`font-mono tabular-nums text-[var(--foreground)] ${textMono}`}
                >
                  {formatCompactUsd(row.marketCapUsd)}
                </span>
                <span className={`font-mono text-[var(--muted)] ${textMono}`}>
                  {row.contractAddress ? (
                    <span
                      className="cursor-default text-[var(--accent)]/90"
                      title={row.contractAddress}
                    >
                      {shortenAddress(row.contractAddress)}
                    </span>
                  ) : (
                    "—"
                  )}
                </span>
                <ScreenerRowActions
                  row={row}
                  compact
                  onChartClick={setChartRow}
                />
              </>
            ) : (
              <>
                <span
                  className={`font-mono text-[12px] text-[var(--muted)] tabular-nums ${textMono}`}
                >
                  {row.rank}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  {showsNationBadge(row) ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="text-lg leading-none"
                        title={row.nationName}
                      >
                        {flagEmoji(row.nationCode)}
                      </span>
                      <span className="truncate text-[13px] text-[var(--foreground)]">
                        {row.nationName}
                      </span>
                    </div>
                  ) : (
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]/90"
                      title={getCategoryLabel(row.category)}
                    >
                      {row.categoryLabel}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <TokenAvatar
                    src={row.tokenImageUrl}
                    mint={row.contractAddress ?? row.id}
                    symbol={row.baseSymbol}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium tracking-tight text-[var(--foreground)]">
                      {row.pairLabel}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {row.mapAnchor ? (
                        <span
                          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                          title="Shown on globe"
                        />
                      ) : null}
                      <span className="truncate text-[11px] text-[var(--muted)]">
                        {row.mapAnchor ? "Mapped" : "Nation pair"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <DexBadge dexLabel={row.dexLabel} />
                </div>
                <span
                  className={`font-mono tabular-nums text-[var(--foreground)] ${textMono}`}
                >
                  {formatUsd(row.priceUsd)}
                </span>
                <div
                  className={`flex flex-wrap gap-x-2 font-mono text-[11px] tabular-nums ${textMono}`}
                >
                  <span className={pctClass(row.change5m)}>
                    {formatPercent(row.change5m)}
                  </span>
                  <span className="text-[var(--muted)]">/</span>
                  <span className={pctClass(row.change1h)}>
                    {formatPercent(row.change1h)}
                  </span>
                  <span className="text-[var(--muted)]">/</span>
                  <span className={pctClass(row.change24h)}>
                    {formatPercent(row.change24h)}
                  </span>
                </div>
                <div className="font-mono text-[11px] leading-tight tabular-nums">
                  <span className="text-[var(--positive)]">
                    {row.txns24h.buys}
                  </span>
                  <span className="text-[var(--muted)]"> / </span>
                  <span className="text-[var(--negative)]">
                    {row.txns24h.sells}
                  </span>
                </div>
                <span
                  className={`font-mono tabular-nums text-[var(--foreground)] ${textMono}`}
                >
                  {row.makers24h.toLocaleString()}
                </span>
                <span
                  className={`font-mono tabular-nums text-[var(--foreground)] ${textMono}`}
                >
                  {formatCompactUsd(row.volume24h)}
                </span>
                <span
                  className={`font-mono tabular-nums text-[var(--foreground)] ${textMono}`}
                >
                  {formatCompactUsd(row.liquidityUsd)}
                </span>
                <span
                  className={`font-mono tabular-nums text-[var(--foreground)] ${textMono}`}
                >
                  {formatCompactUsd(row.marketCapUsd)}
                </span>
                <span
                  className={`font-mono text-[var(--muted)] tabular-nums ${textMono}`}
                >
                  {formatAge(row.ageHours)}
                </span>
                <span className="font-mono text-[11px] text-[var(--muted)]">
                  {row.contractAddress ? (
                    <span
                      className="cursor-default text-[var(--accent)]/90"
                      title={row.contractAddress}
                    >
                      {shortenAddress(row.contractAddress)}
                    </span>
                  ) : (
                    "—"
                  )}
                </span>
                <ScreenerRowActions row={row} onChartClick={setChartRow} />
              </>
            )}
          </div>
        );
      })}
    </div>
    </>
  );
}
