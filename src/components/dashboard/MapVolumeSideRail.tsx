"use client";

import type { NationCoinRow } from "@/types/screener";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import { flagEmoji } from "@/lib/flags";
import { TokenAvatar } from "@/components/screener/token-avatar";

function pctClass(n: number): string {
  if (n > 0) return "text-[var(--positive)]";
  if (n < 0) return "text-[var(--negative)]";
  return "text-[var(--muted)]";
}

export function MapVolumeSideRail({
  title,
  rows,
  hoveredRowId,
  onHoverRow,
  onRowSelect,
  edge = "left",
}: {
  title: string;
  rows: NationCoinRow[];
  hoveredRowId: string | null;
  onHoverRow: (id: string | null) => void;
  onRowSelect?: (row: NationCoinRow) => void;
  edge?: "left" | "right";
}) {
  const borderClass =
    edge === "left"
      ? "border-r border-[var(--border)]"
      : "border-l border-[var(--border)]";

  return (
    <aside
      className={`flex min-h-0 min-w-0 flex-col bg-[var(--chrome-bg)] ${borderClass}`}
      aria-label={title}
    >
      <div className="shrink-0 border-b border-[var(--border)] px-3 py-3">
        <h2 className="font-brand text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-0.5 text-[10px] text-[var(--muted)]">By 24h volume</p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
        {rows.length === 0 ? (
          <li className="px-3 py-6 text-center text-[11px] text-[var(--muted)]">
            No data yet
          </li>
        ) : (
          rows.map((row, index) => {
            const active = hoveredRowId === row.id;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onMouseEnter={() => onHoverRow(row.id)}
                  onMouseLeave={() => onHoverRow(null)}
                  onClick={() => onRowSelect?.(row)}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "bg-[var(--accent-dim)]"
                      : "hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <span className="w-4 shrink-0 font-mono text-[10px] tabular-nums text-[var(--muted-faint)]">
                    {index + 1}
                  </span>
                  <TokenAvatar
                    src={row.tokenImageUrl}
                    mint={row.contractAddress ?? row.id}
                    symbol={row.baseSymbol}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1">
                      <span className="truncate text-[12px] font-semibold text-[var(--foreground)]">
                        {row.baseSymbol}
                      </span>
                      {row.category === "country" || row.mapAnchor ? (
                        <span className="text-[10px] leading-none">
                          {flagEmoji(row.nationCode)}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[10px] tabular-nums">
                      <span className="text-[var(--muted)]">
                        {formatCompactUsd(row.volume24h)}
                      </span>
                      <span className={pctClass(row.change24h)}>
                        {formatPercent(row.change24h)}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
