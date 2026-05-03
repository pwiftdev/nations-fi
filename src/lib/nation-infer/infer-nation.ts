import type { MapAnchor } from "@/types/screener";

/** Display + map pin for ISO 3166-1 alpha-2 (plus UN = unassigned). */
const TERRITORY: Record<
  string,
  { nationName: string; mapAnchor?: MapAnchor }
> = {
  UN: { nationName: "Unassigned" },
  US: {
    nationName: "United States",
    mapAnchor: { lat: 39.8283, lng: -98.5795 },
  },
  GB: {
    nationName: "United Kingdom",
    mapAnchor: { lat: 54.7023, lng: -3.2766 },
  },
  JP: {
    nationName: "Japan",
    mapAnchor: { lat: 36.2048, lng: 138.2529 },
  },
  DE: {
    nationName: "Germany",
    mapAnchor: { lat: 51.1657, lng: 10.4515 },
  },
  FR: {
    nationName: "France",
    mapAnchor: { lat: 46.6034, lng: 1.8883 },
  },
  IT: {
    nationName: "Italy",
    mapAnchor: { lat: 41.8719, lng: 12.5674 },
  },
  ES: {
    nationName: "Spain",
    mapAnchor: { lat: 40.4637, lng: -3.7492 },
  },
  PT: {
    nationName: "Portugal",
    mapAnchor: { lat: 39.3999, lng: -8.2245 },
  },
  NL: {
    nationName: "Netherlands",
    mapAnchor: { lat: 52.1326, lng: 5.2913 },
  },
  BE: {
    nationName: "Belgium",
    mapAnchor: { lat: 50.5039, lng: 4.4699 },
  },
  CH: {
    nationName: "Switzerland",
    mapAnchor: { lat: 46.8182, lng: 8.2275 },
  },
  AT: {
    nationName: "Austria",
    mapAnchor: { lat: 47.5162, lng: 14.5501 },
  },
  SE: {
    nationName: "Sweden",
    mapAnchor: { lat: 60.1282, lng: 18.6435 },
  },
  NO: {
    nationName: "Norway",
    mapAnchor: { lat: 60.472, lng: 8.4689 },
  },
  DK: {
    nationName: "Denmark",
    mapAnchor: { lat: 56.2639, lng: 9.5018 },
  },
  FI: {
    nationName: "Finland",
    mapAnchor: { lat: 61.9241, lng: 25.7482 },
  },
  PL: {
    nationName: "Poland",
    mapAnchor: { lat: 51.9194, lng: 19.1451 },
  },
  CZ: {
    nationName: "Czechia",
    mapAnchor: { lat: 49.8175, lng: 15.473 },
  },
  GR: {
    nationName: "Greece",
    mapAnchor: { lat: 39.0742, lng: 21.8243 },
  },
  TR: {
    nationName: "Türkiye",
    mapAnchor: { lat: 38.9637, lng: 35.2433 },
  },
  RU: {
    nationName: "Russia",
    mapAnchor: { lat: 61.524, lng: 105.3188 },
  },
  UA: {
    nationName: "Ukraine",
    mapAnchor: { lat: 48.3794, lng: 31.1656 },
  },
  IE: {
    nationName: "Ireland",
    mapAnchor: { lat: 53.4129, lng: -8.2439 },
  },
  IN: {
    nationName: "India",
    mapAnchor: { lat: 20.5937, lng: 78.9629 },
  },
  CN: {
    nationName: "China",
    mapAnchor: { lat: 35.8617, lng: 104.1954 },
  },
  KR: {
    nationName: "South Korea",
    mapAnchor: { lat: 35.9078, lng: 127.7669 },
  },
  KP: {
    nationName: "North Korea",
    mapAnchor: { lat: 40.3399, lng: 127.5101 },
  },
  TH: {
    nationName: "Thailand",
    mapAnchor: { lat: 15.87, lng: 100.9925 },
  },
  VN: {
    nationName: "Vietnam",
    mapAnchor: { lat: 14.0583, lng: 108.2772 },
  },
  PH: {
    nationName: "Philippines",
    mapAnchor: { lat: 12.8797, lng: 121.774 },
  },
  ID: {
    nationName: "Indonesia",
    mapAnchor: { lat: -0.7893, lng: 113.9213 },
  },
  MY: {
    nationName: "Malaysia",
    mapAnchor: { lat: 4.2105, lng: 101.9758 },
  },
  SG: {
    nationName: "Singapore",
    mapAnchor: { lat: 1.3521, lng: 103.8198 },
  },
  AU: {
    nationName: "Australia",
    mapAnchor: { lat: -25.2744, lng: 133.7751 },
  },
  NZ: {
    nationName: "New Zealand",
    mapAnchor: { lat: -40.9006, lng: 174.886 },
  },
  CA: {
    nationName: "Canada",
    mapAnchor: { lat: 56.1304, lng: -106.3468 },
  },
  MX: {
    nationName: "Mexico",
    mapAnchor: { lat: 23.6345, lng: -102.5528 },
  },
  BR: {
    nationName: "Brazil",
    mapAnchor: { lat: -14.235, lng: -51.9253 },
  },
  AR: {
    nationName: "Argentina",
    mapAnchor: { lat: -38.4161, lng: -63.6167 },
  },
  CL: {
    nationName: "Chile",
    mapAnchor: { lat: -35.6751, lng: -71.543 },
  },
  CO: {
    nationName: "Colombia",
    mapAnchor: { lat: 4.5709, lng: -74.2973 },
  },
  PE: {
    nationName: "Peru",
    mapAnchor: { lat: -9.19, lng: -75.0152 },
  },
  ZA: {
    nationName: "South Africa",
    mapAnchor: { lat: -30.5595, lng: 22.9375 },
  },
  EG: {
    nationName: "Egypt",
    mapAnchor: { lat: 26.8206, lng: 30.8025 },
  },
  NG: {
    nationName: "Nigeria",
    mapAnchor: { lat: 9.082, lng: 8.6753 },
  },
  IL: {
    nationName: "Israel",
    mapAnchor: { lat: 31.0461, lng: 34.8516 },
  },
  AE: {
    nationName: "United Arab Emirates",
    mapAnchor: { lat: 23.4241, lng: 53.8478 },
  },
  SA: {
    nationName: "Saudi Arabia",
    mapAnchor: { lat: 23.8859, lng: 45.0792 },
  },
  RO: {
    nationName: "Romania",
    mapAnchor: { lat: 45.9432, lng: 24.9668 },
  },
  HU: {
    nationName: "Hungary",
    mapAnchor: { lat: 47.1625, lng: 19.5033 },
  },
};

