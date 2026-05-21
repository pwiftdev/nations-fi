"use client";

import { useEffect, useState } from "react";
import { isPumpFunMint, pumpFunCoinImageUrl } from "@/lib/pump-fun";
import type { GlobeMarker } from "./globe-markers";

function markerClipId(id: string): string {
  return `nf-mc-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

export function MapTokenMarker({
  marker,
  highlighted,
  imageBroken,
  onImageError,
  onHover,
}: {
  marker: GlobeMarker & { cx: number; cy: number };
  highlighted: boolean;
  imageBroken: boolean;
  onImageError: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const R = highlighted ? 10 : 7.5;
  const rimW = highlighted ? 1.25 : 0.9;
  const faceR = R * 0.84;
  const clipId = markerClipId(marker.id);
  const pumpFallback = isPumpFunMint(marker.id)
    ? pumpFunCoinImageUrl(marker.id, "64x64")
    : undefined;
  const [activeImageUrl, setActiveImageUrl] = useState(
    marker.imageUrl ?? pumpFallback,
  );
  const [imageExhausted, setImageExhausted] = useState(false);

  useEffect(() => {
    setActiveImageUrl(marker.imageUrl ?? pumpFallback);
    setImageExhausted(false);
  }, [marker.imageUrl, pumpFallback]);

  const showImage =
    Boolean(activeImageUrl) && !imageBroken && !imageExhausted;
  const letter = (marker.symbol?.trim() || "?").slice(0, 1).toUpperCase();

  return (
    <g
      transform={`translate(${marker.cx},${marker.cy})`}
      className="nf-marker-root cursor-pointer"
      style={{ pointerEvents: "auto" }}
      onMouseEnter={() => onHover(marker.id)}
      onMouseLeave={() => onHover(null)}
    >
      <title>{`${marker.symbol} — ${marker.subtitle}`}</title>
      <g
        className={`nf-marker-inner ${highlighted ? "nf-marker-inner--hot" : ""}`}
      >
        {highlighted ? (
          <circle
            r={R + 3}
            fill="none"
            stroke="var(--accent)"
            strokeOpacity={0.5}
            strokeWidth={1}
            style={{ pointerEvents: "none" }}
          />
        ) : null}
        <circle
          r={R}
          fill="var(--brand-navy)"
          fillOpacity={0.95}
          stroke={highlighted ? "var(--accent)" : "rgba(218, 232, 246, 0.55)"}
          strokeOpacity={highlighted ? 0.9 : 0.85}
          strokeWidth={rimW}
          vectorEffect="non-scaling-stroke"
          style={{ pointerEvents: "none" }}
        />
        {showImage ? (
          <>
            <defs>
              <clipPath id={clipId}>
                <circle r={faceR} />
              </clipPath>
            </defs>
            <image
              href={activeImageUrl}
              x={-faceR}
              y={-faceR}
              width={faceR * 2}
              height={faceR * 2}
              clipPath={`url(#${clipId})`}
              preserveAspectRatio="xMidYMid slice"
              style={{ pointerEvents: "none" }}
              onError={() => {
                if (
                  activeImageUrl === marker.imageUrl &&
                  pumpFallback &&
                  marker.imageUrl !== pumpFallback
                ) {
                  setActiveImageUrl(pumpFallback);
                  return;
                }
                setImageExhausted(true);
                onImageError(marker.id);
              }}
            />
          </>
        ) : (
          <>
            <circle
              r={faceR}
              fill={highlighted ? "var(--accent-dim)" : "rgba(218, 232, 246, 0.08)"}
              vectorEffect="non-scaling-stroke"
              style={{ pointerEvents: "none" }}
            />
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--foreground-secondary)"
              style={{
                pointerEvents: "none",
                fontFamily:
                  "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
                fontSize: `${R * 0.7}px`,
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              {letter}
            </text>
          </>
        )}
      </g>
    </g>
  );
}
