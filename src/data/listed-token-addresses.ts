import type { TokenCategoryId } from "@/types/token-category";
import { TOKEN_CATEGORY_BY_ID } from "@/types/token-category";
import { EVENT_MINT_ISO2 } from "@/data/event-mint-nations";
import { FOOTBALLER_MINT_ISO2 } from "@/data/footballer-mint-nations";
import {
  WORLD_CUP_MAIN_MINT,
  WORLD_CUP_NATION_MINT_ISO2,
  WORLD_CUP_NATION_MINTS,
} from "@/data/world-cup-mint-nations";

/**
 * Paste mints per category (one per line, or comma/space separated).
 * Duplicates are ignored; order within each list sets rank inside that category.
 */
export const LISTED_COUNTRY_COINS_RAW = WORLD_CUP_NATION_MINTS.join("\n");

/** Event-sector tokens (e.g. $WORLDCUP). Add more event mints below. */
export const LISTED_EVENT_COINS_RAW = `
${WORLD_CUP_MAIN_MINT}
H3pH7frVidjqQTpBpZtDhvuMZu97VkBGPHkngYegpump
`;

/** Footballer tokens — paste mints here (one per line or comma-separated). */
export const LISTED_FOOTBALLER_COINS_RAW = `
4kPp9FjfVTtp46EmMzpfa357xgCzbQNPR3MFPFF5pump
6M4kwmg87tx7bUEwxYKgQazcyWGiCyqcChwhC5qpump
62NGaqGP17rjPtqNjHrKXDnVzA5bsn8132ePa9T1pump
A8dsAnZap72EKcty3d7ryr4sF2e6kFZKe6TQrp5Cpump
CV8VB5m3q3qYicLjFv8PFDdpAnLDnD4bWhFLyN8Xpump
D4KGuVEisvqR7h1LeZ9Y889SgLB2Xzunqpt66m2bpump
6qDWDEyf6Lj4qYPLKTTG7JqFhWonskz5eXbDwpsEpump
9iCDP4v2hrWuMk5Vr6rsB1TZJMACUbWPuPTLdATYpump
9joVXk6TK4ydAC7SktApCi6CBDAhAN1fkZqLeRARpump
EBKKjedntxAM6w3J6WooD7pM93ytSjoeCJfvmFf6pump
9x8k8ULLtz3LEbkN8Chr8koqKcVMQLQ3L6Fp22TRpump
AsuxCJt8G6MX851oeYsm6sKgauhKsgv1WWmGNEkrpump
J37NxKi9DDz7yApyDouEfsnNaMANTvRJS2Vr3DGxpump
BT4qTxrPruUvZuvNNMkwJg1uUkqa2DVK5QiNLobgpump
3wJBR5RL9mJFHfheK65H3B3MtpNqihcnA28jWAVrpump
3Y82QFcYKjezBUVL8e35YGTGcFPNxTZXENZdMkvBpump
ALWJQJi19A3znksLX8X5y8kJoPbR26QxBxhyfCFMpump
GeHMzRiYh99TRv9xPhrTCM7tQiQTf5uKuy2sYzGCpump
FiFMcHnkPxpDfG5HgJs7hNd5NJKDe3JRNfHAGviHpump
ALX1oAidmvK5jViYvYqTyn1dqdzqwBQUXS3xtwJkpump
6Hc1sdRFzT1AdZt8ZqLPdTJfkXpsQ3sa9ju12ZK2pump
HLJ3NSpCGFAT24EUsYyYLK67PpdS7NQZKM9PqypNpump
C2eD8TiukJVy4GD29stFNDQwd3AdRG5sUHWvQaxQpump
tz16dNaYd4qmNedffXsq5KzhTpTTyAvJuNHvSRApump
51yN6zSeocm3JkkTUNDLKZjQ6VNMM3G4hQ9x3FE5pump
HwCYf89yNf6hc8W9B6Tz66rTEwkwtcy2VHKwgbAfpump
2FcXQf5RvkDqzwDP4Nbz5N6hzwyp93sFkjsF38whpump
6wY8HJa9wQ4uzLDXBJ4UzN3xKXY3ZQMh6azqfN6cpump
nU3gY7aigZwR5dE6iDG9VLQ1zMGBGW6VcA75MMcpump
5SLZvW8Aor64qr89uTmE6ThqedTnJbKXgZj94CMapump
J85JT7VcYUX8nkSdQmayTwwAMQxHmYMQ6vmfkWR3pump
DjvKA62PxUrmj2eRwU89Q8Ak8MLRAuhAbKa2Hqiopump
BJr7LRY75vCe6EgkgZGZ4Qz2b8fgtdLfcd7gs7vmpump
8rLbDtMBDT3fFsNLRawsPcrvLjLzchMaVMPbkmoNpump
8a6a6Wkox2piD26Uykd7wQZ4m3rARyzZFqMMtpNnpump
C3YMb5oLLMKAMeeZDa84Uzi6o11NfmCC8Hyee6sSpump
4Az4K7hqE6XcTjqygsBF5J9c7Zews8kQX1B15EDfpump
DqnNz7EEvS4QMFJV8UNboMskQehs53uN5NV7uC9mpump
FwL8BUg4sWX8QB74fJDjfzuKSXJ8i7tTmKkcWTvtpump
vJ37vTXTggJDtvYtULvhD6UfxDVmHkcNnNJ4ghUpump
6Pi34RfSi4FReDNninDpg9sVz5TdoUfVTWQgRUdHpump
F5kGMd6ERhnVVPxA2hTFiFjU9ZTZoqAkYNpj5UhApump
UU2eKChNYEVdBFcDys26XLJZGBYxVMEjKxVsNkJpump
2FdYozWg6G5k8yeeihQhLQAZva8GamUpegARURiBpump
tpPGXY48t9wQtxkr1F8vfJb2pb4a6d3imsfq3mqpump
GJ66oyfwfmsmxp6BdDciML4PbPqEeL5SwrUdmyk2pump
3wmcruDjcjLm9VDLut3mo1gtMvHagTMbey4XwaTqpump
6KFdNUgv66woNkq2KxFRrCaCok4x3aUVMPhpVe66pump
AKtf5K66cGyXWZQobx9p1mn38sdVURL5ymESJPWKpump
E6gSopHkWbQiE4PThkVqteBi8febyQHwiaPjKZB7pump
9pZHKB3He27jKTV5enffHWkhiAJESR63StwRfte2pump
22459r1AT5ZMQi9XKLqdWip6KrLyDuizxWc9nM9qpump
`;

