"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FEATURES } from "@/config/features";

function AnnouncementBanner() {
  const segmentClass =
    "inline-flex shrink-0 items-center gap-2 px-8 py-2 font-brand text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8f4ec] sm:gap-3 sm:px-10 sm:text-[11px] sm:tracking-[0.18em] md:text-[12px] md:tracking-[0.2em]";

  return (
    <div
      className="nf-announce-banner relative z-40 shrink-0 overflow-hidden"
      aria-label="FIFA World Cup 2026 is NEAR. List your token on the Nations.Fi world map now."
    >
      <div
        className="nf-announce-fade-l pointer-events-none absolute inset-y-0 left-0 z-10 w-14 sm:w-20"
        aria-hidden
      />
      <div
        className="nf-announce-fade-r pointer-events-none absolute inset-y-0 right-0 z-10 w-14 sm:w-20"
        aria-hidden
      />
      <div className="nf-announce-track">
        {[0, 1].map((i) => (
          <span key={i} className={segmentClass} aria-hidden>
            <span>FIFA World Cup 2026 is</span>{" "}
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(45,212,122,0.4)]">
              NEAR
            </span>
            <span className="px-2 text-[var(--accent)]/50 sm:px-3" aria-hidden>
              ·
            </span>
            <span className="max-w-[min(92vw,560px)] text-center leading-tight text-[var(--brand-fi)] drop-shadow-[0_0_12px_rgba(240,180,41,0.25)] sm:max-w-none sm:text-left">
              LIST YOUR TOKEN ON THE NATIONS.FI WORLD MAP NOW!
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isList = pathname === "/list";
  const isMethodology = pathname === "/methodology";
  const isDisclaimer = pathname === "/disclaimer";

  return (
    <>
      {FEATURES.showCampaignBanner ? <AnnouncementBanner /> : null}
      <header className="relative z-30 flex h-[52px] shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--header-bg)] px-4 backdrop-blur-xl lg:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--header-hairline)] to-transparent"
        aria-hidden
      />
      <Link
        href="/"
        className="group relative flex items-center gap-2.5 outline-offset-4 transition-opacity hover:opacity-95 sm:gap-3"
      >
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--border-strong)] sm:h-9 sm:w-9">
          <Image
            src="/nationfilogo.png"
            alt=""
            fill
            sizes="36px"
            className="object-cover"
            priority
          />
        </span>
        <span className="font-brand text-[17px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
          Nations
          <span className="text-[var(--brand-fi)]">.Fi</span>
        </span>
        <span className="hidden h-4 w-px bg-[var(--border-strong)] sm:block" aria-hidden />
        <span className="hidden max-w-[220px] truncate font-sans text-[11px] font-medium leading-snug tracking-wide text-[var(--muted)] sm:inline">
          Nation-sector markets on{" "}
          <span className="text-[var(--foreground-secondary)]">Solana</span>
        </span>
      </Link>
      <nav
        className="flex items-center gap-1.5 sm:gap-2"
        aria-label="Primary"
      >
        <Link
          href="/"
          className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
            isHome
              ? "bg-[var(--surface-2)] text-[var(--foreground)] ring-1 ring-[var(--border-strong)]"
              : "text-[var(--muted)] hover:text-[var(--foreground-secondary)]"
          }`}
        >
          Screener
        </Link>
        <Link
          href="/list"
          className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
            isList
              ? "bg-[var(--brand-fi-dim)] text-[var(--brand-fi)] ring-1 ring-[var(--brand-fi)]/30"
              : "border border-[var(--border-strong)] bg-[var(--surface-1)] text-[var(--foreground-secondary)] hover:border-[var(--brand-fi)]/40 hover:bg-[var(--surface-2)] hover:text-[var(--brand-fi-soft)]"
          }`}
        >
          List your token
        </Link>
        <Link
          href="/methodology"
          className={`hidden rounded-md px-2 py-1 text-[12px] font-medium transition-colors sm:inline ${
            isMethodology
              ? "text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground-secondary)]"
          }`}
        >
          Methodology
        </Link>
        <Link
          href="/disclaimer"
          className={`hidden rounded-md px-2 py-1 text-[12px] font-medium transition-colors md:inline ${
            isDisclaimer
              ? "text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground-secondary)]"
          }`}
        >
          Disclaimer
        </Link>
        <span className="hidden cursor-not-allowed rounded-md px-2 py-1 text-[12px] font-medium text-[var(--muted-faint)] md:inline">
          Markets
        </span>
        <span className="hidden cursor-not-allowed rounded-md px-2 py-1 text-[12px] font-medium text-[var(--muted-faint)] lg:inline">
          API
        </span>
      </nav>
    </header>
    </>
  );
}
