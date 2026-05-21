"use client";

import type { TokenCategoryId } from "@/types/token-category";
import { TOKEN_CATEGORIES } from "@/types/token-category";

export interface CategoryFilterProps {
  value: TokenCategoryId | null;
  onChange: (category: TokenCategoryId | null) => void;
  counts: Record<TokenCategoryId, number>;
}

export function CategoryFilter({
  value,
  onChange,
  counts,
}: CategoryFilterProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="tablist"
      aria-label="Token category"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-[background,border-color,color,box-shadow] duration-200 ${
          value === null
            ? "border-[var(--border-accent)] bg-[var(--accent-dim)] text-[var(--accent)] shadow-[0_0_14px_-4px_var(--accent-glow)]"
            : "border-[var(--border)] bg-[var(--surface-2)]/80 text-[var(--muted)] hover:border-[var(--border-accent)]/50 hover:text-[var(--foreground-secondary)]"
        }`}
      >
        All
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
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-[background,border-color,color,box-shadow] duration-200 ${
              active
                ? "border-[var(--border-accent)] bg-[var(--accent-dim)] text-[var(--accent)] shadow-[0_0_14px_-4px_var(--accent-glow)]"
                : "border-[var(--border)] bg-[var(--surface-2)]/80 text-[var(--muted)] hover:border-[var(--border-accent)]/50 hover:text-[var(--foreground-secondary)]"
            }`}
          >
            {cat.label}
            <span
              className={`ml-1 font-mono tabular-nums ${active ? "text-[var(--foreground-secondary)]" : "text-[var(--muted-faint)]"}`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
