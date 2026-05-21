"use client";

import { useState, type RefObject } from "react";
import type { GlobeCanvasHandle } from "@/components/globe/GlobeCanvas";
import type { CountryHoverState } from "@/components/globe/CountryHoverPanel";
import { MobileCountrySheet } from "@/components/globe/CountryHoverPanel";
import { DexscreenerChartModal } from "@/components/screener/dexscreener-chart-modal";
import type { NationCoinRow } from "@/types/screener";
import { flagEmoji } from "@/lib/flags";

type MobileMapBottomChromeProps = {
  globeRef: RefObject<GlobeCanvasHandle | null>;
  countryHover: CountryHoverState | null;
};

export function MobileMapBottomChrome({
  globeRef,
  countryHover,
}: MobileMapBottomChromeProps) {
  const [chartCoin, setChartCoin] = useState<NationCoinRow | null>(null);

  const btnClass =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] font-mono text-[17px] font-medium text-[var(--foreground-secondary)] transition-[background,transform] active:scale-[0.94] hover:bg-[var(--surface-3)]";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col"
      aria-label="Map controls"
    >
      {countryHover && countryHover.coins.length > 0 ? (
        <div className="pointer-events-auto px-3 pb-2">
          <MobileCountrySheet
            state={countryHover}
            embedded
            onChart={setChartCoin}
          />
        </div>
      ) : null}

      <div className="pointer-events-auto border-t border-[var(--border-strong)] bg-[var(--surface-glass)] shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex min-h-[52px] items-center gap-2 px-3 py-2">
          {countryHover ? (
            <div className="flex min-w-0 flex-1 items-center gap-2.5 border-r border-[var(--border)] pr-3">
              <span className="shrink-0 text-xl leading-none" aria-hidden>
                {countryHover.iso2 ? flagEmoji(countryHover.iso2) : "◎"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-brand text-[13px] font-semibold text-[var(--foreground)]">
                  {countryHover.displayName}
                </p>
                <p className="truncate text-[10px] text-[var(--muted)]">
                  {countryHover.coins.length === 0
                    ? "No listed pairs"
                    : `${countryHover.coins.length} pair${countryHover.coins.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
          ) : (
            <p className="min-w-0 flex-1 text-[10px] leading-snug text-[var(--muted)]">
              Tap a country to explore
            </p>
          )}

          <div className="flex shrink-0 items-center gap-1.5" aria-label="Map zoom">
            <button
              type="button"
              className={btnClass}
              aria-label="Zoom in"
              onClick={() => globeRef.current?.zoomIn()}
            >
              +
            </button>
            <button
              type="button"
              className={btnClass}
              aria-label="Zoom out"
              onClick={() => globeRef.current?.zoomOut()}
            >
              −
            </button>
            <button
              type="button"
              className={`${btnClass} text-[11px] tracking-wide`}
              aria-label="Reset map view"
              onClick={() => globeRef.current?.resetView()}
            >
              ⟲
            </button>
          </div>
        </div>
      </div>
      <DexscreenerChartModal
        open={chartCoin != null}
        onClose={() => setChartCoin(null)}
        symbol={chartCoin?.baseSymbol ?? ""}
        pairLabel={chartCoin?.pairLabel}
        chartAddress={
          chartCoin?.chartAddress ?? chartCoin?.contractAddress
        }
      />
    </div>
  );
}
