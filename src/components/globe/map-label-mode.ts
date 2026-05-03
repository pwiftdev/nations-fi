export type MapLabelMode = "full" | "iso" | "off";

export const MAP_LABEL_STORAGE_KEY = "nf-map-label-mode-v1";

export function parseLabelMode(raw: string | null): MapLabelMode | null {
  if (raw === "full" || raw === "iso" || raw === "off") return raw;
  return null;
}
