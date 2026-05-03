/**
 * Paste Solana mint addresses here — one per line, or separated by commas /
 * spaces. Duplicates are ignored; first occurrence wins for table rank order.
 *
 * Market data is loaded from DexScreener. Country + map pin are inferred from
 * the **symbol** (e.g. ISO-style tickers USA, FRA, GER, ESP, ARG) and from
 * **name** text (including CamelCase splits like `SpainCoin` → “Spain Coin”).
 * If a token still shows as Unassigned, add a `MINT_TO_ISO2_OVERRIDE` entry.
 */
export const LISTED_SOLANA_MINTS_RAW = `
69kdRLyP5DTRkpHraaSZAQbWmAwzF9guKjZfzMXzcbAs
F9mv7XXbrXZb1sP2JUoswbCB3WHQM4QGMFDTVfnRZMnP
8uz7r3yQq8xnwBfWCoQGAftyYKgUz8wMQWod884nerf4
52DfsNknorxogkjqecCTT3Vk2pUwZ3eMnsYKVm4z3yWy
9XRpjZjhJPeWtUymiEWn3FW7uAnMeQca14ucTWWWyP2g
`;

/** DexScreener path segment: `/tokens/v1/{chainId}/...` */
export const DEXSCREENER_CHAIN_ID = "solana" as const;

const SOLANA_MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function isSolanaMint(s: string): boolean {
  return SOLANA_MINT_RE.test(s);
}

export function parseListedSolanaMints(raw: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const parts = raw.split(/[\s,;\n\r]+/);
  for (const part of parts) {
    const m = part.trim();
    if (!isSolanaMint(m)) continue;
    if (seen.has(m)) continue;
    seen.add(m);
    out.push(m);
  }
  return out;
}

export function getListedSolanaMints(): string[] {
  return parseListedSolanaMints(LISTED_SOLANA_MINTS_RAW);
}

function normalizeOverrideMap(
  map: Record<string, string>,
): Record<string, string> {
  const o: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    const mint = k.trim().toLowerCase();
    if (!isSolanaMint(mint)) continue;
    o[mint] = v.trim().toUpperCase();
  }
  return o;
}

/**
 * Force a mint to a specific ISO2 territory code (must exist in infer-nation
 * `TERRITORY`, or use `UN` for unassigned with no map pin).
 *
 * @example { "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": "US" }
 */
export const MINT_TO_ISO2_OVERRIDE: Record<string, string> = normalizeOverrideMap(
  {
    // "So11111111111111111111111111111111111111112": "KR",
  },
);
