import type { NationCoinRow, ScreenerSortKey } from "@/types/screener";

export function sortScreenerRows(
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

export const DEFAULT_SCREENER_SORT_KEY: ScreenerSortKey = "rank";
export const DEFAULT_SCREENER_SORT_DIR: "asc" | "desc" = "asc";

export const TRENDING_SCREENER_SORT_KEY: ScreenerSortKey = "volume24h";
export const TRENDING_SCREENER_SORT_DIR: "asc" | "desc" = "desc";

export function nextSortDirForKey(key: ScreenerSortKey): "asc" | "desc" {
  return key === "rank" || key === "ageHours" ? "asc" : "desc";
}
