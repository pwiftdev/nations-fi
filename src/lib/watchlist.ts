const KEY = "nf-watchlist-ids-v1";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function getWatchlistIds(): string[] {
  return readIds();
}

export function isWatchlisted(id: string): boolean {
  return readIds().includes(id);
}

export function toggleWatchlistId(id: string): boolean {
  if (typeof window === "undefined") return false;
  const cur = new Set(readIds());
  const next = cur.has(id);
  if (next) cur.delete(id);
  else cur.add(id);
  window.localStorage.setItem(KEY, JSON.stringify([...cur]));
  return !next;
}
