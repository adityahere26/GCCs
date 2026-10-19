import Link from "next/link";
import { Cite } from "@/components/Cite";
import { Badge, btn, btnPrimary, Card, CardHead, PageHead, Stat } from "@/components/ui";
import { CITIES, LIMITS, OWNERSHIP, PEER_SOURCE, PEER_TOTAL, PRIORITIES, SECTORS, TIMELINES, peerTotals } from "@/lib/engine";
import { evaluation, fact, show } from "@/lib/ledger";
import { EXAMPLE_BRIEF } from "@/lib/site";

const field =
  "mt-1.5 block w-full rounded-[9px] border border-line bg-surface px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelCls = "block text-xs font-semibold text-ink";
const hint = "mt-1 text-[11px] text-ink-3";

export default function Home() {
  const talent = CITIES.map((c) => ({ name: c.name, pool: fact(c.talent.pool), swe: fact(c.talent.swe) })).sort((a, b) => (b.pool.num ?? 0) - (a.pool.num ?? 0));
  const maxPool = Math.max(...talent.map((t) => t.pool.num ?? 0));
  const peers = peerTotals();
  const maxPeers = Math.max(...peers.map((p) => p.total));
  const counts = ["count-flexiple", "count-govt", "count-ey", "count-zinnov-parents", "count-zinnov-units"].map(fact);

  return (
    <>
      <PageHead
        eyebrow="India's GCC ecosystem · Evidence workspace"
        title="Know the market before you enter it."
        sub="A city shortlist, pay benchmarks, state incentives you may qualify for and an honest comparison of setup models. Every figure links to the sentence it came from."
        actions={
          <>
            <Link href="/evidence" className={btn}>
              ✓ Evidence ledger
            </Link>
            <a href="#plan" className={btnPrimary}>
              ✧ Build my brief
            </a>
          </>
        }
      />

      <div className="mb-[18px] grid grid-cols-2 gap-2.5 md:gap-[15px] lg:grid-cols-4">
        <Stat icon="✓" label="Facts verified" value={evaluation.verified} foot={<><b className="text-accent-text">{evaluation.probesCaught}/{evaluation.probes}</b> fabricated test facts caught</>} />
        <Stat icon="◎" label="Sources read" value={evaluation.sourcesFetched} foot={`of ${evaluation.sources} attempted; blocked ones are excluded`} />
        <Stat icon="⌖" label="Metros compared" value={CITIES.length} foot="Talent, pay, peers and incentives" />
        <Stat icon="◫" label="Verified GCCs mapped" value={PEER_TOTAL} foot="From Flexiple's public directory" />
      </div>

      <div className="mb-[18px] grid gap-[17px] xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,1fr)]">
        <form id="plan" action="/brief" method="get" aria-labelledby="form-title">
          <Card className="p-5 md:p-6">
            <CardHead title={<span id="form-title">Plan your India centre</span>} sub="Takes under a minute. All fields except company name are required." aside={<Badge tone="accent">Free · no sign-up</Badge>} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c" className={labelCls}>
                  Company name <span className="font-normal text-ink-3">(optional)</span>
                </label>
                <input id="c" name="c" maxLength={80} autoComplete="organization" placeholder="e.g. Acme Robotics" className={field} />
                <p className={hint}>Only used as the brief&apos;s title.</p>
              </div>
              <div>
                <label htmlFor="sector" className={labelCls}>
                  Sector
                </label>
                <select id="sector" name="sector" required defaultValue="" className={field}>
                  <option value="" disabled>
                    Choose a sector
                  </option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className={hint}>Used to count peer centres in each city.</p>
              </div>
              <div>
                <label htmlFor="n" className={labelCls}>
                  Team size in 12 months
                </label>
                <input id="n" name="n" type="number" inputMode="numeric" required min={LIMITS.headcountMin} max={LIMITS.headcountMax} step={1} placeholder="e.g. 40" className={field} />
                <p className={hint}>Drives policy eligibility and setup model fit.</p>
              </div>
              <div>
                <label htmlFor="s" className={labelCls}>
                  Share of senior hires (6+ years), %
                </label>
                <input id="s" name="s" type="number" inputMode="numeric" required min={0} max={100} step={1} defaultValue={30} className={field} />
                <p className={hint}>Weights the junior and senior pay medians.</p>
              </div>
              <fieldset className="sm:col-span-2">
                <legend className={labelCls}>What matters most?</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {Object.entries(PRIORITIES).map(([k, v], i) => (
                    <label
                      key={k}
                      className="flex cursor-pointer items-center gap-2 rounded-[9px] border border-line px-3 py-2.5 text-xs has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent-text has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40"
                    >
                      <input type="radio" name="p" value={k} defaultChecked={i === 0} className="accent-[var(--accent)]" />
                      {v.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="t" className={labelCls}>
                  First hires needed
                </label>
                <select id="t" name="t" defaultValue="mid" className={field}>
                  {Object.entries(TIMELINES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="o" className={labelCls}>
                  Do you want your own Indian entity?
                </label>
                <select id="o" name="o" defaultValue="later" className={field}>
                  {Object.entries(OWNERSHIP).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-[11px] leading-relaxed text-ink-3">
                Nothing you enter is stored. Answers go in the brief&apos;s web address so it can be built and shared, so anyone you send the link to
                sees them.{" "}
                <Link href="/privacy" className="underline underline-offset-2">
                  Privacy
                </Link>
              </p>
              <button type="submit" className={btnPrimary}>
                Build my brief →
              </button>
            </div>
          </Card>
        </form>

        <div className="flex flex-col gap-[17px]">
          <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-[#05304d] to-[#0a5a8a] p-5 text-white">
            <span aria-hidden className="pointer-events-none absolute -top-6 right-2 text-[90px] text-white/5">
              ✧
            </span>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#90e0ef]">✧ Example brief</p>
            <h3 className="mt-2 max-w-xs text-[17px] font-semibold leading-snug">Where should a 200-person fintech GCC set up?</h3>
            <p className="mt-2 max-w-sm text-[11px] leading-relaxed text-[#cfe6f2]">
              Six metros scored on talent, pay, peer centres and state incentives, with setup models compared and every number cited.
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#b3d3e4]">4 factors · 6 cities · 4 setup models</span>
              <Link href={EXAMPLE_BRIEF} className="rounded-[9px] bg-white px-3 py-2 text-xs font-semibold text-[#05304d] hover:bg-[#e0f4fb]">
                Open brief ↗
              </Link>
            </div>
          </div>

          <Card className="p-5">
            <CardHead
              title="How many GCCs does India have?"
              sub="It depends who you ask, and what they count."
              aside={
                <Link href="/counts" className="shrink-0 text-[11px] font-bold text-accent-text hover:underline">
                  Why →
                </Link>
              }
            />
            <ul className="divide-y divide-line">
              {counts.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="min-w-0 text-xs text-ink-2">{c.field}</span>
                  <span className="tabular shrink-0 text-[13px] font-bold">
                    {show(c)}
                    <Cite claims={[c]} label={c.publisher} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-[17px] lg:grid-cols-2">
        <Card className="p-5">
          <CardHead title="Talent pool by metro" sub="Professionals tracked in Flexiple's published talent data, Aug 2026" aside={<Badge tone="sky">Measured</Badge>} />
          <ul className="flex flex-col gap-3">
            {talent.map((t) => (
              <li key={t.name} className="grid grid-cols-[80px_1fr_auto] items-center gap-2.5 text-[11px] md:grid-cols-[95px_1fr_auto]">
                <span className="text-ink-2">{t.name}</span>
                <span className="h-2 overflow-hidden rounded-full bg-chart-track" aria-hidden>
                  <span className="block h-full rounded-full bg-chart" style={{ width: `${((t.pool.num ?? 0) / maxPool) * 100}%` }} />
                </span>
                <span className="tabular text-right font-bold">
                  {t.pool.value}
                  <Cite claims={[t.pool]} label="Flexiple" />
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <CardHead
            title="Verified GCCs by metro"
            sub="Centres in Flexiple's directory with a presence in each city"
            aside={
              <a href={PEER_SOURCE.url} target="_blank" rel="noopener noreferrer nofollow" className="shrink-0 text-[11px] font-bold text-accent-text hover:underline">
                Source ↗
              </a>
            }
          />
          <ul className="flex flex-col gap-3">
            {peers.map((p) => (
              <li key={p.name} className="grid grid-cols-[80px_1fr_36px] items-center gap-2.5 text-[11px] md:grid-cols-[95px_1fr_38px]">
                <span className="text-ink-2">{p.name}</span>
                <span className="h-2 overflow-hidden rounded-full bg-chart-track" aria-hidden>
                  <span className="block h-full rounded-full bg-chart" style={{ width: `${(p.total / maxPeers) * 100}%` }} />
                </span>
                <span className="tabular text-right font-bold">{p.total}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[10px] text-ink-3">A centre with offices in several cities is counted in each, so rows add up to more than {PEER_TOTAL}.</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {[
          { t: "Sourced, not summarised", d: "AI extracts each fact with the exact sentence it came from. Code checks that sentence exists in the source before anything is shown." },
          { t: "Disagreements shown", d: "When reports disagree, you see every number and why they differ, instead of one confident average." },
          { t: "Honest about its maker", d: "The concept is pitched to a company that sells GCC services. The brief says so, and tells you when that service is the wrong choice." },
        ].map((x) => (
          <div key={x.t}>
            <h3 className="text-[13px] font-semibold">{x.t}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-3">{x.d}</p>
          </div>
        ))}
      </div>
    </>
  );
}
