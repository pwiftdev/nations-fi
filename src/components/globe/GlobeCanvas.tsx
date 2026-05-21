"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { worldMapCountries } from "@/lib/geo/world-map-110";
import {
  countryDisplayName,
  polygonFeatureToIso2,
  type CountryPolygonFeature,
} from "@/lib/geo/country-from-polygon";
import type { NationCoinRow } from "@/types/screener";
import type { GlobeMarker } from "./globe-markers";
import { MapTokenMarker } from "./MapTokenMarker";
import type { CountryHoverState } from "./CountryHoverPanel";
import type { MapLabelMode } from "@/components/globe/map-label-mode";

type PolygonDatum = Feature<Geometry, Record<string, unknown>>;

export type GlobeCanvasHandle = {
  resetView: () => void;
  flyToLngLat: (lng: number, lat: number, targetZoom?: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  focus: () => void;
};

export interface GlobeCanvasProps {
  markers: GlobeMarker[];
  highlightMarkerId: string | null;
  onMarkerHover?: (id: string | null) => void;
  allCoins: NationCoinRow[];
  onCountryHover?: (state: CountryHoverState | null) => void;
  /** When user clicks a country (after zoom-to-fit). */
  onCountryMapClick?: (iso2: string | null) => void;
  labelMode?: MapLabelMode;
  className?: string;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export const GlobeCanvas = forwardRef<GlobeCanvasHandle, GlobeCanvasProps>(
  function GlobeCanvas(
    {
      markers,
      highlightMarkerId,
      onMarkerHover,
      allCoins,
      onCountryHover,
      onCountryMapClick,
      labelMode = "full",
      className,
    },
    ref,
  ) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 480 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    pan0X: number;
    pan0Y: number;
    maxDist: number;
  } | null>(null);
  const lastPointerMaxDist = useRef(0);

  const [brokenMarkerImages, setBrokenMarkerImages] = useState<Set<string>>(
    () => new Set(),
  );
  const [hoveredRsmKey, setHoveredRsmKey] = useState<string | null>(null);
  const hoveredFeatureRef = useRef<PolygonDatum | null>(null);
  const clearHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { clientWidth, clientHeight } = el;
      setDims({
        width: Math.max(280, clientWidth),
        height: Math.max(240, clientHeight),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const projectionFit = useMemo(() => {
    const p = geoNaturalEarth1();
    p.fitExtent(
      [[10, 10], [dims.width - 10, dims.height - 10]],
      worldMapCountries,
    );
    return {
      baseScale: p.scale(),
      baseTx: p.translate()[0]!,
      baseTy: p.translate()[1]!,
    };
  }, [dims.width, dims.height]);

  const projection = useMemo(() => {
    const p = geoNaturalEarth1();
    p.scale(projectionFit.baseScale * zoom);
    p.translate([
      projectionFit.baseTx + pan.x,
      projectionFit.baseTy + pan.y,
    ]);
    return p;
  }, [projectionFit, zoom, pan.x, pan.y]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const countryPaths = useMemo(() => {
    return worldMapCountries.features.map((f, i) => {
      const d = pathGen(f);
      if (!d) return null;
      const key = `${String(f.id ?? i)}-${String((f.properties as { name?: string })?.name ?? i)}`;
      return { key, d, feature: f as PolygonDatum };
    });
  }, [pathGen]);

  const listedNationCodes = useMemo(() => {
    const s = new Set<string>();
    for (const c of allCoins) {
      if (c.nationCode) s.add(c.nationCode.toUpperCase());
    }
    return s;
  }, [allCoins]);

  const countryLabels = useMemo(() => {
    return worldMapCountries.features.map((f, i) => {
      const props = f.properties as { name?: string };
      const neName = String(props?.name ?? i);
      const key = `${String(f.id ?? i)}-${neName}`;
      let centroid: [number, number];
      try {
        const c0 = geoCentroid(f);
        centroid = [c0[0]!, c0[1]!];
      } catch {
        return null;
      }
      const pt = projection(centroid);
      if (!pt || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) return null;
      let bw = 0;
      let bh = 0;
      try {
        const b = pathGen.bounds(f);
        bw = b[1][0] - b[0][0];
        bh = b[1][1] - b[0][1];
      } catch {
        return null;
      }
      const bboxDiag = Math.hypot(bw, bh);
      const poly = f as CountryPolygonFeature;
      const iso2 = polygonFeatureToIso2(poly);
      const name = countryDisplayName(iso2, neName);
      const hasListings = iso2
        ? listedNationCodes.has(iso2.toUpperCase())
        : false;
      return {
        key,
        x: pt[0],
        y: pt[1],
        name,
        iso2: iso2?.toUpperCase(),
        bboxDiag,
        hasListings,
      };
    }).filter(Boolean) as {
      key: string;
      x: number;
      y: number;
      name: string;
      iso2?: string;
      bboxDiag: number;
      hasListings: boolean;
    }[];
  }, [listedNationCodes, pathGen, projection]);

  const markerPoints = useMemo(() => {
    return markers
      .map((m) => {
        const c = projection([m.lng, m.lat]);
        if (!c) return null;
        return { ...m, cx: c[0]!, cy: c[1]! };
      })
      .filter(Boolean) as (GlobeMarker & { cx: number; cy: number })[];
  }, [markers, projection]);

  useEffect(() => {
    return () => {
      if (clearHoverTimer.current) clearTimeout(clearHoverTimer.current);
    };
  }, []);

  const flushClearHover = useCallback(() => {
    if (clearHoverTimer.current) {
      clearTimeout(clearHoverTimer.current);
      clearHoverTimer.current = null;
    }
  }, []);

  const scheduleClearHover = useCallback(() => {
    flushClearHover();
    clearHoverTimer.current = setTimeout(() => {
      hoveredFeatureRef.current = null;
      setHoveredRsmKey(null);
      onCountryHover?.(null);
      clearHoverTimer.current = null;
    }, 140);
  }, [flushClearHover, onCountryHover]);

  const onCountryPathEnter = useCallback(
    (poly: PolygonDatum, rsmKey: string) => {
      flushClearHover();
      hoveredFeatureRef.current = poly;
      setHoveredRsmKey(rsmKey);
      const f = poly as CountryPolygonFeature;
      const iso2 = polygonFeatureToIso2(f);
      const neName = String(f.properties?.name ?? "");
      const coins = allCoins.filter((c) =>
        iso2 ? c.nationCode === iso2 : c.nationName === neName,
      );
      const displayName = countryDisplayName(iso2, neName);
      onCountryHover?.({
        iso2: iso2 ?? null,
        displayName,
        coins,
      });
    },
    [allCoins, flushClearHover, onCountryHover],
  );

  const onCountryPathLeave = useCallback(() => {
    scheduleClearHover();
  }, [scheduleClearHover]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const flyToLngLat = useCallback(
    (lng: number, lat: number, targetZoom = 4.2) => {
      const Z = clamp(targetZoom, 0.5, 10);
      const cx = dims.width / 2;
      const cy = dims.height / 2;
      const pC = geoNaturalEarth1();
      pC.scale(projectionFit.baseScale * Z);
      pC.translate([projectionFit.baseTx, projectionFit.baseTy]);
      const gp = pC([lng, lat]);
      if (!gp) return;
      setZoom(Z);
      setPan({ x: cx - gp[0]!, y: cy - gp[1]! });
    },
    [dims.height, dims.width, projectionFit.baseScale, projectionFit.baseTx, projectionFit.baseTy],
  );

  useImperativeHandle(
    ref,
    () => ({
      resetView,
      flyToLngLat,
      zoomIn: () => setZoom((z) => clamp(z * 1.15, 0.5, 10)),
      zoomOut: () => setZoom((z) => clamp(z / 1.15, 0.5, 10)),
      focus: () => {
        containerRef.current?.focus({ preventScroll: true });
      },
    }),
    [flyToLngLat, resetView],
  );

  const zoomToCountry = useCallback(
    (feature: PolygonDatum) => {
      const pad = 18;
      const cx = dims.width / 2;
      const cy = dims.height / 2;
      const pFit = geoNaturalEarth1();
      try {
        pFit.fitExtent(
          [
            [pad, pad],
            [dims.width - pad, dims.height - pad],
          ],
          feature,
        );
      } catch {
        return;
      }
      const fitScale = pFit.scale();
      const [fitTx, fitTy] = pFit.translate();
      const zu = fitScale / projectionFit.baseScale;
      const nextZoom = clamp(zu, 0.5, 10);

      let nextPan: { x: number; y: number };
      if (Math.abs(nextZoom - zu) < 1e-5) {
        nextPan = {
          x: fitTx - projectionFit.baseTx,
          y: fitTy - projectionFit.baseTy,
        };
      } else {
        let centroid: [number, number];
        try {
          const c = geoCentroid(feature);
          centroid = [c[0]!, c[1]!];
        } catch {
          return;
        }
        const pC = geoNaturalEarth1();
        pC.scale(projectionFit.baseScale * nextZoom);
        pC.translate([projectionFit.baseTx, projectionFit.baseTy]);
        const gp = pC(centroid);
        if (!gp) return;
        nextPan = { x: cx - gp[0], y: cy - gp[1] };
      }

      setZoom(nextZoom);
      setPan(nextPan);
    },
    [dims.height, dims.width, projectionFit.baseScale, projectionFit.baseTx, projectionFit.baseTy],
  );

  const onCountryPathClick = useCallback(
    (e: React.MouseEvent, feature: PolygonDatum) => {
      e.stopPropagation();
      if (lastPointerMaxDist.current > 8) return;
      zoomToCountry(feature);
      const poly = feature as CountryPolygonFeature;
      const iso2 = polygonFeatureToIso2(poly);
      onCountryMapClick?.(iso2 ?? null);
    },
    [onCountryMapClick, zoomToCountry],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.06 : 1 / 1.06;
      setZoom((z) => clamp(z * factor, 0.5, 10));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement
      ) {
        return;
      }
      if (t instanceof HTMLElement && t.isContentEditable) return;
      resetView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetView]);

  const onMapKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = 42;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((z) => clamp(z * 1.12, 0.5, 10));
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom((z) => clamp(z / 1.12, 0.5, 10));
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPan((p) => ({ x: p.x - step, y: p.y }));
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setPan((p) => ({ x: p.x + step, y: p.y }));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setPan((p) => ({ x: p.x, y: p.y - step }));
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setPan((p) => ({ x: p.x, y: p.y + step }));
      }
    },
    [],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    lastPointerMaxDist.current = 0;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      pan0X: pan.x,
      pan0Y: pan.y,
      maxDist: 0,
    };
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    d.maxDist = Math.max(d.maxDist, Math.hypot(dx, dy));
    setPan({
      x: d.pan0X + dx,
      y: d.pan0Y + dy,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d) lastPointerMaxDist.current = d.maxDist;
    dragRef.current = null;
    const svg = svgRef.current;
    if (svg?.hasPointerCapture?.(e.pointerId)) {
      svg.releasePointerCapture(e.pointerId);
    }
  };

  const onPointerLeaveSvg = (e: React.PointerEvent) => {
    onPointerUp(e);
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label="Interactive world map. Use arrow keys to pan when focused, plus and minus to zoom."
      onKeyDown={onMapKeyDown}
      className={`relative touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] ${className ?? ""}`}
    >
      <svg
        ref={svgRef}
        width={dims.width}
        height={dims.height}
        className="nf-map-svg block cursor-grab bg-[var(--map-ocean-b)] active:cursor-grabbing"
        role="img"
        aria-label="World map of nation-sector listings"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeaveSvg}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <radialGradient id="nf-vignette" cx="50%" cy="50%" r="78%">
            <stop offset="62%" stopColor="rgba(0, 0, 0, 0)" />
            <stop offset="100%" stopColor="var(--map-vignette)" />
          </radialGradient>
        </defs>
        <rect width={dims.width} height={dims.height} fill="var(--map-ocean)" />
        <rect
          width={dims.width}
          height={dims.height}
          fill="url(#nf-vignette)"
          style={{ pointerEvents: "none" }}
        />
        <g className="countries">
          {countryPaths.map((row) => {
            if (!row) return null;
            const isHover = hoveredRsmKey === row.key;
            const iso2 = polygonFeatureToIso2(row.feature as CountryPolygonFeature);
            const isListed = iso2
              ? listedNationCodes.has(iso2.toUpperCase())
              : false;
            const fill = isHover
              ? "var(--map-land-hover-fill)"
              : isListed
                ? "var(--map-land-listed-fill)"
                : "var(--map-land-fill)";
            const stroke = isHover
              ? "var(--map-land-hover-stroke)"
              : isListed
                ? "var(--map-land-listed-stroke)"
                : "var(--map-land-stroke)";
            const strokeWidth = isHover ? 1.1 : isListed ? 0.8 : 0.6;
            return (
              <path
                key={row.key}
                d={row.d}
                className="nf-country-path cursor-pointer"
                onClick={(e) => onCountryPathClick(e, row.feature)}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                vectorEffect="non-scaling-stroke"
                style={{ outline: "none" }}
                onMouseEnter={() => onCountryPathEnter(row.feature, row.key)}
                onMouseLeave={onCountryPathLeave}
              />
            );
          })}
        </g>
        {labelMode !== "off" ? (
        <g className="country-labels" aria-hidden>
          {countryLabels.map((L) => {
            const isHover = hoveredRsmKey === L.key;
            const labelText =
              labelMode === "iso" ? (L.iso2 ?? "—") : L.name;
            const len = labelText.length;
            const sizeBoost = Math.min(1.8, Math.max(0, L.bboxDiag / 60));
            let fontPx = 5 + zoom * 0.85 + sizeBoost;
            if (len > 14) fontPx *= 14 / len;
            if (len > 22) fontPx *= 0.92;
            if (labelMode === "iso") fontPx = Math.max(fontPx, 6.4);
            fontPx = clamp(fontPx, 4.6, 12);
            const baseOpacity =
              0.42 +
              0.32 * Math.min(1, L.bboxDiag / 140) +
              (L.hasListings ? 0.18 : 0);
            const opacity = isHover ? 1 : clamp(baseOpacity, 0.36, 0.94);
            return (
              <text
                key={L.key}
                x={L.x}
                y={L.y}
                className={`nf-country-label ${L.hasListings ? "nf-country-label--listed" : ""} ${isHover ? "nf-country-label--hover" : ""}`}
                style={{
                  fontSize: `${fontPx}px`,
                  opacity,
                }}
              >
                {labelText}
              </text>
            );
          })}
        </g>
        ) : null}
        <g className="markers">
          {markerPoints.map((m) => (
            <MapTokenMarker
              key={m.id}
              marker={m}
              highlighted={m.id === highlightMarkerId}
              imageBroken={brokenMarkerImages.has(m.id)}
              onImageError={(id) =>
                setBrokenMarkerImages((prev) => {
                  if (prev.has(id)) return prev;
                  const next = new Set(prev);
                  next.add(id);
                  return next;
                })
              }
              onHover={(id) => onMarkerHover?.(id)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
});

GlobeCanvas.displayName = "GlobeCanvas";
