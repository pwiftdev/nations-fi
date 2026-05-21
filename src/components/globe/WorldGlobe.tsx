"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import { NationsFiWordmark } from "@/components/layout/NationsFiWordmark";
import type { GlobeCanvasHandle, GlobeCanvasProps } from "./GlobeCanvas";

const DynamicGlobe = dynamic(
  () => import("./GlobeCanvas").then((m) => m.GlobeCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center bg-[var(--surface-0)]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative h-10 w-10 rounded-full border-2 border-[var(--border-strong)]"
            aria-hidden
          >
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent)]" />
            <div className="absolute inset-[3px] rounded-full bg-[var(--brand-fi-dim)] opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[var(--foreground-secondary)]">
              <NationsFiWordmark size="sm" className="inline-block" />
            </p>
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              Loading map…
            </p>
          </div>
        </div>
      </div>
    ),
  },
);

export const WorldGlobe = forwardRef<GlobeCanvasHandle, GlobeCanvasProps>(
  function WorldGlobe(props, ref) {
    return (
      <DynamicGlobe
        {...props}
        ref={ref}
        className="h-full w-full min-h-0"
      />
    );
  },
);

WorldGlobe.displayName = "WorldGlobe";
