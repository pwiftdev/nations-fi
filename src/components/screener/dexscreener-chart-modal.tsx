"use client";

import { useEffect, useId } from "react";
import { dexscreenerEmbedIframeSrc } from "@/lib/dexscreener/embed-url";

export interface DexscreenerChartModalProps {
  open: boolean;
  onClose: () => void;
  symbol: string;
  pairLabel?: string;
  /** Best DexScreener pair address; falls back to token mint. */
  chartAddress: string | undefined;
}

export function DexscreenerChartModal({
  open,
  onClose,
  symbol,
  pairLabel,
  chartAddress,
}: DexscreenerChartModalProps) {
  const titleId = useId();
  const embedSrc = chartAddress
    ? dexscreenerEmbedIframeSrc(chartAddress)
    : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--brand-navy)_82%,transparent)] backdrop-blur-sm"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-[min(88vh,760px)] w-full max-w-[min(1280px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-1)] shadow-[var(--shadow-elevated)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="truncate font-brand text-[15px] font-semibold tracking-tight text-[var(--foreground)]"
            >
              {symbol}
              <span className="text-[var(--muted)]"> chart</span>
            </h2>
            {pairLabel ? (
              <p className="truncate text-[11px] text-[var(--muted)]">
                {pairLabel}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground-secondary)]"
            aria-label="Close chart"
          >
            Close
          </button>
        </div>
        <div className="relative min-h-0 flex-1 bg-[var(--surface-0)]">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={`DexScreener chart for ${symbol}`}
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px] text-[var(--muted)]">
                No chart available for this token.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
