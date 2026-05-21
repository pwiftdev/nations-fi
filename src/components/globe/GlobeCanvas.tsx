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
  dismissCountryPanel: () => void;
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
  /** Coins used for the country panel list (defaults to allCoins). Pass full screener rows. */
  countryPanelCoins?: NationCoinRow[];
  onCountryHover?: (state: CountryHoverState | null) => void;
  /** Fired when user taps/clicks a country to lock the panel open. */
  onCountryPin?: (state: CountryHoverState) => void;
  /** Fired when the locked panel is dismissed (map background, Esc, Close). */
  onCountryUnpin?: () => void;
  /** Optional: apply nation filter to screener when countryClickAction is `filter`. */
  onCountryMapClick?: (iso2: string | null) => void;
  /** `panel` — click pins country panel; `filter` — click also filters screener URL. */
  countryClickAction?: "filter" | "panel";
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
      countryPanelCoins,
      onCountryHover,
      onCountryPin,
      onCountryUnpin,
      onCountryMapClick,
      countryClickAction = "panel",
      labelMode = "full",
      className,
    },
    ref,
  ) {
  const panelTapOnly = countryClickAction === "panel";
  const panelCoinRows = countryPanelCoins ?? allCoins;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 480 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Live refs so event handlers always read the latest values without stale closures.
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;

  // ── Multi-touch tracking ───────────────────────────────────────────────────
  // Map of active pointer IDs → current client position.
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  // Previous pinch state (distance + midpoint) for incremental computation.
  const lastPinchRef = useRef<{
    dist: number;
    midX: number;
    midY: number;
  } | null>(null);

  // Single-touch drag state (incremental deltas for smooth continuous pan).
  const dragRef = useRef<{
    active: boolean;
    pointerId: number;
    lastX: number;
    lastY: number;
    maxDist: number;
  } | null>(null);
  const isDraggingRef = useRef(false);
  /** Locked country after tap/click — panel stays until user clicks elsewhere. */
  const [pinnedCountryKey, setPinnedCountryKey] = useState<string | null>(null);
  const pinnedCountryKeyRef = useRef<string | null>(null);
  pinnedCountryKeyRef.current = pinnedCountryKey;
  const pressedCountryRef = useRef<{
    key: string;
    feature: PolygonDatum;
  } | null>(null);
  // Tracks max drag distance so we can distinguish tap from drag.
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

  // Keep a ref to projectionFit so pinch handlers can always read latest values.
  const projectionFitRef = useRef(projectionFit);
  projectionFitRef.current = projectionFit;

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

  const clearHoverPreview = useCallback(() => {
    if (pinnedCountryKeyRef.current) return;
    hoveredFeatureRef.current = null;
    setHoveredRsmKey(null);
    onCountryHover?.(null);
  }, [onCountryHover]);

  const unpinCountry = useCallback(() => {
    setPinnedCountryKey(null);
    pinnedCountryKeyRef.current = null;
    pressedCountryRef.current = null;
    hoveredFeatureRef.current = null;
    setHoveredRsmKey(null);
    onCountryUnpin?.();
  }, [onCountryUnpin]);

  const scheduleClearHover = useCallback(() => {
    if (pinnedCountryKeyRef.current) return;
    flushClearHover();
    clearHoverTimer.current = setTimeout(() => {
      clearHoverPreview();
      clearHoverTimer.current = null;
    }, 140);
  }, [clearHoverPreview, flushClearHover]);

  const buildCountryHoverState = useCallback(
    (poly: PolygonDatum): CountryHoverState => {
      const f = poly as CountryPolygonFeature;
      const iso2 = polygonFeatureToIso2(f);
      const neName = String(f.properties?.name ?? "");
      const matched = panelCoinRows.filter((c) =>
        iso2
          ? c.nationCode.toUpperCase() === iso2.toUpperCase()
          : c.nationName === neName,
      );
      return {
        iso2: iso2 ?? null,
        displayName: countryDisplayName(iso2, neName),
        coins: matched,
      };
    },
    [panelCoinRows],
  );

  const pinCountry = useCallback(
    (feature: PolygonDatum, rsmKey: string) => {
      flushClearHover();
      setPinnedCountryKey(rsmKey);
      pinnedCountryKeyRef.current = rsmKey;
      hoveredFeatureRef.current = feature;
      setHoveredRsmKey(rsmKey);
      const state = buildCountryHoverState(feature);
      onCountryPin?.(state);
      onCountryHover?.(state);
      return state;
    },
    [buildCountryHoverState, flushClearHover, onCountryHover, onCountryPin],
  );

  const refreshPinnedPanel = useCallback(() => {
    if (!hoveredFeatureRef.current || !pinnedCountryKeyRef.current) return;
    const state = buildCountryHoverState(hoveredFeatureRef.current);
    onCountryPin?.(state);
    onCountryHover?.(state);
  }, [buildCountryHoverState, onCountryHover, onCountryPin]);

  useEffect(() => {
    if (!hoveredFeatureRef.current) return;
    if (pinnedCountryKeyRef.current) {
      refreshPinnedPanel();
      return;
    }
    onCountryHover?.(buildCountryHoverState(hoveredFeatureRef.current));
  }, [
    buildCountryHoverState,
    onCountryHover,
    panelCoinRows,
    refreshPinnedPanel,
  ]);

  const onCountryPathEnter = useCallback(
    (poly: PolygonDatum, rsmKey: string) => {
      if (isDraggingRef.current) return;
      if (pinnedCountryKeyRef.current) return;
      flushClearHover();
      hoveredFeatureRef.current = poly;
      setHoveredRsmKey(rsmKey);
      onCountryHover?.(buildCountryHoverState(poly));
    },
    [buildCountryHoverState, flushClearHover, onCountryHover],
  );

  const onCountryPathLeave = useCallback(() => {
    scheduleClearHover();
  }, [scheduleClearHover]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    unpinCountry();
  }, [unpinCountry]);

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

  const dismissCountryPanel = useCallback(() => {
    unpinCountry();
  }, [unpinCountry]);

  const applyZoomAtScreenPoint = useCallback(
    (screenX: number, screenY: number, scaleFactor: number) => {
      const curZoom = zoomRef.current;
      const curPan = panRef.current;
      const newZoom = clamp(curZoom * scaleFactor, 0.5, 10);
      if (Math.abs(newZoom - curZoom) < 1e-9) return;

      const zoomRatio = newZoom / curZoom;
      const pf = projectionFitRef.current;
      const newPan = {
        x:
          screenX -
          pf.baseTx -
          (screenX - pf.baseTx - curPan.x) * zoomRatio,
        y:
          screenY -
          pf.baseTy -
          (screenY - pf.baseTy - curPan.y) * zoomRatio,
      };
      setZoom(newZoom);
      setPan(newPan);
    },
    [],
  );

  const getMapCenterScreen = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      return { x: rect.width / 2, y: rect.height / 2 };
    }
    return { x: dims.width / 2, y: dims.height / 2 };
  }, [dims.width, dims.height]);

  useImperativeHandle(
    ref,
    () => ({
      resetView,
      dismissCountryPanel,
      flyToLngLat,
      zoomIn: () => {
        const { x, y } = getMapCenterScreen();
        applyZoomAtScreenPoint(x, y, 1.15);
      },
      zoomOut: () => {
        const { x, y } = getMapCenterScreen();
        applyZoomAtScreenPoint(x, y, 1 / 1.15);
      },
      focus: () => {
        containerRef.current?.focus({ preventScroll: true });
      },
    }),
    [
      applyZoomAtScreenPoint,
      dismissCountryPanel,
      flyToLngLat,
      getMapCenterScreen,
      resetView,
    ],
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

  const tryPinFromPress = useCallback(
    (feature: PolygonDatum, rsmKey: string) => {
      if (lastPointerMaxDist.current > 12) return false;
      pinCountry(feature, rsmKey);
      zoomToCountry(feature);
      if (!panelTapOnly) {
        const poly = feature as CountryPolygonFeature;
        const iso2 = polygonFeatureToIso2(poly);
        onCountryMapClick?.(iso2 ?? null);
      }
      return true;
    },
    [onCountryMapClick, panelTapOnly, pinCountry, zoomToCountry],
  );

  // ── Wheel zoom (desktop) — zoom toward cursor, keep point under cursor fixed ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.14 : 1 / 1.14;
      applyZoomAtScreenPoint(sx, sy, factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyZoomAtScreenPoint]);

  // ── Keyboard navigation ────────────────────────────────────────────────────
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
        const { x, y } = getMapCenterScreen();
        applyZoomAtScreenPoint(x, y, 1.12);
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        const { x, y } = getMapCenterScreen();
        applyZoomAtScreenPoint(x, y, 1 / 1.12);
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
    [applyZoomAtScreenPoint, getMapCenterScreen],
  );

  // ── Pointer / touch event handlers ────────────────────────────────────────

  const countryPathByKey = useMemo(() => {
    const map = new Map<string, { feature: PolygonDatum; key: string }>();
    for (const row of countryPaths) {
      if (!row) continue;
      map.set(row.key, { feature: row.feature, key: row.key });
    }
    return map;
  }, [countryPaths]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button > 0) return;

    const target = e.target as Element;
    const pathEl = target.closest(".nf-country-path");
    const panelEl = target.closest(".nf-country-panel");

    if (pathEl) {
      const key = pathEl.getAttribute("data-country-key");
      const row = key ? countryPathByKey.get(key) : undefined;
      pressedCountryRef.current = row ?? null;
    } else {
      pressedCountryRef.current = null;
      if (!panelEl) {
        if (pinnedCountryKeyRef.current) {
          unpinCountry();
        } else {
          flushClearHover();
          clearHoverPreview();
        }
      }
    }

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    containerRef.current?.setPointerCapture(e.pointerId);

    const pointerCount = pointersRef.current.size;

    if (pointerCount === 1) {
      lastPointerMaxDist.current = 0;
      isDraggingRef.current = false;
      dragRef.current = {
        active: true,
        pointerId: e.pointerId,
        lastX: e.clientX,
        lastY: e.clientY,
        maxDist: 0,
      };
      lastPinchRef.current = null;
      if (e.pointerType === "touch") e.preventDefault();
    } else if (pointerCount === 2) {
      isDraggingRef.current = true;
      dragRef.current = null;
      const pts = [...pointersRef.current.values()];
      const [p0, p1] = pts;
      if (!p0 || !p1) return;
      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      lastPinchRef.current = { dist, midX, midY };
      if (e.pointerType === "touch") e.preventDefault();
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const pointerCount = pointersRef.current.size;

    if (pointerCount >= 2 && lastPinchRef.current) {
      // ── Pinch-to-zoom ────────────────────────────────────────────────────
      const pts = [...pointersRef.current.values()];
      const [p0, p1] = pts;
      if (!p0 || !p1) return;

      const newDist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const newMidX = (p0.x + p1.x) / 2;
      const newMidY = (p0.y + p1.y) / 2;

      const prev = lastPinchRef.current;

      // Avoid division by zero on first frame.
      if (prev.dist < 1) {
        lastPinchRef.current = { dist: newDist, midX: newMidX, midY: newMidY };
        return;
      }

      const scale = newDist / prev.dist;
      const curZoom = zoomRef.current;
      const curPan = panRef.current;
      const newZoom = clamp(curZoom * scale, 0.5, 10);
      const zoomRatio = newZoom / curZoom;

      // Compute midpoint relative to the canvas container.
      const rect = containerRef.current?.getBoundingClientRect();
      const containerLeft = rect?.left ?? 0;
      const containerTop = rect?.top ?? 0;
      const prevSx = prev.midX - containerLeft;
      const prevSy = prev.midY - containerTop;
      const pf = projectionFitRef.current;

      // Keep the point under the previous midpoint fixed while zooming,
      // then translate by how much the midpoint itself moved.
      const panDx = newMidX - prev.midX;
      const panDy = newMidY - prev.midY;
      const newPanX =
        prevSx - pf.baseTx - (prevSx - pf.baseTx - curPan.x) * zoomRatio + panDx;
      const newPanY =
        prevSy - pf.baseTy - (prevSy - pf.baseTy - curPan.y) * zoomRatio + panDy;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });

      // Mark as a "drag" so the pointerUp click guard fires correctly.
      lastPointerMaxDist.current = Math.max(
        lastPointerMaxDist.current,
        Math.abs(newDist - prev.dist),
      );

      lastPinchRef.current = { dist: newDist, midX: newMidX, midY: newMidY };
      if (e.pointerType === "touch") e.preventDefault();
    } else if (pointerCount === 1) {
      const d = dragRef.current;
      if (!d?.active || d.pointerId !== e.pointerId) return;

      const dx = e.clientX - d.lastX;
      const dy = e.clientY - d.lastY;
      if (dx !== 0 || dy !== 0) {
        isDraggingRef.current = true;
        d.maxDist += Math.hypot(dx, dy);
        const nextPan = {
          x: panRef.current.x + dx,
          y: panRef.current.y + dy,
        };
        panRef.current = nextPan;
        setPan(nextPan);
        d.lastX = e.clientX;
        d.lastY = e.clientY;
      }
      if (e.pointerType === "touch") e.preventDefault();
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d?.pointerId === e.pointerId) {
      lastPointerMaxDist.current = d.maxDist;
      dragRef.current = null;
    }

    pointersRef.current.delete(e.pointerId);
    const el = containerRef.current;
    if (el?.hasPointerCapture?.(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }

    const remaining = pointersRef.current.size;

    if (remaining === 0) {
      const pressed = pressedCountryRef.current;
      const maxDist = lastPointerMaxDist.current;
      pressedCountryRef.current = null;
      dragRef.current = null;
      lastPinchRef.current = null;
      isDraggingRef.current = false;

      if (pressed && maxDist <= 12) {
        tryPinFromPress(pressed.feature, pressed.key);
      }
    } else if (remaining === 1) {
      lastPinchRef.current = null;
      lastPointerMaxDist.current = 100;
      const [remainingId, pos] = [...pointersRef.current.entries()][0] ?? [];
      if (pos != null && remainingId != null) {
        dragRef.current = {
          active: true,
          pointerId: remainingId,
          lastX: pos.x,
          lastY: pos.y,
          maxDist: 0,
        };
      }
    }
  };

  // Block native touch scrolling/zooming on the map while dragging (iOS Safari).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const blockTouch = (e: TouchEvent) => {
      if (isDraggingRef.current || pointersRef.current.size > 0) {
        e.preventDefault();
      }
    };
    el.addEventListener("touchmove", blockTouch, { passive: false });
    return () => el.removeEventListener("touchmove", blockTouch);
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label="Interactive world map. Use arrow keys to pan when focused, plus and minus to zoom."
      onKeyDown={onMapKeyDown}
      className={`relative touch-none select-none overscroll-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] ${className ?? ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onLostPointerCapture={endPointer}
    >
      <svg
        ref={svgRef}
        width={dims.width}
        height={dims.height}
        className="nf-map-svg block cursor-grab bg-[var(--map-ocean-b)] active:cursor-grabbing"
        role="img"
        aria-label="World map of nation-sector listings"
      >
        <defs>
          <linearGradient
            id="nf-ocean-depth"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--map-ocean-b)" />
            <stop offset="45%" stopColor="var(--map-ocean)" />
            <stop offset="100%" stopColor="var(--map-ocean-mid)" />
          </linearGradient>
          <radialGradient id="nf-ocean-glow" cx="48%" cy="42%" r="72%">
            <stop offset="0%" stopColor="var(--map-ocean-glow)" />
            <stop offset="55%" stopColor="rgba(8, 60, 110, 0.12)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <radialGradient id="nf-ocean-shimmer" cx="72%" cy="28%" r="45%">
            <stop offset="0%" stopColor="rgba(90, 200, 255, 0.14)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <radialGradient id="nf-vignette" cx="50%" cy="50%" r="78%">
            <stop offset="55%" stopColor="rgba(0, 0, 0, 0)" />
            <stop offset="100%" stopColor="var(--map-vignette)" />
          </radialGradient>
        </defs>
        <rect
          width={dims.width}
          height={dims.height}
          fill="url(#nf-ocean-depth)"
        />
        <rect
          width={dims.width}
          height={dims.height}
          fill="url(#nf-ocean-glow)"
          style={{ pointerEvents: "none" }}
        />
        <rect
          width={dims.width}
          height={dims.height}
          fill="url(#nf-ocean-shimmer)"
          style={{ pointerEvents: "none" }}
        />
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
            const strokeWidth = isHover ? 1.15 : isListed ? 0.85 : 0.7;
            return (
              <path
                key={row.key}
                d={row.d}
                className="nf-country-path cursor-pointer"
                data-country-key={row.key}
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
