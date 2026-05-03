import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Important notices for Nations.Fi preview and future live data.",
};

export default function DisclaimerPage() {
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
          Disclaimer
        </h1>
        <div className="mt-6 space-y-4 text-[13px] leading-relaxed text-[var(--foreground-secondary)]">
          <p>
            Nations.Fi does <strong className="text-[var(--foreground)]">not</strong>{" "}
            provide investment, legal, or tax advice. Digital assets are highly
            volatile and may result in total loss of capital.
          </p>
          <p>
            Market columns (price, volume, liquidity, etc.) are sourced from{" "}
            <strong className="text-[var(--foreground)]">DexScreener</strong>{" "}
            and can be delayed, incomplete, or incorrect. Nation labels and map
            pins are inferred from token names/symbols (and optional manual
            overrides) — they are not endorsements. Always verify material
            information at the source (DEX pools, explorers, issuers).
          </p>
          <p>
            By using this site you agree that Nations.Fi and its contributors
            are not liable for any damages arising from use of the product or
            reliance on its content.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
