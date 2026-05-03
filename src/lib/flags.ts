/** ISO 3166-1 alpha-2 → regional-indicator flag emoji. */
export function flagEmoji(iso2: string): string {
  const cc = iso2.toUpperCase();
  if (cc.length !== 2 || /[^A-Z]/.test(cc)) return "—";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + (cc.charCodeAt(0) - 65),
    A + (cc.charCodeAt(1) - 65),
  );
}
