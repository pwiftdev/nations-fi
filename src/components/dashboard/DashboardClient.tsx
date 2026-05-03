"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { NationCoinRow, ScreenerSortKey } from "@/types/screener";
import { WorldGlobe } from "@/components/globe/WorldGlobe";
import type { GlobeCanvasHandle } from "@/components/globe/GlobeCanvas";
import { coinsToGlobeMarkers } from "@/components/globe/globe-markers";
import {
  CountryHoverPanel,
  type CountryHoverState,
} from "@/components/globe/CountryHoverPanel";
import { ScreenerDock } from "@/components/screener/ScreenerDock";
import { MapHud } from "@/components/dashboard/MapHud";
import { FEATURES } from "@/config/features";
import {
  MAP_LABEL_STORAGE_KEY,
  type MapLabelMode,
  parseLabelMode,
} from "@/components/globe/map-label-mode";
import { getWatchlistIds, toggleWatchlistId } from "@/lib/watchlist";

function sortRows(
  rows: NationCoinRow[],
  key: ScreenerSortKey,
  dir: "asc" | "desc",
): NationCoinRow[] {
  const mul = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (typeof va === "number" && typeof vb === "number") {
      return (va - vb) * mul;
    }
    return 0;
  });
}

function filterRows(rows: NationCoinRow[], q: string): NationCoinRow[] {
  const s = q.trim().toLowerCase();
  if (!s) return rows;
  return rows.filter(
    (r) =>
      r.baseSymbol.toLowerCase().includes(s) ||
      r.pairLabel.toLowerCase().includes(s) ||
      r.nationName.toLowerCase().includes(s) ||
      r.nationCode.toLowerCase().includes(s) ||
      (r.contractAddress?.toLowerCase().includes(s) ?? false),
  );
}

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const globeRef = useRef<GlobeCanvasHandle>(null);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<ScreenerSortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [countryHover, setCountryHover] = useState<CountryHoverState | null>(
    null,
  );
  const [labelMode, setLabelMode] = useState<MapLabelMode>(() => {
    if (typeof window === "undefined") return "full";
    return (
      parseLabelMode(window.localStorage.getItem(MAP_LABEL_STORAGE_KEY)) ??
      "full"
    );
  });
  const [watchlistTick, setWatchlistTick] = useState(0);
  const [coins, setCoins] = useState<NationCoinRow[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [coinsError, setCoinsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCoinsLoading(true);
      setCoinsError(null);
      try {
        const res = await fetch("/api/dexscreener/tokens", {
          cache: "no-store",
        });
        const body: unknown = await res.json();
        const parsed = body as { rows?: NationCoinRow[]; error?: string };
        if (!res.ok) {
          throw new Error(parsed.error ?? `HTTP ${res.status}`);
        }
        if (!Array.isArray(parsed.rows)) {
          throw new Error("Invalid response");
        }
        if (!cancelled) {
          setCoins(parsed.rows);
        }
      } catch (e) {
        if (!cancelled) {
          setCoins([]);
          setCoinsError(e instanceof Error ? e.message : "Failed to load markets");
        }
      } finally {
        if (!cancelled) setCoinsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MAP_LABEL_STORAGE_KEY, labelMode);
  }, [labelMode]);

  const nationFilter = useMemo(() => {
    const raw = searchParams.get("nation")?.toUpperCase() ?? "";
    if (raw.length === 2 && /^[A-Z]{2}$/.test(raw)) return raw;
    return null;
  }, [searchParams]);

  const setNationFilter = useCallback(
    (code: string | null) => {
      const q = new URLSearchParams(searchParams.toString());
      if (code) q.set("nation", code);
      else q.delete("nation");
      const qs = q.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const nationOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of coins) {
      if (!m.has(r.nationCode)) m.set(r.nationCode, r.nationName);
    }
    return [...m.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [coins]);

  const filtered = useMemo(() => {
    let rows = filterRows(coins, query);
    if (nationFilter) {
      rows = rows.filter((r) => r.nationCode === nationFilter);
    }
    return rows;
  }, [coins, nationFilter, query]);

  const sorted = useMemo(
    () => sortRows(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir],
  );

  const markers = useMemo(() => coinsToGlobeMarkers(coins), [coins]);

  const highlightMarkerId =
    hoveredRowId && markers.some((m) => m.id === hoveredRowId)
      ? hoveredRowId
      : null;

  const watchlistIds = useMemo(() => {
    void watchlistTick;
    return new Set(getWatchlistIds());
  }, [watchlistTick]);

  const onSortChange = (key: ScreenerSortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "rank" || key === "ageHours" ? "asc" : "desc");
  };

  const onCountryMapClick = useCallback(
    (iso2: string | null) => {
      if (!FEATURES.showNationUrlSync) return;
      if (iso2) setNationFilter(iso2);
    },
    [setNationFilter],
  );

  const onToggleWatchlist = useCallback((id: string) => {
    if (!FEATURES.showWatchlistColumn) return;
    toggleWatchlistId(id);
    setWatchlistTick((n) => n + 1);
  }, []);

  const onRowMapFocus = useCallback((row: NationCoinRow) => {
    if (!row.mapAnchor) return;
    globeRef.current?.flyToLngLat(
      row.mapAnchor.lng,
      row.mapAnchor.lat,
      5.2,
    );
  }, []);

  const cycleLabels = useCallback(() => {
    setLabelMode((m) => (m === "full" ? "iso" : m === "iso" ? "off" : "full"));
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 bg-[var(--surface-0)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,transparent_20%,var(--surface-0)_88%)]"
          aria-hidden
        />
        <div className="nf-dashboard-aurora absolute inset-0" aria-hidden />
        <WorldGlobe
          ref={globeRef}
          markers={markers}
          highlightMarkerId={highlightMarkerId}
          onMarkerHover={setHoveredRowId}
          allCoins={coins}
          onCountryHover={setCountryHover}
          onCountryMapClick={onCountryMapClick}
          labelMode={labelMode}
        />
        {FEATURES.showMapHud ? (
          <MapHud show labelMode={labelMode} onCycleLabels={cycleLabels} />
        ) : null}
        {countryHover ? <CountryHoverPanel state={countryHover} /> : null}
        <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center px-4">
          <p className="nf-hint-float max-w-lg rounded-[var(--radius-md)] border border-[var(--border-accent)]/30 bg-[var(--surface-glass)] px-3 py-2 text-center text-[10px] leading-relaxed tracking-wide text-[var(--muted)] shadow-[0_0_24px_-8px_rgba(34,211,238,0.2)] backdrop-blur-md transition-shadow duration-500">
            <span className="font-medium text-[var(--foreground-secondary)]">
              Map
            </span>
            {" · "}
            Drag to pan · Scroll to zoom · Click country to zoom & filter · Row
            click flies to pin · Esc resets view
          </p>
        </div>
      </div>

      <div className="shrink-0 bg-[var(--surface-0)] pb-3">
        {coinsLoading && !coinsError ? (
          <p
            className="border-b border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-center text-[11px] text-[var(--muted)]"
            role="status"
          >
            Loading markets from DexScreener…
          </p>
        ) : null}
        {coinsError ? (
          <p
            className="border-b border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-center text-[11px] text-amber-200/90"
            role="status"
          >
            Could not load DexScreener data: {coinsError}
          </p>
        ) : null}
        <ScreenerDock
          query={query}
          onQueryChange={setQuery}
          resultCount={sorted.length}
          rows={sorted}
          aggregateRows={coins}
          statsLoading={coinsLoading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={onSortChange}
          hoveredRowId={hoveredRowId}
          onHoverRow={setHoveredRowId}
          nationFilter={nationFilter}
          nationOptions={nationOptions}
          onNationChange={setNationFilter}
          watchlistIds={watchlistIds}
          onToggleWatchlist={onToggleWatchlist}
          onRowMapFocus={onRowMapFocus}
          showWatchlist={FEATURES.showWatchlistColumn}
        />
      </div>
    </div>
  );
}

export function DashboardClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center font-brand text-[13px] text-[var(--muted)]">
          Loading screener…
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