export const LISTED_MINTS_BY_CATEGORY: Record<TokenCategoryId, string> = {
  country: LISTED_COUNTRY_COINS_RAW,
  event: LISTED_EVENT_COINS_RAW,
  footballer: LISTED_FOOTBALLER_COINS_RAW,
};

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

export interface ListedTokenEntry {
  mint: string;
  category: TokenCategoryId;
}

const CATEGORY_ORDER: TokenCategoryId[] = [
  "country",
  "event",
  "footballer",
];

export function getListedTokenEntries(): ListedTokenEntry[] {
  const out: ListedTokenEntry[] = [];
  const seenGlobal = new Set<string>();
  for (const category of CATEGORY_ORDER) {
    const mints = parseListedSolanaMints(LISTED_MINTS_BY_CATEGORY[category]);
    for (const mint of mints) {
      if (seenGlobal.has(mint)) continue;
      seenGlobal.add(mint);
      out.push({ mint, category });
    }
  }
  return out;
}

export function getListedSolanaMints(): string[] {
  return getListedTokenEntries().map((e) => e.mint);
}

function normalizeOverrideMap(
  map: Record<string, string>,
): Record<string, string> {
  const o: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    const mint = k.trim();
    if (!isSolanaMint(mint)) continue;
    o[mint] = v.trim().toUpperCase();
  }
  return o;
}

/** Per-mint ISO2 overrides for map pins and nation labels. */
export const MINT_TO_ISO2_OVERRIDE: Record<string, string> = normalizeOverrideMap(
  {
    ...WORLD_CUP_NATION_MINT_ISO2,
    ...EVENT_MINT_ISO2,
    ...FOOTBALLER_MINT_ISO2,
  },
);

export function getCategoryLabelForEntry(category: TokenCategoryId): string {
  return TOKEN_CATEGORY_BY_ID[category].label;
}
