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

const siteDescription =
  "Nation-sector token screener for Solana — geographic context, liquidity, and markets in one view.";

export const metadata: Metadata = {
  metadataBase: new URL("https://nations.fi"),
  title: {
    default: "Nations.Fi — Solana nation-sector screener",
    template: "%s · Nations.Fi",
  },
  description: siteDescription,
  applicationName: "Nations.Fi",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Nations.Fi",
    "Solana",
    "token screener",
    "nation sector",
    "DeFi",
    "memecoin",
    "world map",
    "DexScreener",
  ],
  authors: [{ name: "Nations.Fi", url: "https://nations.fi" }],
  creator: "Nations.Fi",
  publisher: "Nations.Fi",
  category: "finance",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/nationsfilogo.jpeg", type: "image/jpeg", sizes: "512x512" },
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nations.fi",
    siteName: "Nations.Fi",
    title: "Nations.Fi — Solana nation-sector screener",
    description: siteDescription,
    images: [
      {
        url: "/nationsfilogo.jpeg",
        width: 512,
        height: 512,
        alt: "Nations.Fi",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Nations.Fi — Solana nation-sector screener",
    description: siteDescription,
    images: ["/nationsfilogo.jpeg"],
  },
  alternates: {
    canonical: "https://nations.fi",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e1116",
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