/**
 * When the **symbol** is exactly one of these (after stripping non-letters),
 * assign that territory. Covers ISO 3166-1 alpha-3 and common trader tickers
 * (e.g. GER for Germany) where the full country name never appears as a
 * standalone word in the name ("SpainCoin", "ArgentinaCoin").
 */
const NATION_TICKER_TO_ISO2: Record<string, string> = {
  USA: "US",
  GBR: "GB",
  UK: "GB",
  FRA: "FR",
  DEU: "DE",
  GER: "DE",
  ESP: "ES",
  SPA: "ES",
  ITA: "IT",
  ARG: "AR",
  BRA: "BR",
  CHN: "CN",
  JPN: "JP",
  KOR: "KR",
  AUS: "AU",
  CAN: "CA",
  MEX: "MX",
  IND: "IN",
  ZAF: "ZA",
  NGA: "NG",
  EGY: "EG",
  ISR: "IL",
  ARE: "AE",
  SAU: "SA",
  RUS: "RU",
  UKR: "UA",
  POL: "PL",
  SWE: "SE",
  NOR: "NO",
  DNK: "DK",
  FIN: "FI",
  BEL: "BE",
  NLD: "NL",
  CHE: "CH",
  AUT: "AT",
  IRL: "IE",
  PRT: "PT",
  GRC: "GR",
  TUR: "TR",
  CZE: "CZ",
  HUN: "HU",
  ROU: "RO",
  CHL: "CL",
  COL: "CO",
  PER: "PE",
  NZL: "NZ",
  SGP: "SG",
  THA: "TH",
  VNM: "VN",
  PHL: "PH",
  IDN: "ID",
  MYS: "MY",
};

function normalizeTickerKey(symbol: string): string {
  return symbol.replace(/[^A-Za-z]/g, "").toUpperCase();
}

