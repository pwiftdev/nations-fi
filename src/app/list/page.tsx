import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ListTokenForm } from "@/components/list-token/ListTokenForm";

export const metadata: Metadata = {
  title: "List your token",
  description:
    "Submit your nation-sector project for review on the Nations.Fi Solana screener.",
};

export default function ListTokenPage() {
  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-[var(--border)] bg-[var(--surface-0)]/60 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            ← Screener
          </Link>
        </div>
        <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto px-4 py-8 sm:px-6 sm:py-10">
          <ListTokenForm />
        </div>
      </div>
    </AppShell>
  );
}
