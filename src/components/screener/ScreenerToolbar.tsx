"use client";

import type {
  ScreenerCategoryFilter,
  TokenCategoryId,
} from "@/types/token-category";
import { flagEmoji } from "@/lib/flags";
import { CategoryFilter } from "./CategoryFilter";

export interface ScreenerToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount: number;
  compact?: boolean;
  categoryFilter?: ScreenerCategoryFilter;
  categoryCounts?: Record<TokenCategoryId, number>;
  onCategoryChange?: (category: ScreenerCategoryFilter) => void;
  nationFilter?: string | null;
  nationOptions?: { code: string; name: string }[];
  onNationChange?: (iso2: string | null) => void;
}

const searchInputClass =
  "h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--input-bg)] px-3 text-[13px] text-[var(--foreground)] shadow-[var(--shadow-sm)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--muted-faint)] focus:border-[var(--border-accent)] focus:shadow-[0_0_22px_-6px_var(--accent-glow)] focus:ring-2 focus:ring-[var(--accent-ring)] md:h-8 md:rounded-[var(--radius-sm)] md:px-2.5 md:text-[12px]";

export function ScreenerToolbar({
  query,
  onQueryChange,
  resultCount,
  compact,
  categoryFilter,
  categoryCounts,
  onCategoryChange,
  nationFilter,
  nationOptions = [],
  onNationChange,
}: ScreenerToolbarProps) {
  const showNationFilter =
    nationOptions.length > 0 &&
    onNationChange &&
    (categoryFilter === "trending" || categoryFilter === "country");

  const activeNation = nationOptions.find((o) => o.code === nationFilter);

  if (compact) {
    return (
      <div className="border-b border-[var(--border)] bg-[var(--surface-1)]/40 md:bg-transparent">
        {/* ── Mobile toolbar ── */}
        <div className="flex flex-col gap-2.5 px-3 py-2.5 md:hidden">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search pair, nation, symbol…"
                className={searchInputClass}
                type="search"
                spellCheck={false}
                aria-label="Search pairs"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => onQueryChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-[11px] font-medium text-[var(--muted)] hover:text-[var(--foreground-secondary)]"
                  aria-label="Clear search"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <div
              className="flex h-10 shrink-0 flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-2.5"
              aria-live="polite"
            >
              <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--muted-faint)]">
                Results
              </span>
              <span className="font-mono text-[13px] font-semibold tabular-nums text-[var(--foreground-secondary)]">
                {resultCount}
              </span>
            </div>
          </div>

          {onCategoryChange && categoryCounts ? (
            <CategoryFilter
              value={categoryFilter ?? "trending"}
              onChange={onCategoryChange}
              counts={categoryCounts}
            />
          ) : null}

          {nationFilter && activeNation && onNationChange ? (
            <button
              type="button"
              onClick={() => onNationChange?.(null)}
              className="inline-flex min-h-[32px] w-fit items-center gap-1.5 rounded-full border border-[var(--border-accent)]/40 bg-[var(--accent-dim)] px-3 py-1 text-[11px] font-medium text-[var(--accent)]"
            >
              <span>{flagEmoji(activeNation.code)}</span>
              <span>{activeNation.name}</span>
              <span className="text-[var(--muted)]" aria-hidden>
                ×
              </span>
            </button>
          ) : null}
        </div>

        {/* ── Desktop compact (dock) toolbar ── */}
        <div className="hidden flex-col gap-2 px-3 py-2 md:flex">
          {onCategoryChange && categoryCounts ? (
            <CategoryFilter
              value={categoryFilter ?? "trending"}
              onChange={onCategoryChange}
              counts={categoryCounts}
            />
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Pair, nation, symbol…"
                className={`${searchInputClass} max-w-xl bg-[var(--input-bg)]`}
                type="search"
                spellCheck={false}
                aria-label="Search pairs"
              />
              {showNationFilter ? (
                <label className="flex shrink-0 items-center gap-1.5">
                  <span className="sr-only">Nation filter</span>
                  <select
                    value={nationFilter ?? ""}
                    onChange={(e) =>
                      onNationChange(e.target.value ? e.target.value : null)
                    }
                    className="h-8 max-w-[180px] cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--input-bg)] px-2 text-[11px] font-medium text-[var(--foreground-secondary)] outline-none transition-[border-color,box-shadow] focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
                    aria-label="Filter by nation"
                  >
                    <option value="">All nations</option>
                    {nationOptions.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
            <span
              className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--muted-faint)]"
              aria-live="polite"
            >
              {resultCount}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] bg-[var(--surface-1)]/50 px-4 py-3 lg:px-5">
      {onCategoryChange && categoryCounts ? (
        <CategoryFilter
          value={categoryFilter ?? "trending"}
          onChange={onCategoryChange}
          counts={categoryCounts}
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Search
          </span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Pair, nation, symbol…"
            className={`${searchInputClass} max-w-xl bg-[var(--surface-1)]`}
            type="search"
            spellCheck={false}
            aria-label="Search pairs"
          />
        </div>
        <div className="flex items-center gap-4 text-[12px] text-[var(--muted)]">
          <span className="hidden sm:inline">Preview data</span>
          <span className="font-mono tabular-nums text-[var(--foreground-secondary)]">
            {resultCount} pairs
          </span>
        </div>
      </div>
    </div>
  );
}
