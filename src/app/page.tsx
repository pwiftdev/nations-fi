import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: { absolute: "Screener · Nations.Fi" },
  description:
    "Browse nation-sector tokens on Solana with live DexScreener data, filters, and an interactive world map.",
  openGraph: {
    title: "Screener · Nations.Fi",
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
