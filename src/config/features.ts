/**
 * Product feature toggles (no env wiring yet — flip booleans for demos).
 * Replace with remote flags / env when you ship real infra.
 */
export const FEATURES = {
  showCampaignBanner: true,
  showMapHud: true,
  showWatchlistColumn: true,
  showNationUrlSync: true,
  /** Short status line in the footer (markets source + disclaimer). */
  footerNote: "Markets from DexScreener · not financial advice",
} as const;
