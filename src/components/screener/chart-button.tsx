export function ChartButton({
  onClick,
  compact = false,
  disabled = false,
}: {
  onClick: () => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return <span className="text-[var(--muted)]">—</span>;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] font-semibold uppercase tracking-wide text-[var(--foreground-secondary)] shadow-[var(--shadow-sm)] transition-[background,border-color,transform,box-shadow] duration-200 hover:border-[var(--brand-fi)]/55 hover:bg-[var(--surface-3)] hover:text-[var(--brand-fi)] hover:shadow-[0_0_16px_-4px_rgba(240,180,41,0.32)] active:scale-[0.97] ${
        compact
          ? "px-2 py-0.5 text-[9px]"
          : "px-2.5 py-1 text-[10px]"
      }`}
    >
      Chart
    </button>
  );
}
