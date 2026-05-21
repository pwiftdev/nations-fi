export type TokenCategoryId = "country" | "event" | "footballer";

export interface TokenCategoryMeta {
  id: TokenCategoryId;
  label: string;
  /** Shown in the screener “Nation” column for non-country rows. */
  rowLabel: string;
}

export const TOKEN_CATEGORIES: TokenCategoryMeta[] = [
  { id: "country", label: "Country Coins", rowLabel: "Country" },
  { id: "event", label: "Event Coins", rowLabel: "Event" },
  { id: "footballer", label: "Footballer Coins", rowLabel: "Footballer" },
];

export const TOKEN_CATEGORY_BY_ID: Record<
  TokenCategoryId,
  TokenCategoryMeta
> = Object.fromEntries(
  TOKEN_CATEGORIES.map((c) => [c.id, c]),
) as Record<TokenCategoryId, TokenCategoryMeta>;

export function isTokenCategoryId(value: string): value is TokenCategoryId {
  return value === "country" || value === "event" || value === "footballer";
}

export function getCategoryLabel(id: TokenCategoryId): string {
  return TOKEN_CATEGORY_BY_ID[id].label;
}
