/** DexScreener embedded chart iframe URL for a Solana pair or token address. */
export function dexscreenerEmbedIframeSrc(
  address: string,
  chainId = "solana",
): string {
  const params = new URLSearchParams({
    embed: "1",
    loadChartSettings: "0",
    trades: "0",
    tabs: "0",
    info: "0",
    chartTheme: "dark",
    theme: "dark",
    chartStyle: "1",
    chartType: "usd",
    interval: "15",
  });
  return `https://dexscreener.com/${chainId}/${address}?${params.toString()}`;
}
