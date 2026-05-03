import type { Feature, Geometry } from "geojson";
import {
  getName,
  getSimpleAlpha2Code,
  numericToAlpha2,
  registerLocale,
} from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

registerLocale(enLocale);

type CountryProps = { name?: string };

export type CountryPolygonFeature = Feature<Geometry, CountryProps> & {
  id?: string | number;
};

export function polygonFeatureToIso2(
  f: CountryPolygonFeature,
): string | undefined {
  if (f.id != null && f.id !== "") {
    const a2 = numericToAlpha2(String(f.id));
    if (a2) return a2;
  }
  const raw = f.properties?.name;
  if (typeof raw !== "string") return undefined;
  return getSimpleAlpha2Code(raw, "en");
}

export function countryDisplayName(
  iso2: string | undefined,
  fallback: string,
): string {
  if (!iso2) return fallback;
  return getName(iso2, "en") ?? fallback;
}
