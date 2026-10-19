import type { ReactNode } from "react";

/** Kept for page compatibility: the shell already constrains width and padding. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

/** Mono, uppercase section label (DESIGN.md: eyebrow). */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow mb-3 text-[12px] text-ink-3">{children}</p>;
}

export function PageHead({ eyebrow, title, sub, actions }: { eyebrow: ReactNode; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-[40px] font-[340] leading-[1.05] tracking-[-0.035em] md:text-[56px]">{title}</h1>
        {sub && <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-2 md:text-[19px]">{sub}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** White card with a hairline border and large radius. No shadow: colour blocks carry emphasis. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[24px] border border-line bg-surface ${className}`}>{children}</div>;
}

const BLOCKS = {
  lime: "bg-block-lime text-ink",
  lilac: "bg-block-lilac text-ink",
  cream: "bg-block-cream text-ink",
  mint: "bg-block-mint text-ink",
  pink: "bg-block-pink text-ink",
  coral: "bg-block-coral text-ink",
  navy: "bg-block-navy text-white",
} as const;

/** Pastel story panel (DESIGN.md: color-block-section). */
export function Block({ tone, children, className = "" }: { tone: keyof typeof BLOCKS; children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[24px] ${BLOCKS[tone]} ${className}`}>{children}</div>;
}

export function CardHead({ title, sub, aside }: { title: ReactNode; sub?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{title}</h2>
        {sub && <p className="mt-1 text-sm leading-relaxed text-ink-3">{sub}</p>}
      </div>
      {aside}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-[28px] font-[340] tracking-[-0.03em] md:text-[34px]">{children}</h2>
      {sub && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-3">{sub}</p>}
    </div>
  );
}

export function Stat({ label, value, foot, icon }: { label: string; value: ReactNode; foot?: ReactNode; icon: string }) {
  return (
    <div className="rounded-[20px] border border-line bg-surface p-4 md:rounded-[24px] md:p-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-[11px] text-ink-3">{label}</span>
        <span aria-hidden className="hidden size-9 place-items-center rounded-full bg-sunken text-base sm:grid">
          {icon}
        </span>
      </div>
      <div className="tabular mt-3 text-[34px] font-[340] leading-none tracking-[-0.04em] md:mt-4 md:text-[48px]">{value}</div>
      {foot && <div className="mt-2 text-[13px] leading-snug text-ink-3 md:mt-3 md:text-sm">{foot}</div>}
    </div>
  );
}

const TONES = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  neutral: "bg-sunken text-ink-2",
  accent: "bg-block-lime text-ink",
  sky: "bg-block-lilac text-ink",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium ${TONES[tone]}`}>{children}</span>;
}

/** Pill buttons (DESIGN.md: button-secondary / button-primary). */
export const btn = "inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-5 py-2.5 text-[15px] font-medium text-ink hover:bg-sunken";
export const btnPrimary = "inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[15px] font-medium text-accent-ink hover:opacity-85";

/** Thin horizontal meter for a 0..100 component score, with the number shown as text. */
export function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-[13px]">
      <span className="text-ink-3">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-chart-track" aria-hidden>
        <span className="block h-full rounded-full bg-chart" style={{ width: `${Math.max(value, 2)}%` }} />
      </span>
      <span className="tabular text-right font-medium">
        {value}
        <span className="sr-only"> out of 100</span>
      </span>
    </div>
  );
}