/** Split glued words so `\bfrance\b` can match `FranceCoin`, etc. */
function expandTokenTextForMatching(symbol: string, name: string): string {
  const raw = `${symbol} ${name}`.trim();
  const capsThenLower = raw.replace(/([A-Z\u00C0-\u017F]{2,})([a-z\u00C0-\u017F])/g, "$1 $2");
  const camel = capsThenLower.replace(
    /([a-z\u00C0-\u017F])([A-Z\u00C0-\u017F])/g,
    "$1 $2",
  );
  const digitSplit = camel
    .replace(/([0-9])([A-Za-z\u00C0-\u017F])/g, "$1 $2")
    .replace(/([A-Za-z\u00C0-\u017F])([0-9])/g, "$1 $2");
  return digitSplit.replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * First matching rule wins (list is ordered: more specific phrases before
 * ambiguous short tokens).
 */
const RULES: { iso: string; re: RegExp }[] = [
  { iso: "KR", re: /\b(south korea|korea republic|republic of korea)\b/i },
  { iso: "KP", re: /\b(north korea|dprk)\b/i },
  { iso: "NZ", re: /\bnew zealand\b/i },
  { iso: "ZA", re: /\bsouth africa\b/i },
  { iso: "AE", re: /\b(uae|united arab emirates)\b/i },
  { iso: "GB", re: /\b(united kingdom|great britain|britain|england|scotland|wales|northern ireland)\b/i },
  { iso: "US", re: /\b(united states|u\.s\.a\.?|u\.s\.|america)\b/i },
  { iso: "US", re: /\bnusa\b/i },
  { iso: "US", re: /\busa\b/i },
  { iso: "DE", re: /\b(germany|deutschland)\b/i },
  { iso: "FR", re: /\b(france|français|francais)\b/i },
  { iso: "JP", re: /\b(japan|nippon|日本)\b/i },
  { iso: "IN", re: /\b(india|bharat)\b/i },
  { iso: "CN", re: /\b(china|中国)\b/i },
  { iso: "CA", re: /\bcanada\b/i },
  { iso: "AU", re: /\baustralia\b/i },
  { iso: "BR", re: /\b(brazil|brasil)\b/i },
  { iso: "MX", re: /\b(mexico|méxico)\b/i },
  { iso: "IT", re: /\b(italy|italia)\b/i },
  { iso: "ES", re: /\b(spain|españa|espana)\b/i },
  { iso: "PT", re: /\bportugal\b/i },
  { iso: "NL", re: /\b(netherlands|holland)\b/i },
  { iso: "BE", re: /\bbelgium\b/i },
  { iso: "CH", re: /\b(switzerland|suisse|schweiz)\b/i },
  { iso: "AT", re: /\baustria\b/i },
  { iso: "SE", re: /\bsweden\b/i },
  { iso: "NO", re: /\bnorway\b/i },
  { iso: "DK", re: /\bdenmark\b/i },
  { iso: "FI", re: /\bfinland\b/i },
  { iso: "PL", re: /\bpoland\b/i },
  { iso: "CZ", re: /\b(czechia|czech republic)\b/i },
  { iso: "GR", re: /\b(greece|hellas)\b/i },
  { iso: "TR", re: /\b(türkiye|turkiye|turkey)\b/i },
  { iso: "RU", re: /\b(russia|россия)\b/i },
  { iso: "UA", re: /\bukraine\b/i },
  { iso: "IE", re: /\b(ireland|éire|eire)\b/i },
  { iso: "KR", re: /\bkorea\b/i },
  { iso: "TH", re: /\bthailand\b/i },
  { iso: "VN", re: /\bvietnam\b/i },
  { iso: "PH", re: /\bphilippines\b/i },
  { iso: "ID", re: /\bindonesia\b/i },
  { iso: "MY", re: /\bmalaysia\b/i },
  { iso: "SG", re: /\bsingapore\b/i },
  { iso: "AR", re: /\bargentina\b/i },
  { iso: "CL", re: /\bchile\b/i },
  { iso: "CO", re: /\bcolombia\b/i },
  { iso: "PE", re: /\bperu\b/i },
  { iso: "EG", re: /\begypt\b/i },
  { iso: "NG", re: /\bnigeria\b/i },
  { iso: "IL", re: /\bisrael\b/i },
  { iso: "SA", re: /\bsaudi\b/i },
  { iso: "RO", re: /\bromania\b/i },
  { iso: "HU", re: /\bhungary\b/i },
  { iso: "GB", re: /\b(^|[^a-z])uk([^a-z]|$)/i },
  { iso: "GB", re: /\bngbr\b/i },
  { iso: "JP", re: /\bnjpn\b/i },
  { iso: "DE", re: /\bndeu\b/i },
  { iso: "FR", re: /\bnfra\b/i },
  { iso: "IN", re: /\bnind\b/i },
  { iso: "KR", re: /\bnkor\b/i },
  { iso: "AU", re: /\bnaus\b/i },
  { iso: "CA", re: /\bncan\b/i },
  { iso: "MX", re: /\bnmex\b/i },
  { iso: "ZA", re: /\bnzaf\b/i },
  { iso: "BR", re: /\bnbra\b/i },
];

export function inferNationFromTokenMeta(
  symbol: string,
  name: string,
  mintAddress: string,
  iso2Overrides: Record<string, string>,
): { nationCode: string; nationName: string; mapAnchor?: MapAnchor } {
  const mintKey = mintAddress.trim().toLowerCase();
  const forced = iso2Overrides[mintKey]?.toUpperCase();
  if (forced && TERRITORY[forced]) {
    const t = TERRITORY[forced];
    return {
      nationCode: forced,
      nationName: t.nationName,
      mapAnchor: t.mapAnchor,
    };
  }

  const tickerKey = normalizeTickerKey(symbol);
  if (tickerKey.length >= 3) {
    const isoFromTicker = NATION_TICKER_TO_ISO2[tickerKey];
    if (isoFromTicker) {
      const t = TERRITORY[isoFromTicker];
      if (t) {
        return {
          nationCode: isoFromTicker,
          nationName: t.nationName,
          mapAnchor: t.mapAnchor,
        };
      }
    }
  }

  const text = expandTokenTextForMatching(symbol, name);
  for (const { iso, re } of RULES) {
    if (!re.test(text)) continue;
    const t = TERRITORY[iso];
    if (!t) continue;
    return {
      nationCode: iso,
      nationName: t.nationName,
      mapAnchor: t.mapAnchor,
    };
  }

  const u = TERRITORY.UN;
  return { nationCode: "UN", nationName: u.nationName, mapAnchor: undefined };
}
