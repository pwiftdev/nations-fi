"use client";

export type MobileHomeTab = "screener" | "map";

type MobileHomeTabsProps = {
  active: MobileHomeTab;
  onChange: (tab: MobileHomeTab) => void;
  screenerCount?: number;
};

export function MobileHomeTabs({
  active,
  onChange,
  screenerCount,
}: MobileHomeTabsProps) {
  const tabClass = (isActive: boolean) =>
    `flex-1 inline-flex min-h-[44px] items-center justify-center gap-1.5 border-b-2 px-3 text-[13px] font-semibold transition-colors ${
      isActive
        ? "border-[var(--accent)] text-[var(--foreground)]"
        : "border-transparent text-[var(--muted)] hover:text-[var(--foreground-secondary)]"
    }`;

  return (
    <div
      className="flex shrink-0 border-b border-[var(--border)] bg-[var(--surface-0)]"
      role="tablist"
      aria-label="Home sections"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === "screener"}
        className={tabClass(active === "screener")}
        onClick={() => onChange("screener")}
      >
        Screener
        {screenerCount != null ? (
          <span className="font-mono text-[11px] font-medium tabular-nums text-[var(--muted)]">
            {screenerCount}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "map"}
        className={tabClass(active === "map")}
        onClick={() => onChange("map")}
      >
        Map
      </button>
    </div>
  );
}
