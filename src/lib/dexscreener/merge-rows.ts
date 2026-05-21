import type { ListedTokenEntry } from "@/data/listed-token-addresses";
import { getCategoryLabelForEntry } from "@/data/listed-token-addresses";
import type { NationCoinRow } from "@/types/screener";
import type { TokenCategoryId } from "@/types/token-category";
import { TOKEN_CATEGORY_BY_ID } from "@/types/token-category";
import { dexIdToLabel } from "@/lib/dexscreener/dex-label";
import type { DexScreenerPair } from "@/lib/dexscreener/types";
import { inferNationFromTokenMeta } from "@/lib/nation-infer/infer-nation";
import { isPumpFunMint, pumpFunCoinImageUrl } from "@/lib/pump-fun";

function num(v: string | undefined): number {
  if (v == null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function volumeH24Usd(pair: DexScreenerPair): number {
  const raw = pair.volume?.h24 ?? 0;
  return Number.isFinite(raw) ? raw : 0;
}

function pickBestPairForMint(
  mint: string,
  pairs: DexScreenerPair[],
): DexScreenerPair | null {
  const m = mint.toLowerCase();
  const candidates = pairs.filter(
    (p) => p.baseToken.address.toLowerCase() === m,
  );
  if (!candidates.length) return null;
  return candidates.reduce((best, p) => {
    const lq = p.liquidity?.usd ?? 0;
    const bestLq = best.liquidity?.usd ?? 0;
    return lq >= bestLq ? p : best;
  });
}

function tokenImageUrlFromPair(
  pair: DexScreenerPair,
  mint: string,
): string | undefined {
  const dex = pair.info?.imageUrl?.trim();
  if (dex) return dex;
  if (isPumpFunMint(mint)) return pumpFunCoinImageUrl(mint);
  return undefined;
}

function estimateMakers24h(pair: DexScreenerPair): number {
  const buys = pair.txns?.h24?.buys ?? 0;
  const sells = pair.txns?.h24?.sells ?? 0;
  const t = buys + sells;
  if (t <= 0) return 0;
  return Math.max(1, Math.round(t / 6));
}

function displayNation(
  category: TokenCategoryId,
  nation: { nationCode: string; nationName: string },
  mapped: boolean,
): { nationCode: string; nationName: string } {
  if (mapped) {
    if (category === "event" && nation.nationCode === "US") {
      return {
        nationCode: nation.nationCode,
        nationName: "United States (host)",
      };
    }
    return nation;
  }
  if (category === "country") {
    return nation;
  }
  const meta = TOKEN_CATEGORY_BY_ID[category];
  return {
    nationCode: category === "event" ? "EV" : "FB",
    nationName: meta.rowLabel,
  };
}

/**
 * @param entries — mint + category; order defines default `rank` per category batch
 * @param iso2Overrides — mint address → ISO2 (from `MINT_TO_ISO2_OVERRIDE`)
 */
export function mergeDexPairsToRows(
  entries: ListedTokenEntry[],
  pairs: DexScreenerPair[],
  iso2Overrides: Record<string, string> = {},
): NationCoinRow[] {
  const now = Date.now();
  const rows: NationCoinRow[] = [];
  const rankByCategory: Record<TokenCategoryId, number> = {
    country: 0,
    event: 0,
    footballer: 0,
  };

  for (const { mint, category } of entries) {
    const pair = pickBestPairForMint(mint, pairs);
    if (!pair) continue;

    const nation = inferNationFromTokenMeta(
      pair.baseToken.symbol,
      pair.baseToken.name,
      mint,
      iso2Overrides,
    );
    const mapped = Boolean(nation.mapAnchor);
    const display = displayNation(category, nation, mapped);

    const pc = pair.priceChange ?? {};
    const tx = pair.txns?.h24 ?? { buys: 0, sells: 0 };
    const created = pair.pairCreatedAt ?? now;
    const ageMs = Math.max(0, now - created);
    const ageHours = ageMs / 3_600_000;

    rankByCategory[category] += 1;

    rows.push({
      id: mint,
      rank: rankByCategory[category],
      category,
      categoryLabel: getCategoryLabelForEntry(category),
      nationCode: display.nationCode,
      nationName: display.nationName,
      pairLabel: `${pair.baseToken.symbol} / ${pair.quoteToken.symbol}`,
      baseSymbol: pair.baseToken.symbol,
      quoteSymbol: pair.quoteToken.symbol,
      tokenImageUrl: tokenImageUrlFromPair(pair, mint),
      dexLabel: dexIdToLabel(pair.dexId),
      priceUsd: num(pair.priceUsd),
      change5m: pc.m5 ?? 0,
      change1h: pc.h1 ?? 0,
      change24h: pc.h24 ?? 0,
      volume24h: volumeH24Usd(pair),
      liquidityUsd: pair.liquidity?.usd ?? 0,
      marketCapUsd: pair.marketCap ?? pair.fdv ?? 0,
      txns24h: { buys: tx.buys, sells: tx.sells },
      makers24h: estimateMakers24h(pair),
      ageHours,
      contractAddress: pair.baseToken.address,
      chartAddress: pair.pairAddress,
      mapAnchor: nation.mapAnchor,
    });
  }

  return rows;
}
