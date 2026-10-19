import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SITE } from "@/lib/site";
import "./globals.css";

// next/font downloads these at build time and serves them from this site,
// so visitors' browsers never contact Google.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: plan an India GCC on evidence`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: { title: SITE.name, description: SITE.description, type: "website", siteName: SITE.name },
  twitter: { card: "summary", title: SITE.name, description: SITE.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#121211" },
  ],
};

const NAV = [
  { href: "/", label: "Plan" },
  { href: "/evidence", label: "Evidence" },
  { href: "/counts", label: "Counts" },
  { href: "/method", label: "Method" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh flex flex-col`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:shadow">
          Skip to content
        </a>
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span aria-hidden className="grid size-6 place-items-center rounded-md bg-accent text-[11px] font-bold text-accent-ink">
                GT
              </span>
              {SITE.name}
            </Link>
            <nav aria-label="Main">
              <ul className="flex gap-1 text-sm">
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="rounded-md px-2.5 py-1.5 text-ink-2 hover:bg-sunken hover:text-ink">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="mt-20 border-t border-line">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 text-sm text-ink-3 sm:grid-cols-[1fr_auto] sm:px-6">
            <p className="max-w-xl leading-relaxed">
              Independent concept prototype by {SITE.author}, built for a Flexiple product internship assignment.
              Not affiliated with or endorsed by Flexiple. Figures are quoted from public sources and linked; check them before
              relying on them.
            </p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-4 gap-y-2">
                <li><Link className="hover:text-ink" href="/about">About</Link></li>
                <li><Link className="hover:text-ink" href="/privacy">Privacy</Link></li>
                <li><Link className="hover:text-ink" href="/terms">Terms</Link></li>
                <li><Link className="hover:text-ink" href="/cookies">Cookies</Link></li>
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
