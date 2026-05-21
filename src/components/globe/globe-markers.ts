import type { NationCoinRow } from "@/types/screener";

export interface GlobeMarker {
  id: string;
  lat: number;
  lng: number;
  symbol: string;
  subtitle: string;
  /** DexScreener token image for map pin when available. */
  imageUrl?: string;
}

export function coinsToGlobeMarkers(rows: NationCoinRow[]): GlobeMarker[] {
  return rows
    .filter((r): r is NationCoinRow & { mapAnchor: NonNullable<NationCoinRow["mapAnchor"]> } =>
      Boolean(r.mapAnchor),
    )
    .map((r) => ({
      id: r.id,
      lat: r.mapAnchor.lat,
      lng: r.mapAnchor.lng,
      symbol: r.baseSymbol,
      subtitle: r.nationName,
      imageUrl: r.tokenImageUrl,
    }));
}
