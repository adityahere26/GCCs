import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-5xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-3">{children}</p>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>;
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
      {sub && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-3">{sub}</p>}
    </div>
  );
}

const TONES = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  neutral: "bg-sunken text-ink-2",
  accent: "bg-accent-soft text-accent",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>{children}</span>;
}

/** Thin horizontal meter for a 0..100 component score, with the number shown as text. */
export function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-2 text-xs">
      <span className="text-ink-3">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
        <span className="block h-full rounded-full bg-chart" style={{ width: `${Math.max(value, 2)}%` }} />
      </span>
      <span className="tabular text-right text-ink-2">
        {value}
        <span className="sr-only"> out of 100</span>
      </span>
    </div>
  );
}
