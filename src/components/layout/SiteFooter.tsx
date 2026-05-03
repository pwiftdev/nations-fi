import Link from "next/link";
import { FEATURES } from "@/config/features";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--surface-0)]/80 px-4 py-4 text-center backdrop-blur-md lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 sm:flex-row sm:text-left">
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground-secondary)]">
            {FEATURES.footerNote}
          </span>
        </p>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-medium text-[var(--muted)]"
          aria-label="Legal and product"
        >
          <Link
            href="/methodology"
            className="transition-colors hover:text-[var(--accent)]"
          >
            Methodology
          </Link>
          <Link
            href="/disclaimer"
            className="transition-colors hover:text-[var(--accent)]"
          >
            Disclaimer
          </Link>
        </nav>
      </div>
    </footer>
  );
}
