import { getAlpha2Codes, getNames, registerLocale } from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

registerLocale(enLocale);

export type CountryOption = { code: string; name: string };

/** Sorted list of ISO 3166-1 alpha-2 countries + English display names (for forms). */
export function getCountrySelectOptions(): CountryOption[] {
  const names = getNames("en") as Record<string, string | string[]>;
  const codes = getAlpha2Codes();

  const rows: CountryOption[] = Object.keys(codes).map((code) => {
    const raw = names[code];
    const name = Array.isArray(raw) ? (raw[0] ?? code) : (raw ?? code);
    return { code, name };
  });

  return rows.sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function isValidAlpha2(code: string): boolean {
  if (!/^[A-Z]{2}$/.test(code)) return false;
  return Boolean(getAlpha2Codes()[code]);
}
