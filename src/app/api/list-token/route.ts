import { NextResponse } from "next/server";
import { isValidAlpha2 } from "@/lib/country-select-options";

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const SHEETDB_URL =
  process.env.SHEETDB_LIST_TOKEN_URL ??
  "https://sheetdb.io/api/v1/ym72xclvqadzk";

async function appendToSheet(row: Record<string, string>): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(SHEETDB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ data: [row] }),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `SheetDB ${res.status}: ${text || res.statusText}` };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown SheetDB error";
    return { ok: false, error: message };
  }
}
const OPTIONAL_URL = (v: string) => {
  if (!v.trim()) return true;
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const d = body as Record<string, unknown>;

  const projectName = String(d.projectName ?? "").trim();
  const ticker = String(d.ticker ?? "").trim().toUpperCase();
  const countryIso2 = String(d.countryIso2 ?? "")
    .trim()
    .toUpperCase();
  const contractAddress = String(d.contractAddress ?? "").trim();
  const xLink = String(d.xLink ?? "").trim();
  const website = String(d.website ?? "").trim();
  const telegramLink = String(d.telegramLink ?? "").trim();
  const description = String(d.description ?? "").trim();

  const errors: string[] = [];
  if (!countryIso2 || !isValidAlpha2(countryIso2)) {
    errors.push("Choose a valid country or territory for this listing.");
  }
  if (projectName.length < 2 || projectName.length > 120) {
    errors.push("Project name must be between 2 and 120 characters.");
  }
  if (!/^[A-Z0-9]{2,12}$/.test(ticker)) {
    errors.push("Ticker must be 2–12 letters or numbers (A–Z, 0–9).");
  }
  if (!SOLANA_ADDRESS.test(contractAddress)) {
    errors.push("Contract address must be a valid Solana mint address.");
  }
  if (!OPTIONAL_URL(xLink)) errors.push("X link must be a valid http(s) URL.");
  if (!OPTIONAL_URL(website)) errors.push("Website must be a valid http(s) URL.");
  if (!OPTIONAL_URL(telegramLink)) {
    errors.push("Telegram link must be a valid http(s) URL.");
  }
  if (description.length < 20 || description.length > 2000) {
    errors.push("Description must be between 20 and 2000 characters.");
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  }

  const submittedAt = new Date().toISOString();
  const sheetRow = {
    submittedAt,
    countryIso2,
    projectName,
    ticker,
    contractAddress,
    xLink,
    website,
    telegramLink,
    description,
    status: "pending review",
    source: "nations.fi/list",
  };

  const sheetResult = await appendToSheet(sheetRow);
  if (!sheetResult.ok) {
    console.error("[list-token] SheetDB append failed:", sheetResult.error);
    return NextResponse.json(
      {
        error:
          "We received your details but could not save them right now. Please try again in a moment.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Submission received. Our team will review your listing.",
  });
}
