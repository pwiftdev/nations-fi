import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Nations.Fi maps nation-sector tokens, aggregates preview metrics, and plans to ship live data.",
};

export default function MethodologyPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
        >
          ← Screener
        </Link>
        <h1 className="mt-6 font-brand text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Methodology
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
          Nations.Fi is a nation-sector lens on Solana liquidity. You paste mint
          addresses into{" "}
          <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-[12px]">
            listed-token-addresses.ts
          </code>
          ; market stats load from the{" "}
          <strong className="text-[var(--foreground-secondary)]">
            DexScreener tokens API
          </strong>
          . Territory labels and globe pins are inferred from each token&apos;s
          name and symbol (heuristic rules), with optional per-mint ISO2
          overrides in the same file when inference is wrong.
        </p>
        <ul className="mt-8 list-disc space-y-4 pl-5 text-[13px] leading-relaxed text-[var(--foreground-secondary)]">
          <li>
            <strong className="text-[var(--foreground)]">Geography</strong> —
            Each row gets an ISO-3166-style alpha-2 code from name/symbol
            matching (or from your mint→ISO override). When a territory matches,
            the map pin uses a fixed country centroid; unmapped tokens use code{" "}
            <code className="text-[12px]">UN</code> and no pin.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Markets</strong> — Price,
            volume, liquidity, and changes come from DexScreener&apos;s
            aggregated pair data (server-side fetch, ~60s cache). We pick the
            highest-liquidity pool per listed mint where that mint is the base
            token.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Screener</strong> — Sort
            keys and filters mirror what traders expect (rank, MC, vol, age).
            Nation filters restrict rows to a single territory without hiding
            global context on the map.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Listings</strong> — Token
            submissions pass review for metadata quality, nation-sector fit,
            and abuse patterns before appearing on the map.
          </li>
        </ul>
        <p className="mt-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-1)]/60 p-4 text-[12px] leading-relaxed text-[var(--muted)]">
          When live data ships, this page will link to API docs, field
          definitions, and known limitations (e.g. wrapped assets, bridged
          supply).
        </p>
      </div>
    </AppShell>
  );
}
