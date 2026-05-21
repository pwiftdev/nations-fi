import type { TokenCategoryId } from "@/types/token-category";

export interface MapAnchor {
  lat: number;
  lng: number;
}

export interface NationCoinRow {
  id: string;
  rank: number;
  category: TokenCategoryId;
  categoryLabel: string;
  nationCode: string;
  nationName: string;
  pairLabel: string;
  baseSymbol: string;
  quoteSymbol: string;
  /** DexScreener CMS token image when available. */
  tokenImageUrl?: string;
  dexLabel: string;
  priceUsd: number;
  change5m: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  liquidityUsd: number;
  marketCapUsd: number;
  txns24h: { buys: number; sells: number };
  makers24h: number;
  ageHours: number;
  contractAddress?: string;
  /** DexScreener pair address for embedded chart (best-liquidity pair). */
  chartAddress?: string;
  /** Pins on the globe when present (e.g. verified nation-sector listing). */
  mapAnchor?: MapAnchor;
}

export type ScreenerSortKey =
  | "rank"
  | "marketCapUsd"
  | "volume24h"
  | "liquidityUsd"
  | "priceUsd"
  | "change24h"
  | "ageHours";
