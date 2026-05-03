import type { NationCoinRow } from "@/types/screener";
import { dexIdToLabel } from "@/lib/dexscreener/dex-label";
import type { DexScreenerPair } from "@/lib/dexscreener/types";
import { inferNationFromTokenMeta } from "@/lib/nation-infer/infer-nation";

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

function estimateMakers24h(pair: DexScreenerPair): number {
  const buys = pair.txns?.h24?.buys ?? 0;
  const sells = pair.txns?.h24?.sells ?? 0;
  const t = buys + sells;
  if (t <= 0) return 0;
  return Math.max(1, Math.round(t / 6));
}

/**
 * @param orderedMints — mint list order defines default `rank` before re-sort
 * @param iso2Overrides — lowercase mint → ISO2 (from `MINT_TO_ISO2_OVERRIDE`)
 */
export function mergeDexPairsToRows(
  orderedMints: string[],
  pairs: DexScreenerPair[],
  iso2Overrides: Record<string, string> = {},
): NationCoinRow[] {
  const now = Date.now();
  const rows: NationCoinRow[] = [];

  for (const mint of orderedMints) {
    const pair = pickBestPairForMint(mint, pairs);
    if (!pair) continue;

    const nation = inferNationFromTokenMeta(
      pair.baseToken.symbol,
      pair.baseToken.name,
      mint,
      iso2Overrides,
    );

    const pc = pair.priceChange ?? {};
    const tx = pair.txns?.h24 ?? { buys: 0, sells: 0 };
    const created = pair.pairCreatedAt ?? now;
    const ageMs = Math.max(0, now - created);
    const ageHours = ageMs / 3_600_000;

    rows.push({
      id: mint,
      rank: rows.length + 1,
      nationCode: nation.nationCode,
      nationName: nation.nationName,
      pairLabel: `${pair.baseToken.symbol} / ${pair.quoteToken.symbol}`,
      baseSymbol: pair.baseToken.symbol,
      quoteSymbol: pair.quoteToken.symbol,
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
      mapAnchor: nation.mapAnchor,
    });
  }

  return rows;
}
