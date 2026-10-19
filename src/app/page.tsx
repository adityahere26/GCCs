import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { LIMITS, OWNERSHIP, PRIORITIES, SECTORS, TIMELINES } from "@/lib/engine";
import { evaluation } from "@/lib/ledger";

const field = "mt-1.5 block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";
const labelCls = "block text-sm font-medium text-ink";
const hint = "mt-1 text-xs text-ink-3";

export default function Home() {
  return (
    <>
      <Container className="pt-14 pb-10 sm:pt-20">
        <Eyebrow>India GCC entry brief · free · every number sourced</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Plan your India centre on evidence, not referrals.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
          Tell us what you need. Get a city shortlist, pay benchmarks, state incentives you may qualify for and an honest
          comparison of operating models. Every figure links to the sentence it came from.
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-ink-3">Facts checked against source</dt>
            <dd className="tabular text-xl font-semibold">{evaluation.verified}</dd>
          </div>
          <div>
            <dt className="text-ink-3">Sources read</dt>
            <dd className="tabular text-xl font-semibold">{evaluation.sourcesFetched}</dd>
          </div>
          <div>
            <dt className="text-ink-3">Fabricated test facts caught</dt>
            <dd className="tabular text-xl font-semibold">
              {evaluation.probesCaught}/{evaluation.probes}
            </dd>
          </div>
        </dl>
      </Container>

      <Container>
        <form action="/brief" method="get" className="rounded-2xl border border-line bg-surface p-5 sm:p-8" aria-labelledby="form-title">
          <h2 id="form-title" className="text-lg font-semibold tracking-tight">
            Your plan
          </h2>
          <p className="mt-1 text-sm text-ink-3">Takes under a minute. All fields except company name are required.</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
              <p className={hint}>Drives policy eligibility and which operating models make sense.</p>
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
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                {Object.entries(PRIORITIES).map(([k, v], i) => (
                  <label key={k} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line-strong px-3 py-2.5 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
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

          <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-xs leading-relaxed text-ink-3">
              Nothing you enter is stored. Your answers are placed in the brief&apos;s web address so the page can be built
              and shared, so anyone you send the link to will see them. <Link href="/privacy" className="underline underline-offset-2">Privacy</Link>
            </p>
            <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-ink hover:opacity-90">
              Build my brief
            </button>
          </div>
        </form>
      </Container>

      <Container className="mt-16 grid gap-8 sm:grid-cols-3">
        {[
          { t: "Sourced, not summarised", d: "AI extracts each fact with the exact sentence it came from. Code then checks that sentence exists in the source before anything is shown." },
          { t: "Disagreements shown", d: "When reports disagree, you see every number and why they differ, instead of one confident average." },
          { t: "Honest about its maker", d: "The concept is pitched to a company that sells GCC services. The brief says so, and tells you when that service is the wrong choice." },
        ].map((x) => (
          <div key={x.t}>
            <h3 className="font-medium">{x.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-3">{x.d}</p>
          </div>
        ))}
      </Container>
    </>
  );
}
