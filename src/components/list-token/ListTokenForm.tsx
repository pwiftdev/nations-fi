"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getCountrySelectOptions } from "@/lib/country-select-options";
import { flagEmoji } from "@/lib/flags";
import { ListingRoadmap } from "@/components/list-token/ListingRoadmap";

const initial = {
  countryIso2: "",
  projectName: "",
  ticker: "",
  contractAddress: "",
  xLink: "",
  website: "",
  telegramLink: "",
  description: "",
};

export function ListTokenForm() {
  const countryOptions = useMemo(() => getCountrySelectOptions(), []);
  const [values, setValues] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set =
    (key: keyof typeof initial) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const v = e.target.value;
      setValues((s) => ({ ...s, [key]: v }));
      setServerError(null);
    };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/list-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryIso2: values.countryIso2.trim().toUpperCase(),
          projectName: values.projectName.trim(),
          ticker: values.ticker.trim().toUpperCase(),
          contractAddress: values.contractAddress.trim(),
          xLink: values.xLink.trim(),
          website: values.website.trim(),
          telegramLink: values.telegramLink.trim(),
          description: values.description.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        errors?: string[];
        message?: string;
      };
      if (!res.ok) {
        setServerError(
          data.errors?.[0] ?? data.error ?? "Something went wrong.",
        );
        return;
      }
      setDone(true);
      setValues(initial);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-1)]/80 p-8 shadow-[var(--shadow-elevated)] backdrop-blur-md">
        <h2 className="font-brand text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Submission received
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">
          Thanks for listing with Nations.Fi. Our team will review your project.
          You will hear from us if we need anything else.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--foreground-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
            onClick={() => setDone(false)}
          >
            Submit another
          </button>
          <Link
            href="/"
            className="rounded-[var(--radius-sm)] bg-[var(--accent-dim)] px-4 py-2 text-[13px] font-medium text-[var(--accent)] ring-1 ring-[var(--border-accent)]/60 transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
          >
            Back to screener
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-0)] px-3 py-2.5 text-[13px] text-[var(--foreground)] shadow-[var(--shadow-sm)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--muted-faint)] focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent-ring)]";

  const labelClass =
    "text-[12px] font-medium text-[var(--foreground-secondary)]";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-1)]/80 p-6 shadow-[var(--shadow-elevated)] backdrop-blur-md sm:p-8"
      noValidate
    >
      <div className="border-b border-[var(--border)] pb-6">
        <h1 className="font-brand text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          List your token
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--muted)]">
          Apply for inclusion in the Nations.Fi nation-sector screener. Fields
          marked <span className="text-[var(--foreground-secondary)]">*</span>{" "}
          are required.
        </p>
      </div>

      <ListingRoadmap />

      <div className="mt-2 grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="countryIso2" className={labelClass}>
            Country / territory for this listing{" "}
            <span className="text-[var(--accent)]">*</span>
            {values.countryIso2.length === 2 ? (
              <span className="ml-2 inline text-[18px] leading-none" aria-hidden>
                {flagEmoji(values.countryIso2)}
              </span>
            ) : null}
          </label>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted-faint)]">
            Choose where this token represents on the map and in the nation
            sector. Must match your project narrative.
          </p>
          <select
            id="countryIso2"
            name="countryIso2"
            required
            className={`${inputClass} cursor-pointer`}
            value={values.countryIso2}
            onChange={set("countryIso2")}
            autoComplete="country"
          >
            <option value="" disabled>
              Select country…
            </option>
            {countryOptions.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="projectName" className={labelClass}>
            Project name <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="projectName"
            name="projectName"
            required
            minLength={2}
            maxLength={120}
            autoComplete="organization"
            className={inputClass}
            value={values.projectName}
            onChange={set("projectName")}
            placeholder="e.g. Nation USA"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="ticker" className={labelClass}>
            Ticker <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="ticker"
            name="ticker"
            required
            pattern="[A-Za-z0-9]{2,12}"
            title="2–12 letters or numbers"
            className={`${inputClass} font-mono uppercase`}
            value={values.ticker}
            onChange={(e) =>
              setValues((s) => ({
                ...s,
                ticker: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
              }))
            }
            placeholder="NUSA"
            maxLength={12}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contractAddress" className={labelClass}>
            Contract address (mint){" "}
            <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="contractAddress"
            name="contractAddress"
            required
            className={`${inputClass} font-mono text-[12px]`}
            value={values.contractAddress}
            onChange={set("contractAddress")}
            placeholder="Solana mint address"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="xLink" className={labelClass}>
            X account link
          </label>
          <input
            id="xLink"
            name="xLink"
            type="url"
            className={inputClass}
            value={values.xLink}
            onChange={set("xLink")}
            placeholder="https://x.com/yourproject"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="website" className={labelClass}>
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            className={inputClass}
            value={values.website}
            onChange={set("website")}
            placeholder="https://…"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="telegramLink" className={labelClass}>
            Telegram link
          </label>
          <input
            id="telegramLink"
            name="telegramLink"
            type="url"
            className={inputClass}
            value={values.telegramLink}
            onChange={set("telegramLink")}
            placeholder="https://t.me/…"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>
            Description <span className="text-[var(--accent)]">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={20}
            maxLength={2000}
            rows={6}
            className={`${inputClass} resize-y min-h-[140px]`}
            value={values.description}
            onChange={set("description")}
            placeholder="What is the project, who is it for, and how does it relate to your nation / sector narrative?"
          />
          <p className="mt-1.5 text-[11px] text-[var(--muted-faint)]">
            {values.description.length} / 2000 · minimum 20 characters
          </p>
        </div>
      </div>

      {serverError ? (
        <p
          className="mt-6 rounded-[var(--radius-sm)] border border-red-500/25 bg-red-500/10 px-3 py-2 text-[13px] text-red-200/95"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
        <p className="max-w-md text-[11px] leading-relaxed text-[var(--muted-faint)]">
          By submitting, you confirm details are accurate to the best of your
          knowledge. No automated listing.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--accent-dim)] px-5 py-2.5 text-[13px] font-semibold text-[var(--accent)] ring-1 ring-[var(--border-accent)]/70 transition-[opacity,transform] hover:bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit listing"}
        </button>
      </div>
    </form>
  );
}
