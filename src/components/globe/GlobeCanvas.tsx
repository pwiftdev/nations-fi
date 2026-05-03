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

  const [hoveredRsmKey, setHoveredRsmKey] = useState<string | null>(null);
  const [cursorGlowPct, setCursorGlowPct] = useState({ x: 50, y: 48 });
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

  const updateCursorGlow = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setCursorGlowPct({
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
    });
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d?.active) {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      d.maxDist = Math.max(d.maxDist, Math.hypot(dx, dy));
      setPan({
        x: d.pan0X + dx,
        y: d.pan0Y + dy,
      });
    } else {
      updateCursorGlow(e);
    }
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
    setCursorGlowPct({ x: 50, y: 48 });
  };

  const landSea = hoveredRsmKey
    ? {
        oceanA: "#0c2842",
        oceanB: "#071525",
        landFill: "rgba(34, 211, 238, 0.11)",
        landStroke: "rgba(94, 234, 212, 0.55)",
        landStrokeW: 1.05,
      }
    : {
        oceanA: "var(--map-ocean-a)",
        oceanB: "var(--map-ocean-b)",
        landFill: "rgba(15, 23, 42, 0.42)",
        landStroke: "rgba(148, 163, 184, 0.26)",
        landStrokeW: 0.65,
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
          <linearGradient id="nf-ocean" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={landSea.oceanA} />
            <stop offset="100%" stopColor={landSea.oceanB} />
          </linearGradient>
          <linearGradient id="nf-ocean-shimmer-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
            <stop offset="45%" stopColor="rgba(34, 211, 238, 0.14)" />
            <stop offset="55%" stopColor="rgba(252, 211, 77, 0.08)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
          </linearGradient>
          <radialGradient
            id="nf-cursor-glow"
            cx={`${cursorGlowPct.x}%`}
            cy={`${cursorGlowPct.y}%`}
            r="62%"
          >
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.22)" />
            <stop offset="38%" stopColor="rgba(34, 211, 238, 0.08)" />
            <stop offset="100%" stopColor="rgba(2, 6, 23, 0)" />
          </radialGradient>
          <radialGradient id="nf-vignette" cx="50%" cy="45%" r="75%">
            <stop offset="55%" stopColor="rgba(2, 6, 23, 0)" />
            <stop offset="100%" stopColor="rgba(2, 6, 23, 0.45)" />
          </radialGradient>
          <filter id="nf-marker-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="nf-coin-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff7d6" />
            <stop offset="22%" stopColor="#fcd34d" />
            <stop offset="48%" stopColor="#d97706" />
            <stop offset="78%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <radialGradient id="nf-coin-face" cx="38%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="28%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#eab308" />
            <stop offset="82%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#a16207" />
          </radialGradient>
          <radialGradient id="nf-coin-face-hi" cx="32%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#ecfeff" />
            <stop offset="25%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="78%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#155e75" />
          </radialGradient>
          <linearGradient
            id="nf-depth"
            gradientUnits="objectBoundingBox"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0.045)" />
            <stop offset="18%" stopColor="rgba(255,255,255,0)" />
            <stop offset="82%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </linearGradient>
        </defs>
        <rect width={dims.width} height={dims.height} fill="url(#nf-ocean)" />
        <rect
          width={dims.width}
          height={dims.height}
          fill="url(#nf-ocean-shimmer-grad)"
          className="nf-map-ocean-shimmer"
        />
        <rect
          width={dims.width}
          height={dims.height}
          fill="url(#nf-cursor-glow)"
          style={{ pointerEvents: "none" }}
        />
        <rect
          width={dims.width}
          height={dims.height}
          fill="url(#nf-vignette)"
          style={{ pointerEvents: "none" }}
        />
        <rect
          width={dims.width}
          height={dims.height}
          fill="url(#nf-depth)"
          style={{ pointerEvents: "none" }}
        />
        <g className="countries">
          {countryPaths.map((row) => {
            if (!row) return null;
            const isHover = hoveredRsmKey === row.key;
            return (
              <path
                key={row.key}
                d={row.d}
                className="nf-country-path cursor-pointer"
                onClick={(e) => onCountryPathClick(e, row.feature)}
                fill={
                  isHover
                    ? "rgba(34, 211, 238, 0.16)"
                    : hoveredRsmKey
                      ? "rgba(15, 23, 42, 0.32)"
                      : landSea.landFill
                }
                stroke={
                  isHover
                    ? "rgba(165, 243, 252, 0.88)"
                    : hoveredRsmKey
                      ? "rgba(100, 116, 139, 0.18)"
                      : landSea.landStroke
                }
                strokeWidth={isHover ? 1.25 : hoveredRsmKey ? 0.5 : landSea.landStrokeW}
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
            const dimOthers = hoveredRsmKey != null && !isHover;
            const labelText =
              labelMode === "iso" ? (L.iso2 ?? "—") : L.name;
            const len = labelText.length;
            const sizeBoost = Math.min(2.2, Math.max(0, L.bboxDiag / 55));
            let fontPx = 4.8 + zoom * 0.95 + sizeBoost;
            if (len > 14) fontPx *= 14 / len;
            if (len > 22) fontPx *= 0.92;
            if (labelMode === "iso") fontPx = Math.max(fontPx, 6.2);
            fontPx = clamp(fontPx, 4.4, 12.5);
            const baseOpacity =
              0.28 +
              0.42 * Math.min(1, L.bboxDiag / 140) +
              (L.hasListings ? 0.12 : 0) +
              (zoom > 1.35 ? 0.12 : 0);
            let opacity = isHover ? 1 : clamp(baseOpacity, 0.22, 0.92);
            if (dimOthers) opacity *= 0.32;
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
          {markerPoints.map((m) => {
            const hi = m.id === highlightMarkerId;
            const R = hi ? 10.5 : 7.8;
            const rimW = hi ? 1.35 : 1.1;
            const faceR = R * 0.74;
            const letter = (m.symbol?.trim() || "?").slice(0, 1).toUpperCase();
            const fs = R * 0.92;
            return (
              <g
                key={m.id}
                transform={`translate(${m.cx},${m.cy})`}
                className="nf-marker-root cursor-pointer"
                style={{ pointerEvents: "auto" }}
                onMouseEnter={() => onMarkerHover?.(m.id)}
                onMouseLeave={() => onMarkerHover?.(null)}
              >
                <title>{`${m.symbol} — ${m.subtitle}`}</title>
                <g className={`nf-marker-inner ${hi ? "nf-marker-inner--hot" : ""}`}>
                  {hi ? (
                    <circle
                      r={R + 3}
                      fill="none"
                      stroke="rgba(34, 211, 238, 0.55)"
                      strokeWidth={1.25}
                      style={{ pointerEvents: "none" }}
                    />
                  ) : null}
                  <circle
                    r={R}
                    fill="url(#nf-coin-rim)"
                    stroke="rgba(15, 23, 42, 0.92)"
                    strokeWidth={rimW}
                    vectorEffect="non-scaling-stroke"
                    style={{ pointerEvents: "none" }}
                  />
                  <circle
                    r={faceR}
                    fill={hi ? "url(#nf-coin-face-hi)" : "url(#nf-coin-face)"}
                    stroke="rgba(15, 23, 42, 0.22)"
                    strokeWidth={0.45}
                    vectorEffect="non-scaling-stroke"
                    style={{ pointerEvents: "none" }}
                  />
                  <circle
                    r={faceR * 0.92}
                    fill="none"
                    stroke="rgba(2, 6, 23, 0.18)"
                    strokeWidth={0.5}
                    strokeDasharray="1.8 2.8"
                    style={{ pointerEvents: "none" }}
                  />
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#0f172a"
                    stroke="rgba(255, 251, 235, 0.55)"
                    strokeWidth={0.35}
                    paintOrder="stroke fill"
                    style={{
                      pointerEvents: "none",
                      fontFamily:
                        "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
                      fontSize: `${fs}px`,
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {letter}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
});

GlobeCanvas.displayName = "GlobeCanvas";
