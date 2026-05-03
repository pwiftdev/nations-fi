"use client";

export interface ScreenerToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount: number;
  compact?: boolean;
  nationFilter?: string | null;
  nationOptions?: { code: string; name: string }[];
  onNationChange?: (iso2: string | null) => void;
}

export function ScreenerToolbar({
  query,
  onQueryChange,
  resultCount,
  compact,
  nationFilter,
  nationOptions = [],
  onNationChange,
}: ScreenerToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] ${
        compact
          ? "bg-transparent px-3 py-2"
          : "bg-[var(--surface-1)]/50 px-4 py-3 lg:px-5"
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {!compact ? (
          <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Search
          </span>
        ) : null}
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Pair, nation, symbol…"
          className={`h-8 w-full max-w-xl rounded-[var(--radius-sm)] border border-[var(--border)] px-2.5 text-[12px] text-[var(--foreground)] shadow-[var(--shadow-sm)] outline-none transition-[border-color,box-shadow,transform] duration-200 placeholder:text-[var(--muted-faint)] focus:border-[var(--border-accent)] focus:shadow-[0_0_22px_-6px_rgba(34,211,238,0.35)] focus:ring-2 focus:ring-[var(--accent-ring)] focus:ring-offset-0 focus:ring-offset-transparent ${
            compact
              ? "bg-[rgba(2,6,23,0.5)]"
              : "bg-[var(--surface-0)]"
          }`}
          type="search"
          spellCheck={false}
          aria-label="Search pairs"
        />
        {compact && nationOptions.length > 0 && onNationChange ? (
          <label className="flex shrink-0 items-center gap-1.5">
            <span className="sr-only">Nation filter</span>
            <select
              value={nationFilter ?? ""}
              onChange={(e) =>
                onNationChange(e.target.value ? e.target.value : null)
              }
              className="h-8 max-w-[140px] cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-[rgba(2,6,23,0.55)] px-2 text-[11px] font-medium text-[var(--foreground-secondary)] outline-none transition-[border-color,box-shadow] focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent-ring)] sm:max-w-[180px]"
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
      {!compact ? (
        <div className="flex items-center gap-4 text-[12px] text-[var(--muted)]">
          <span className="hidden sm:inline">Preview data</span>
          <span className="font-mono tabular-nums text-[var(--foreground-secondary)]">
            {resultCount} pairs
          </span>
        </div>
      ) : (
        <span
          className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--muted-faint)]"
          aria-live="polite"
        >
          {resultCount}
        </span>
      )}
    </div>
  );
}
