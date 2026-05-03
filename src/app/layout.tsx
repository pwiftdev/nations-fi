import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nations.fi"),
  title: {
    default: "Nations.Fi",
    template: "%s · Nations.Fi",
  },
  description:
    "Nation-sector token screener for Solana — geographic context, liquidity, and markets in one view.",
  applicationName: "Nations.Fi",
  keywords: [
    "Nations.Fi",
    "Solana",
    "screener",
    "nation sector",
    "DeFi",
    "token",
  ],
  authors: [{ name: "Nations.Fi" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Nations.Fi",
    title: "Nations.Fi — Nation-sector screener",
    description:
      "Nation-sector token screener for Solana — geographic context, liquidity, and markets in one view.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nations.Fi — Nation-sector screener",
    description:
      "Nation-sector token screener for Solana — geographic context, liquidity, and markets in one view.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
    { media: "(prefers-color-scheme: light)", color: "#020617" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col font-sans">{children}</body>
    </html>
  );
}
