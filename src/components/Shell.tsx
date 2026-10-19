"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { EXAMPLE_BRIEF } from "@/lib/site";

const NAV = [
  { href: "/", label: "Plan", crumb: "Plan" },
  { href: "/brief", label: "Brief", crumb: "Brief", example: true },
  { href: "/evidence", label: "Evidence", crumb: "Evidence" },
  { href: "/ask", label: "Ask", crumb: "Ask" },
  { href: "/counts", label: "Counts", crumb: "Counts" },
  { href: "/method", label: "Method", crumb: "Method" },
];

const LEGAL: Record<string, string> = { "/about": "About", "/privacy": "Privacy", "/terms": "Terms", "/cookies": "Cookies" };

export function Shell({ children, verified, total, probes, sources }: { children: ReactNode; verified: number; total: number; probes: string; sources: number }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
            <span aria-hidden className="grid size-7 place-items-center rounded-full bg-ink text-[11px] font-bold text-accent-ink">
              GT
            </span>
            Ground Truth
          </Link>
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1 text-[15px]">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.example ? EXAMPLE_BRIEF : n.href}
                    // Briefs are rendered per request, so there is nothing useful to prefetch.
                    prefetch={n.example ? false : undefined}
                    aria-current={active(n.href) ? "page" : undefined}
                    className={`rounded-full px-3.5 py-1.5 ${active(n.href) ? "bg-ink text-accent-ink" : "hover:bg-sunken"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/method" className="hidden rounded-full border border-line px-4 py-1.5 text-[15px] font-medium hover:bg-sunken sm:inline-flex">
              How it works
            </Link>
            <Link href="/" className="rounded-full bg-ink px-4 py-1.5 text-[15px] font-medium text-accent-ink hover:opacity-85">
              New brief
            </Link>
          </div>
        </div>
        <nav aria-label="Main (mobile)" className="border-t border-line lg:hidden">
          <ul className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-3 py-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href} className="shrink-0">
                <Link
                  href={n.example ? EXAMPLE_BRIEF : n.href}
                  prefetch={n.example ? false : undefined}
                  aria-current={active(n.href) ? "page" : undefined}
                  className={`block rounded-full px-3 py-1 ${active(n.href) ? "bg-ink text-accent-ink" : "hover:bg-sunken"}`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="bg-ink text-accent-ink">
        <p className="eyebrow mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 text-[11px] md:px-8">
          <span>
            {verified}/{total} facts verified against source
          </span>
          <span aria-hidden>·</span>
          <span>{probes} fabricated test facts caught</span>
          <span aria-hidden>·</span>
          <span>{sources} sources read</span>
        </p>
      </div>

      <main id="main" className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-8 md:py-12">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-12 md:grid-cols-[1fr_auto] md:px-8">
          <div>
            <p className="text-[22px] font-semibold tracking-[-0.03em]">Ground Truth</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-3">
              Independent concept prototype built for a Flexiple product internship assignment. Not affiliated with or endorsed by Flexiple. Figures
              are quoted from public sources and linked.
            </p>
          </div>
          <nav aria-label="Legal">
            <p className="eyebrow mb-3 text-[11px] text-ink-3">Legal</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm md:flex-col">
              {Object.entries(LEGAL).map(([href, label]) => (
                <li key={href}>
                  <Link className="hover:underline" href={href}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
