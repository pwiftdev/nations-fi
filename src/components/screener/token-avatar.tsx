"use client";

import { useEffect, useState } from "react";
import { isPumpFunMint, pumpFunCoinImageUrl } from "@/lib/pump-fun";

const SIZE_CLASS = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[10px]",
} as const;

export function TokenAvatar({
  src,
  mint,
  symbol,
  size = "sm",
}: {
  src?: string;
  mint?: string;
  symbol: string;
  size?: keyof typeof SIZE_CLASS;
}) {
  const pumpFallback =
    mint && isPumpFunMint(mint) ? pumpFunCoinImageUrl(mint) : undefined;
  const [activeSrc, setActiveSrc] = useState<string | undefined>(
    src ?? pumpFallback,
  );
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    setActiveSrc(src ?? pumpFallback);
    setExhausted(false);
  }, [src, pumpFallback]);

  const showImage = Boolean(activeSrc) && !exhausted;
  const initials = symbol.replace(/^\$/, "").slice(0, 2).toUpperCase() || "?";

  const handleError = () => {
    if (activeSrc === src && pumpFallback && src !== pumpFallback) {
      setActiveSrc(pumpFallback);
      return;
    }
    setExhausted(true);
  };

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-3)] ring-1 ring-[var(--border)] ${SIZE_CLASS[size]}`}
      aria-hidden
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- DexScreener / pump.fun CDN
        <img
          src={activeSrc}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      ) : (
        <span className="font-mono font-semibold text-[var(--muted)]">
          {initials}
        </span>
      )}
    </span>
  );
}
