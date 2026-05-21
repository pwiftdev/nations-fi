"use client";

import type { MapLabelMode } from "@/components/globe/map-label-mode";

type MapHudProps = {
  show: boolean;
  labelMode: MapLabelMode;
  onCycleLabels: () => void;
};

export function MapHud({ show, labelMode, onCycleLabels }: MapHudProps) {
  if (!show) return null;

  const labelHint =
    labelMode === "full"
      ? "Labels: full"
      : labelMode === "iso"
        ? "Labels: ISO"
        : "Labels: off";

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20">
      <button
        type="button"
        onClick={onCycleLabels}
        className="pointer-events-auto inline-flex min-h-[40px] min-w-[80px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-glass)] px-3 py-2 font-brand text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)] shadow-[var(--shadow-sm)] backdrop-blur-md transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground-secondary)] active:scale-[0.97] sm:min-h-0 sm:min-w-0"
        title={`${labelHint} — click to cycle full, ISO codes, or off`}
      >
        {labelHint}
      </button>
    </div>
  );
}
