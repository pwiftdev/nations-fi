/**
 * Product feature toggles (no env wiring yet — flip booleans for demos).
 * Replace with remote flags / env when you ship real infra.
 */
export const FEATURES = {
  showCampaignBanner: true,
  showMapHud: true,
  showWatchlistColumn: true,
  showNationUrlSync: true,
} as const;
