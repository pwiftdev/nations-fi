const steps = [
  {
    title: "Submit application",
    body: "Nation, ticker, contract, and links — everything we need for a first review.",
    state: "current" as const,
  },
  {
    title: "Automated checks",
    body: "Contract shape, metadata, duplicate listings, and obvious abuse signals (mocked for now).",
    state: "pending" as const,
  },
  {
    title: "Human review",
    body: "Nation-sector fit, liquidity expectations, and community risk (mock queue).",
    state: "pending" as const,
  },
  {
    title: "Go live on map + screener",
    body: "Pinned anchor, screener row, and optional social announcement kit.",
    state: "pending" as const,
  },
];

export function ListingRoadmap() {
  return (
    <section
      className="mb-10 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-1)]/50 p-5 shadow-[var(--shadow-sm)] backdrop-blur-sm sm:p-6"
      aria-labelledby="listing-roadmap-title"
    >
      <h2
        id="listing-roadmap-title"
        className="font-brand text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]"
      >
        Listing pipeline
      </h2>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted-faint)]">
        Preview of the journey — statuses are illustrative until review is wired
        up.
      </p>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-mono font-semibold tabular-nums ${
                s.state === "current"
                  ? "border-[var(--border-accent)] bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface-2)]/80 text-[var(--muted)]"
              }`}
            >
              {i + 1}
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[var(--foreground)]">
                {s.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--muted)]">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
