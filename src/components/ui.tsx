import type { ReactNode } from "react";

/** Kept for page compatibility: the shell already constrains width and padding. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.17em] text-accent-text">{children}</p>;
}

export function PageHead({ eyebrow, title, sub, actions }: { eyebrow: ReactNode; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-2xl font-bold leading-tight tracking-[-0.03em] md:text-[28px]">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-3">{sub}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[14px] border border-line bg-surface shadow-card ${className}`}>{children}</div>;
}

export function CardHead({ title, sub, aside }: { title: ReactNode; sub?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
        {sub && <p className="mt-1 text-[11px] leading-relaxed text-ink-3">{sub}</p>}
      </div>
      {aside}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-[19px] font-semibold tracking-[-0.02em]">{children}</h2>
      {sub && <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-3">{sub}</p>}
    </div>
  );
}

export function Stat({ label, value, foot, icon }: { label: string; value: ReactNode; foot?: ReactNode; icon: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-4 shadow-card md:px-[18px] md:py-[17px]">
      <div className="flex items-center justify-between text-[11px] text-ink-3 md:text-xs">
        {label}
        <span aria-hidden className="grid size-8 place-items-center rounded-[9px] bg-accent-soft text-base text-accent-text">
          {icon}
        </span>
      </div>
      <div className="tabular mt-2.5 mb-1 text-[23px] font-bold tracking-[-0.03em] md:text-[27px]">{value}</div>
      {foot && <div className="text-[11px] text-ink-3">{foot}</div>}
    </div>
  );
}

const TONES = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  neutral: "bg-sunken text-ink-2",
  accent: "bg-accent-soft text-accent-text",
  sky: "bg-sky-soft text-sky",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[10px] font-bold ${TONES[tone]}`}>{children}</span>;
}

export const btn = "inline-flex items-center justify-center gap-1.5 rounded-[9px] border border-line bg-surface px-3 py-2.5 text-xs font-semibold text-ink-2 hover:bg-sunken";
export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-[9px] bg-accent px-4 py-2.5 text-xs font-semibold text-accent-ink shadow-[0_4px_10px_rgba(0,119,182,0.2)] hover:opacity-90";

/** Thin horizontal meter for a 0..100 component score, with the number shown as text. */
export function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-2.5 text-[11px]">
      <span className="text-ink-3">{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-chart-track" aria-hidden>
        <span className="block h-full rounded-full bg-chart" style={{ width: `${Math.max(value, 2)}%` }} />
      </span>
      <span className="tabular text-right font-semibold text-ink-2">
        {value}
        <span className="sr-only"> out of 100</span>
      </span>
    </div>
  );
}
