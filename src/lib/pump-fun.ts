const PUMP_FUN_IMAGE_CDN =
  "https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/coin-image";

/** Pump.fun graduated / bonding-curve mint suffix. */
export function isPumpFunMint(mint: string): boolean {
  return mint.endsWith("pump");
}

export function pumpFunCoinImageUrl(
  mint: string,
  size: "64x64" | "200x200" | "600x600" = "64x64",
): string {
  return `${PUMP_FUN_IMAGE_CDN}/${mint}/${size}`;
}

export function pumpFunTradeUrl(mint: string): string {
  return `https://pump.fun/coin/${mint}`;
}
