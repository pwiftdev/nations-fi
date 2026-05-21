"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState, type ReactNode } from "react";
import { FEATURES } from "@/config/features";
import { NationsFiWordmark } from "@/components/layout/NationsFiWordmark";

const ANNOUNCE_STRIP_CLASS =
  "inline-flex shrink-0 items-center gap-0 py-2 font-brand text-[10px] font-semibold uppercase tracking-[0.08em] text-[#e8f4ec] sm:text-[11px] sm:tracking-[0.1em] md:text-[12px] md:tracking-[0.12em]";

const ANNOUNCE_HIGHLIGHT =
  "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(45,212,122,0.4)]";

const ANNOUNCE_GOLD =
  "text-[var(--brand-fi)] drop-shadow-[0_0_12px_rgba(240,180,41,0.25)]";

/** Each phrase is one inline run so spaces are never lost between flex children. */
function AnnouncePhrase({ children }: { children: ReactNode }) {
  return (
    <span className="inline shrink-0 whitespace-nowrap">{children}</span>
  );
}

const ANNOUNCE_ITEMS = [
  {
    id: "wc",
    node: (
      <AnnouncePhrase>
        {"FIFA World Cup 2026 is "}
        <span className={ANNOUNCE_HIGHLIGHT}>NEAR</span>
      </AnnouncePhrase>
    ),
  },
  {
    id: "native",
    node: (
      <AnnouncePhrase>
        <span className={ANNOUNCE_GOLD}>$NATIONS is our native token</span>
      </AnnouncePhrase>
    ),
  },
  {
    id: "support",
    node: (
      <AnnouncePhrase>
        <span className="text-[var(--foreground-secondary)]">
          Support country &amp; football coins etc
        </span>
      </AnnouncePhrase>
    ),
  },
  {
    id: "list",
    node: (
      <AnnouncePhrase>
        <span className={ANNOUNCE_GOLD}>
          List your token on the Nations.Fi world map now!
        </span>
      </AnnouncePhrase>
    ),
  },
] as const;

function AnnounceSeparator() {
  return (
    <span
      className="inline shrink-0 px-4 text-[var(--accent)]/50 sm:px-5"
      aria-hidden
    >
      {" · "}
    </span>
  );
}

/** One full strip of messages; duplicated in the track for a seamless -50% loop. */
function AnnouncementStrip({ repeat = 3 }: { repeat?: number }) {
  const sequence = Array.from({ length: repeat }, () => ANNOUNCE_ITEMS).flat();

  return (
    <span className={ANNOUNCE_STRIP_CLASS}>
      {sequence.map((item, index) => (
        <Fragment key={`${item.id}-${index}`}>
          {index > 0 ? <AnnounceSeparator /> : null}
          {item.node}
        </Fragment>
      ))}
    </span>
  );
}

function AnnouncementBanner() {
  const ariaText = [
    "FIFA World Cup 2026 is near.",
    "$NATIONS is our native token.",
    "Support country and football coins etc.",
    "List your token on the Nations.Fi world map now.",
  ].join(" ");

  return (
    <div
      className="nf-announce-banner relative z-40 shrink-0 overflow-hidden"
      aria-label={ariaText}
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
        <AnnouncementStrip repeat={3} />
        <AnnouncementStrip repeat={3} aria-hidden />
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              src="/nationsfilogo.jpeg"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <NationsFiWordmark size="md" />
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
          {/* Screener link — always visible, min touch target */}
          <Link
            href="/"
            className={`inline-flex min-h-[36px] items-center rounded-md px-2.5 text-[12px] font-medium transition-colors ${
              isHome
                ? "bg-[var(--surface-2)] text-[var(--foreground)] ring-1 ring-[var(--border-strong)]"
                : "text-[var(--muted)] hover:text-[var(--foreground-secondary)]"
            }`}
          >
            Screener
          </Link>

          {/* List token — always visible, abbreviated on mobile */}
          <Link
            href="/list"
            className={`inline-flex min-h-[36px] items-center rounded-md px-2.5 text-[12px] font-medium transition-colors ${
              isList
                ? "bg-[var(--brand-fi-dim)] text-[var(--brand-fi)] ring-1 ring-[var(--brand-fi)]/30"
                : "border border-[var(--border-strong)] bg-[var(--surface-1)] text-[var(--foreground-secondary)] hover:border-[var(--brand-fi)]/40 hover:bg-[var(--surface-2)] hover:text-[var(--brand-fi-soft)]"
            }`}
          >
            <span className="sm:hidden">List Token</span>
            <span className="hidden sm:inline">List your token</span>
          </Link>

          {/* Methodology — shown from sm */}
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

          {/* Disclaimer — shown from md */}
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

          {/* Mobile "more" menu — shown below sm only */}
          <div className="relative sm:hidden">
            <button
              type="button"
              aria-label="More navigation options"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground-secondary)] active:scale-[0.96]"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                aria-hidden
              >
                {mobileMenuOpen ? (
                  // X icon
                  <path
                    d="M1.5 1.5l12 12M13.5 1.5l-12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ) : (
                  // Hamburger icon
                  <>
                    <line x1="2" y1="4.5" x2="13" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="2" y1="7.5" x2="13" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="2" y1="10.5" x2="13" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>

            {mobileMenuOpen ? (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-hidden
                />
                {/* Dropdown */}
                <div className="nf-panel-pop absolute right-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-elevated)]">
                  <Link
                    href="/methodology"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-[13px] font-medium transition-colors ${
                      isMethodology
                        ? "text-[var(--accent)]"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Methodology
                  </Link>
                  <Link
                    href="/disclaimer"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-[13px] font-medium transition-colors ${
                      isDisclaimer
                        ? "text-[var(--accent)]"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Disclaimer
                  </Link>
                  <div className="px-4 py-3 text-[13px] font-medium text-[var(--muted-faint)] cursor-not-allowed">
                    Markets <span className="ml-1 text-[10px] tracking-wide uppercase opacity-60">soon</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </nav>
      </header>
    </>
  );
}
