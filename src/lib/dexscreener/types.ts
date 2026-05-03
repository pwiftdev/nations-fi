export interface DexScreenerTokenRef {
  address: string;
  name: string;
  symbol: string;
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: DexScreenerTokenRef;
  quoteToken: DexScreenerTokenRef;
  priceUsd?: string;
  priceChange?: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  volume?: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  liquidity?: {
    usd?: number;
  };
  marketCap?: number;
  fdv?: number;
  txns?: {
    h24?: { buys: number; sells: number };
  };
  pairCreatedAt?: number;
}
