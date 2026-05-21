import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import {
  DEXSCREENER_CHAIN_ID,
  getListedTokenEntries,
  MINT_TO_ISO2_OVERRIDE,
} from "@/data/listed-token-addresses";
import { mergeDexPairsToRows } from "@/lib/dexscreener/merge-rows";
import type { DexScreenerPair } from "@/lib/dexscreener/types";

const BATCH_SIZE = 20;

async function fetchPairs(
  chainId: string,
  addresses: string[],
): Promise<DexScreenerPair[]> {
  const url = `https://api.dexscreener.com/tokens/v1/${chainId}/${addresses.join(",")}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`DexScreener HTTP ${res.status}`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Invalid DexScreener payload");
  }
  return data as DexScreenerPair[];
}

export async function GET() {
  try {
    const chainId = DEXSCREENER_CHAIN_ID;
    const entries = getListedTokenEntries();
    if (!entries.length) {
      return NextResponse.json({ rows: [] });
    }
    const orderedMints = entries.map((e) => e.mint);
    const batches: string[][] = [];
    for (let i = 0; i < orderedMints.length; i += BATCH_SIZE) {
      batches.push(orderedMints.slice(i, i + BATCH_SIZE));
    }
    const pairBlocks = await Promise.all(
      batches.map((batch) => fetchPairs(chainId, batch)),
    );
    const seen = new Set<string>();
    const pairs: DexScreenerPair[] = [];
    for (const block of pairBlocks) {
      for (const p of block) {
        if (seen.has(p.pairAddress)) continue;
        seen.add(p.pairAddress);
        pairs.push(p);
      }
    }
    const rows = mergeDexPairsToRows(
      entries,
      pairs,
      MINT_TO_ISO2_OVERRIDE,
    );
    return NextResponse.json({ rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ rows: [], error: message }, { status: 502 });
  }
}
