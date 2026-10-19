"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { EXAMPLE_BRIEF } from "@/lib/site";

const NAV = [
  { href: "/", label: "Plan a GCC", icon: "▦", crumb: "Plan" },
  { href: "/brief", label: "Example brief", icon: "▤", crumb: "Brief", example: true },
  { href: "/evidence", label: "Evidence ledger", icon: "✓", crumb: "Evidence" },
  { href: "/counts", label: "Count reconciler", icon: "◫", crumb: "Counts" },
  { href: "/method", label: "Method", icon: "✧", crumb: "Method" },
];

const LEGAL: Record<string, string> = { "/about": "About", "/privacy": "Privacy", "/terms": "Terms", "/cookies": "Cookies" };

export function Shell({ children, verified, total }: { children: ReactNode; verified: number; total: number }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const crumb = NAV.find((n) => active(n.href))?.crumb ?? LEGAL[path] ?? "Page";
  const pct = Math.round((verified / total) * 100);

  return (
    <div className="flex min-h-dvh">
      <aside className="w-[66px] shrink-0 bg-side text-side-ink md:w-[236px]">
        <div className="sticky top-0 flex h-dvh flex-col px-2 py-5 md:px-4 md:py-6">
        <Link href="/" className="flex items-center gap-2.5 px-2 pb-7 text-white md:px-2.5">
          <span aria-hidden className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-[#90e0ef] to-[#00b4d8] text-[13px] font-bold text-[#03304d]">
            GT
          </span>
          <span className="hidden md:block">
            <span className="block text-[17px] font-bold leading-tight tracking-tight">Ground Truth</span>
            <span className="block text-[10px] font-medium tracking-[0.14em] text-side-dim">INDIA GCC INTELLIGENCE</span>
          </span>
        </Link>

        <p className="hidden px-3 pb-2 text-[10px] font-bold tracking-[0.14em] text-side-dim md:block">WORKSPACE</p>
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1">
            {NAV.map((n) => {
              const on = active(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.example ? EXAMPLE_BRIEF : n.href}
                    aria-current={on ? "page" : undefined}
                    title={n.label}
                    className={`flex items-center justify-center gap-3 rounded-[9px] px-1.5 py-3 text-[13px] md:justify-start md:px-3 md:py-2.5 ${
                      on ? "bg-side-2 text-white shadow-[inset_3px_0_var(--side-active)]" : "hover:bg-side-2 hover:text-white"
                    }`}
                  >
                    <span aria-hidden className="w-5 text-center text-base">
                      {n.icon}
                    </span>
                    <span className="hidden md:inline">{n.label}</span>
                    <span className="sr-only md:hidden">{n.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto hidden border-t border-side-line px-2 pt-4 md:block">
          <div className="rounded-xl border border-side-line bg-side-2 p-3">
            <p className="text-xs font-semibold text-white">
              <span aria-hidden className="text-side-active">◉</span> Data confidence
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-side-ink">Every number traces to a quote that code checked against its source.</p>
            <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-side-line" aria-hidden>
              <span className="block h-full rounded-full bg-side-active" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 flex justify-between text-[10px] text-side-dim">
              <span>Facts verified</span>
              <b className="text-side-ink">
                {verified}/{total}
              </b>
            </p>
          </div>
        </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[62px] items-center justify-between gap-4 border-b border-line bg-surface px-4 md:h-[70px] md:px-8">
          <p className="text-xs text-ink-3">
            Workspace&nbsp;&nbsp;/&nbsp;&nbsp;<b className="font-semibold text-ink">{crumb}</b>
          </p>
          <div className="flex items-center gap-2">
            <Link href="/method" className="hidden rounded-[9px] border border-line px-3 py-2 text-xs font-semibold text-ink-2 hover:bg-sunken sm:inline-flex">
              How it works
            </Link>
            <Link href="/" className="rounded-[9px] bg-accent px-3 py-2 text-xs font-semibold text-accent-ink shadow-[0_4px_10px_rgba(0,119,182,0.2)] hover:opacity-90">
              New brief
            </Link>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1240px] flex-1 px-3 py-5 sm:px-5 md:px-8 md:py-7">
          {children}
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-3 py-6 text-[11px] text-ink-3 sm:px-5 md:flex-row md:items-center md:justify-between md:px-8">
            <p className="max-w-2xl leading-relaxed">
              Independent concept prototype built for a Flexiple product internship assignment. Not affiliated with or endorsed by Flexiple.
              Figures are quoted from public sources and linked.
            </p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {Object.entries(LEGAL).map(([href, label]) => (
                  <li key={href}>
                    <Link className="hover:text-ink" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
