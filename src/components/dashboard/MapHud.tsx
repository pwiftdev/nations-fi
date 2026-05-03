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
    <div className="pointer-events-none absolute bottom-16 right-3 z-20 sm:bottom-[4.5rem] sm:right-4">
      <button
        type="button"
        onClick={onCycleLabels}
        className="pointer-events-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-glass)] px-3 py-2 font-brand text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)] shadow-[var(--shadow-sm)] backdrop-blur-md transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground-secondary)]"
        title={`${labelHint} — click to cycle full, ISO codes, or off`}
      >
        {labelHint}
      </button>
    </div>
  );
}
