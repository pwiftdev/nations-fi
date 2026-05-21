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
import {
  isTokenCategoryId,
  type TokenCategoryId,
} from "@/types/token-category";
import { WorldGlobe } from "@/components/globe/WorldGlobe";
import type { GlobeCanvasHandle } from "@/components/globe/GlobeCanvas";
import { coinsToGlobeMarkers } from "@/components/globe/globe-markers";
import {
  CountryHoverPanel,
  type CountryHoverState,
} from "@/components/globe/CountryHoverPanel";
import { ScreenerDock } from "@/components/screener/ScreenerDock";
import type { ScreenerDockProps } from "@/components/screener/ScreenerDock";
import { MapHud } from "@/components/dashboard/MapHud";
import { MobileMapBottomChrome } from "@/components/dashboard/MobileMapBottomChrome";
import {
  MobileHomeTabs,
  type MobileHomeTab,
} from "@/components/dashboard/MobileHomeTabs";
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
      r.categoryLabel.toLowerCase().includes(s) ||
      r.category.toLowerCase().includes(s) ||
      (r.contractAddress?.toLowerCase().includes(s) ?? false),
  );
}

function DataStatusBanners({
  loading,
  error,
}: {
  loading: boolean;
  error: string | null;
}) {
  return (
    <>
      {loading && !error ? (
        <p
          className="shrink-0 border-b border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-center text-[11px] text-[var(--muted)]"
          role="status"
        >
          Loading markets from DexScreener…
        </p>
      ) : null}
      {error ? (
        <p
          className="shrink-0 border-b border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-center text-[11px] text-amber-200/90"
          role="status"
        >
          Could not load DexScreener data: {error}
        </p>
      ) : null}
    </>
  );
}

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const globeRef = useRef<GlobeCanvasHandle>(null);

  const [mobileTab, setMobileTab] = useState<MobileHomeTab>("screener");
  const [mapMounted, setMapMounted] = useState(false);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<ScreenerSortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [countryHover, setCountryHover] = useState<CountryHoverState | null>(
    null,
  );
  const [labelMode, setLabelMode] = useState<MapLabelMode>("full");
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
    const stored = parseLabelMode(
      window.localStorage.getItem(MAP_LABEL_STORAGE_KEY),
    );
    if (stored) setLabelMode(stored);
  }, []);

  useEffect(() => {
    if (mobileTab === "map") setMapMounted(true);
  }, [mobileTab]);

  const categoryFilter = useMemo((): TokenCategoryId | null => {
    const raw = searchParams.get("category") ?? "";
    return isTokenCategoryId(raw) ? raw : null;
  }, [searchParams]);

  const setCategoryFilter = useCallback(
    (category: TokenCategoryId | null) => {
      const q = new URLSearchParams(searchParams.toString());
      if (category) q.set("category", category);
      else q.delete("category");
      if (category && category !== "country") q.delete("nation");
      const qs = q.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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

  const categoryCounts = useMemo((): Record<TokenCategoryId, number> => {
    const counts: Record<TokenCategoryId, number> = {
      country: 0,
      event: 0,
      footballer: 0,
    };
    for (const r of coins) counts[r.category] += 1;
    return counts;
  }, [coins]);

  const nationOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of coins) {
      if (!r.mapAnchor) continue;
      if (!m.has(r.nationCode)) m.set(r.nationCode, r.nationName);
    }
    return [...m.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [coins]);

  const filtered = useMemo(() => {
    let rows = filterRows(coins, query);
    if (categoryFilter) {
      rows = rows.filter((r) => r.category === categoryFilter);
    }
    if (nationFilter) {
      rows = rows.filter((r) => r.nationCode === nationFilter);
    }
    return rows;
  }, [coins, categoryFilter, nationFilter, query]);

  const aggregateForStats = useMemo(() => {
    if (!categoryFilter) return coins;
    return coins.filter((r) => r.category === categoryFilter);
  }, [coins, categoryFilter]);

  const mapCoins = useMemo(() => {
    const mappable = coins.filter((r) => Boolean(r.mapAnchor));
    if (!categoryFilter) return mappable;
    return mappable.filter((r) => r.category === categoryFilter);
  }, [coins, categoryFilter]);

  const sorted = useMemo(
    () => sortRows(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir],
  );

  const markers = useMemo(() => coinsToGlobeMarkers(mapCoins), [mapCoins]);

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

  const onCountryMapClickDesktop = useCallback(
    (iso2: string | null) => {
      if (!FEATURES.showNationUrlSync) return;
      if (iso2) setNationFilter(iso2);
    },
    [setNationFilter],
  );

  const onCountryMapClickMobile = useCallback(
    (iso2: string | null) => {
      if (!FEATURES.showNationUrlSync) return;
      if (iso2) setNationFilter(iso2);
      setMobileTab("screener");
    },
    [setNationFilter],
  );

  const onToggleWatchlist = useCallback((id: string) => {
    if (!FEATURES.showWatchlistColumn) return;
    toggleWatchlistId(id);
    setWatchlistTick((n) => n + 1);
  }, []);

  const flyToRowOnMap = useCallback((row: NationCoinRow) => {
    if (!row.mapAnchor) return;
    setMapMounted(true);
    setMobileTab("map");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        globeRef.current?.flyToLngLat(
          row.mapAnchor!.lng,
          row.mapAnchor!.lat,
          5.2,
        );
      });
    });
  }, []);

  const onRowMapFocusDesktop = useCallback((row: NationCoinRow) => {
    if (!row.mapAnchor) return;
    globeRef.current?.flyToLngLat(
      row.mapAnchor.lng,
      row.mapAnchor.lat,
      5.2,
    );
  }, []);

  const cycleLabels = useCallback(() => {
    setLabelMode((m) => {
      const next: MapLabelMode =
        m === "full" ? "iso" : m === "iso" ? "off" : "full";
      window.localStorage.setItem(MAP_LABEL_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const screenerProps: ScreenerDockProps = {
    query,
    onQueryChange: setQuery,
    resultCount: sorted.length,
    rows: sorted,
    aggregateRows: aggregateForStats,
    statsLoading: coinsLoading,
    categoryFilter,
    categoryCounts,
    onCategoryChange: setCategoryFilter,
    sortKey,
    sortDir,
    onSortChange,
    hoveredRowId,
    onHoverRow: setHoveredRowId,
    nationFilter,
    nationOptions,
    onNationChange: setNationFilter,
    watchlistIds,
    onToggleWatchlist,
    showWatchlist: FEATURES.showWatchlistColumn,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ── Mobile: screener-first with optional Map tab (md and below) ── */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <MobileHomeTabs
          active={mobileTab}
          onChange={setMobileTab}
          screenerCount={sorted.length}
        />
        <DataStatusBanners loading={coinsLoading} error={coinsError} />

        {mobileTab === "screener" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--surface-0)] pb-[env(safe-area-inset-bottom,0px)]">
            <ScreenerDock
              {...screenerProps}
              layout="panel"
              onRowMapFocus={flyToRowOnMap}
            />
          </div>
        ) : (
          <div className="relative min-h-0 flex-1 bg-[var(--map-ocean)]">
            {mapMounted ? (
              <>
                <WorldGlobe
                  ref={globeRef}
                  markers={markers}
                  highlightMarkerId={highlightMarkerId}
                  onMarkerHover={setHoveredRowId}
                  allCoins={mapCoins}
                  onCountryHover={setCountryHover}
                  onCountryMapClick={onCountryMapClickMobile}
                  labelMode={labelMode}
                />
                {FEATURES.showMapHud ? (
                  <MapHud show labelMode={labelMode} onCycleLabels={cycleLabels} />
                ) : null}
              </>
            ) : null}
            <MobileMapBottomChrome
              globeRef={globeRef}
              countryHover={countryHover}
            />
          </div>
        )}
      </div>

      {/* ── Desktop: map + bottom dock (md and up) ── */}
      <div className="hidden min-h-0 flex-1 flex-col md:flex">
        <div className="relative min-h-0 flex-1 bg-[var(--map-ocean)]">
          <WorldGlobe
            ref={globeRef}
            markers={markers}
            highlightMarkerId={highlightMarkerId}
            onMarkerHover={setHoveredRowId}
            allCoins={mapCoins}
            onCountryHover={setCountryHover}
            onCountryMapClick={onCountryMapClickDesktop}
            labelMode={labelMode}
          />
          {FEATURES.showMapHud ? (
            <MapHud show labelMode={labelMode} onCycleLabels={cycleLabels} />
          ) : null}
          {countryHover ? <CountryHoverPanel state={countryHover} /> : null}
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center px-4">
            <p className="rounded-full border border-[var(--border)] bg-[var(--surface-glass)] px-3 py-1 text-center font-mono text-[10px] tracking-wide text-[var(--muted)] backdrop-blur-md">
              Drag · Scroll to zoom · Click country to filter · Esc to reset
            </p>
          </div>
        </div>

        <div className="shrink-0 bg-[var(--surface-0)] pb-3">
          <DataStatusBanners loading={coinsLoading} error={coinsError} />
          <ScreenerDock
            {...screenerProps}
            layout="dock"
            onRowMapFocus={onRowMapFocusDesktop}
          />
        </div>
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
