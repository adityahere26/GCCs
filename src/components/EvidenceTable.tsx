"use client";

import { useMemo, useState } from "react";
import { REASON_LABEL, TIER_LABEL, show, type Claim, type Status } from "@/lib/ledger";

const FILTERS: { id: "all" | Status | "probe"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "verified", label: "Verified" },
  { id: "rejected", label: "Rejected" },
  { id: "unverifiable", label: "Source unavailable" },
  { id: "probe", label: "Test probes" },
];

const STATUS_STYLE: Record<Status, string> = {
  verified: "bg-ok-soft text-ok",
  rejected: "bg-bad-soft text-bad",
  unverifiable: "bg-warn-soft text-warn",
};

export function EvidenceTable({ rows }: { rows: Claim[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "probe" ? !r.probe : filter !== "all" && (r.probe || r.status !== filter)) return false;
      if (filter === "all" && r.probe) return false;
      if (!needle) return true;
      return [r.field, r.subject, r.value, r.quote, r.publisher].some((s) => s.toLowerCase().includes(needle));
    });
  }, [rows, q, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink-2 aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:text-accent"
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="sm:w-64">
          <span className="sr-only">Search evidence</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search facts, cities, sources"
            className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </label>
      </div>

      <p className="mt-4 text-sm text-ink-3" aria-live="polite">
        {shown.length} {shown.length === 1 ? "row" : "rows"}
      </p>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-3">No rows match. Try another filter or search term.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
          {shown.map((r) => (
            <li key={r.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
              <div>
                <p className="text-sm font-medium">{r.field}</p>
                <p className="text-xs text-ink-3">
                  {r.subject} · {r.asOf}
                </p>
                <p className="tabular mt-1 text-lg font-semibold">{show(r)}</p>
              </div>
              <div className="min-w-0">
                <blockquote className={`text-sm text-ink-2 ${r.status === "rejected" ? "line-through decoration-bad/60" : ""}`}>“{r.quote}”</blockquote>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                  {r.probe && <span className="rounded-full bg-sunken px-2 py-0.5 font-medium text-ink-2">test probe</span>}
                  <span className="text-ink-3">{REASON_LABEL[r.reason] ?? r.reason}</span>
                  <span className="text-ink-3">·</span>
                  <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-accent underline underline-offset-2">
                    {r.publisher}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <span className="text-ink-3">{TIER_LABEL[r.tier]}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
