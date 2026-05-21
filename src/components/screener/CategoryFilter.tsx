"use client";

import type { TokenCategoryId } from "@/types/token-category";
import { TOKEN_CATEGORIES } from "@/types/token-category";

export interface CategoryFilterProps {
  value: TokenCategoryId | null;
  onChange: (category: TokenCategoryId | null) => void;
  counts: Record<TokenCategoryId, number>;
}

const chipBase =
  "shrink-0 snap-start rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-[background,border-color,color,box-shadow] duration-200 md:px-2.5 md:py-1 md:text-[10px] md:uppercase md:tracking-wide";

function chipClass(active: boolean): string {
  return active
    ? `${chipBase} border-[var(--border-accent)] bg-[var(--accent-dim)] text-[var(--accent)] shadow-[0_0_14px_-4px_var(--accent-glow)]`
    : `${chipBase} border-[var(--border)] bg-[var(--surface-2)]/80 text-[var(--muted)] hover:border-[var(--border-accent)]/50 hover:text-[var(--foreground-secondary)]`;
}

export function CategoryFilter({
  value,
  onChange,
  counts,
}: CategoryFilterProps) {
  return (
    <div
      className="-mx-3 flex gap-2 overflow-x-auto overscroll-x-contain px-3 pb-0.5 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] md:mx-0 md:flex-wrap md:overflow-visible md:gap-1.5 md:px-0 md:pb-0"
      role="tablist"
      aria-label="Token category"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={chipClass(value === null)}
      >
        All
        <span
          className={`ml-1.5 font-mono text-[10px] tabular-nums ${
            value === null
              ? "text-[var(--foreground-secondary)]"
              : "text-[var(--muted-faint)]"
          }`}
        >
          {counts.country + counts.event + counts.footballer}
        </span>
      </button>
      {TOKEN_CATEGORIES.map((cat) => {
        const active = value === cat.id;
        const count = counts[cat.id];
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(cat.id)}
            className={chipClass(active)}
          >
            <span className="md:hidden">{cat.shortLabel}</span>
            <span className="hidden md:inline">{cat.label}</span>
            <span
              className={`ml-1.5 font-mono text-[10px] tabular-nums ${
                active
                  ? "text-[var(--foreground-secondary)]"
                  : "text-[var(--muted-faint)]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
