import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Screener",
  description:
    "Browse nation-sector tokens on Solana with live DexScreener data, filters, and an interactive world map.",
  openGraph: {
    title: "Nations.Fi Screener",
    description:
      "Browse nation-sector tokens on Solana with live DexScreener data, filters, and an interactive world map.",
  },
};

export default function HomePage() {
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}
