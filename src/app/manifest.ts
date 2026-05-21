import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nations.Fi — Nation-sector screener",
    short_name: "Nations.Fi",
    description:
      "Nation-sector token screener for Solana — geographic context, liquidity, and markets in one view.",
    start_url: "/",
    display: "standalone",
    background_color: "#050506",
    theme_color: "#050506",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/nationsfilogo.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
