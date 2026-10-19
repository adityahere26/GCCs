import type { Metadata } from "next";
import Link from "next/link";
import { Cite } from "@/components/Cite";
import { ExplainBrief } from "@/components/ExplainBrief";
import { Badge, btn, Card, Container, Eyebrow, Meter, PageHead, SectionTitle } from "@/components/ui";
import { buildBrief, OWNERSHIP, parseInput, toQuery, PEER_SOURCE, PEER_TOTAL, PRIORITIES, TIMELINES, type CityResult, type Eligibility, type ModelResult } from "@/lib/engine";
import { evaluation, fact, realClaims, show } from "@/lib/ledger";

export const metadata: Metadata = {
  title: "Your India entry brief",
  // Briefs carry user inputs in the URL; keep them out of search engines.
  robots: { index: false, follow: false },
};

const COMPONENT_LABEL = { talent: "talent depth", peers: "peer centres", incentives: "state incentives" } as const;

/** Names the score components where the top city beats the cheapest one, largest gap first. */
function whyTop(top: CityResult, cheapest: CityResult): string {
  const gaps = (Object.keys(COMPONENT_LABEL) as (keyof typeof COMPONENT_LABEL)[])
    .map((k) => ({ k, gap: top.components[k] - cheapest.components[k] }))
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .map((g) => COMPONENT_LABEL[g.k]);
  return gaps.length > 1 ? `${gaps.slice(0, -1).join(", ")} and ${gaps.at(-1)}` : (gaps[0] ?? "your other priorities");
}

type SP = Promise<Record<string, string | string[] | undefined>>;

const ELIGIBILITY: Record<Eligibility, { tone: "ok" | "warn" | "bad" | "neutral"; label: string }> = {
  likely: { tone: "ok", label: "Likely eligible" },
  check: { tone: "warn", label: "Check eligibility" },
  unlikely: { tone: "bad", label: "Unlikely" },
  none: { tone: "neutral", label: "No policy" },
};

const FIT: Record<ModelResult["fit"], { tone: "ok" | "warn" | "bad"; label: string }> = {
  recommended: { tone: "ok", label: "Good fit" },
  consider: { tone: "warn", label: "Possible" },
  "not-recommended": { tone: "bad", label: "Poor fit" },
};

export default async function BriefPage({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;
  const flat = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const { input, errors } = parseInput(flat);

  if (!input) {
    return (
      <Container>
        <Eyebrow>Brief</Eyebrow>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">We need a little more to build your brief</h1>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-ink-2" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-[15px] font-medium text-accent-ink">
          Back to the form
        </Link>
      </Container>
    );
  }

  const b = buildBrief(input);
  const top = b.cities[0];
  const cheapest = b.cities.reduce((a, c) => (c.annualPayrollCrore < a.annualPayrollCrore ? c : a));
  const unverified = realClaims.filter((c) => c.status !== "verified");
  const title = input.company ? `${input.company}: India entry brief` : "Your India entry brief";

  return (
    <Container>
      <PageHead
        eyebrow={`India entry brief · built from ${evaluation.verified} verified facts`}
        title={title}
        sub={`${input.headcount} people in ${input.sector} · ${input.seniorShare}% senior · priority: ${PRIORITIES[input.priority].label.toLowerCase()} · first hires ${TIMELINES[input.timeline].toLowerCase()} · ${OWNERSHIP[input.ownership].toLowerCase()}`}
        actions={
          <>
            <Link href="/" className={btn}>
              ← Edit inputs
            </Link>
            <Link href="/evidence" className={btn}>
              ✓ Evidence
            </Link>
          </>
        }
      />
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-3">
        <span>
          <span aria-hidden>✓</span> verified source
        </span>
        <span>
          <span aria-hidden className="text-warn">◆</span> vendor source (treat as estimate)
        </span>
      </p>

      {/* Disclosure */}
      <div className="mt-5 rounded-[16px] bg-block-cream px-5 py-4 text-[15px] leading-relaxed text-ink">
        <strong className="font-semibold">Disclosure:</strong> this concept is pitched to Flexiple, which sells GCC setup and managed teams.
        Its option appears below with the same rules as every other model, including when it is the wrong choice.
      </div>

      <ExplainBrief query={toQuery(input)} />

      {/* Headline */}
      <Card className="mt-8 p-6">
        <SectionTitle sub="Ranked by your priority weights. Scores compare these six metros only; they are not absolute ratings.">Recommendation</SectionTitle>
        <p className="text-lg leading-relaxed">
          Start with <strong>{top.name}</strong>. For your role mix the blended pay median there is{" "}
          <strong className="tabular">₹{top.blendedMedianLakh}L</strong>
          <Cite claims={[top.swe, top.senior]} label="Flexiple talent data" /> a year, about{" "}
          <strong className="tabular">₹{top.annualPayrollCrore} crore</strong> in base salaries for {input.headcount} people, with{" "}
          <strong className="tabular">{top.sectorPeers}</strong> {input.sector} centres already in the city
          <a href={PEER_SOURCE.url} target="_blank" rel="noopener noreferrer nofollow" className="ml-1 text-sm text-ink underline underline-offset-2">
            (Flexiple directory)
          </a>
          .
        </p>
        {cheapest.id !== top.id && (
          <p className="mt-4 rounded-[16px] bg-block-mint px-5 py-3 text-[15px] text-ink">
            Lowest payroll is <strong>{cheapest.name}</strong> at <span className="tabular">₹{cheapest.annualPayrollCrore} crore</span> a year (
            <span className="tabular">₹{Math.round((top.annualPayrollCrore - cheapest.annualPayrollCrore) * 10) / 10} crore</span> less).{" "}
            {top.name} ranks higher on {whyTop(top, cheapest)}. See the score breakdown below.
          </p>
        )}
        <p className="mt-3 text-sm text-ink-3">
          Base salary medians exclude benefits, office and overheads. A vendor estimate of fully loaded cost is {b.runCost.text}
          <Cite claims={b.runCost.cite} />. The two measure different things, so they are shown separately rather than combined.
        </p>
      </Card>

      {/* Cities */}
      <section className="mt-12" aria-labelledby="cities">
        <SectionTitle sub={`Talent and pay from Flexiple's published talent data; peer counts from its directory of ${PEER_TOTAL} verified centres; fit-out cost from Cushman & Wakefield.`}>
          <span id="cities">City shortlist</span>
        </SectionTitle>
        <ol className="grid gap-4">
          {b.cities.map((c, idx) => (
            <li key={c.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold">
                    <span className="tabular mr-2 text-ink-3">{idx + 1}</span>
                    {c.name}
                  </h3>
                  <span className="tabular text-sm text-ink-2">
                    Score <strong className="text-lg text-ink">{c.score}</strong>
                    <span className="text-ink-3">/100</span>
                  </span>
                </div>

                <div className="mt-4 grid gap-6 md:grid-cols-[1fr_16rem]">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-ink-3">Tracked professionals</dt>
                      <dd className="tabular font-medium">
                        {c.pool.value}+<Cite claims={[c.pool]} label="Flexiple" />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-3">Engineer median</dt>
                      <dd className="tabular font-medium">
                        {c.swe.value}<Cite claims={[c.swe]} label="Flexiple" />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-3">Senior median</dt>
                      <dd className="tabular font-medium">
                        {c.senior.value}<Cite claims={[c.senior]} label="Flexiple" />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-3">{input.sector} peers</dt>
                      <dd className="tabular font-medium">
                        {c.sectorPeers} <span className="text-ink-3">of {c.totalPeers}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-3">Fit-out / sq ft</dt>
                      <dd className="tabular font-medium">
                        ₹{c.fitout.value}<Cite claims={[c.fitout]} label="C&W" />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-3">Base payroll / yr</dt>
                      <dd className="tabular font-medium">₹{c.annualPayrollCrore} cr</dd>
                    </div>
                  </dl>
                  <div className="space-y-2" aria-label={`${c.name} score breakdown`}>
                    <Meter label="Talent depth" value={c.components.talent} />
                    <Meter label="Cost" value={c.components.cost} />
                    <Meter label="Peers" value={c.components.peers} />
                    <Meter label="Incentives" value={c.components.incentives} />
                  </div>
                </div>

                {c.peerExamples.length > 0 && (
                  <p className="mt-4 text-xs text-ink-3">
                    Peers include {c.peerExamples.slice(0, 4).join(", ")}
                    {c.sectorPeers > 4 ? " and others" : ""}.
                  </p>
                )}

                <div className="mt-4 grid gap-3 border-t border-line pt-4">
                  {c.policies.map((p) => (
                    <div key={p.state} className="text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{p.state}</span>
                        <Badge tone={ELIGIBILITY[p.status].tone}>{ELIGIBILITY[p.status].label}</Badge>
                      </div>
                      <p className="mt-1 text-ink-2">{p.headline}</p>
                      <ul className="mt-1 space-y-1 text-ink-3">
                        {p.reasons.map((r) => (
                          <li key={r.text}>
                            {r.text}
                            <Cite claims={r.cite} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {c.signals.length > 0 && (
                    <ul className="space-y-1 text-sm text-ink-3">
                      {c.signals.map((s) => (
                        <li key={s.id}>
                          <span className="text-ink-2">{s.field}:</span> {show(s)}
                          <Cite claims={[s]} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Models */}
      <section className="mt-12" aria-labelledby="models">
        <SectionTitle sub="Rule-based, using your team size, timeline and ownership answer. Fees are on top of salaries. Most cost figures come from vendors who sell these models.">
          <span id="models">How to set up</span>
        </SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {b.models.map((m) => (
            <Card key={m.id} className={`p-5 ${m.isFlexiple ? "border-dashed" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{m.name}</h3>
                <Badge tone={FIT[m.fit].tone}>{FIT[m.fit].label}</Badge>
              </div>
              {m.isFlexiple && <p className="mt-1 text-xs text-warn">Sold by Flexiple, the company this concept is pitched to.</p>}
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-ink-3">Time to start</dt>
                  <dd>
                    {m.timeToStart.text}
                    <Cite claims={m.timeToStart.cite} />
                  </dd>
                </div>
                {m.monthlyFee && (
                  <div>
                    <dt className="text-ink-3">Recurring fees</dt>
                    <dd className="tabular">
                      {m.monthlyFee.text}
                      <Cite claims={m.monthlyFee.cite} />
                    </dd>
                  </div>
                )}
                {m.oneTime && (
                  <div>
                    <dt className="text-ink-3">One-time</dt>
                    <dd className="tabular">
                      {m.oneTime.text}
                      <Cite claims={m.oneTime.cite} />
                    </dd>
                  </div>
                )}
              </dl>
              <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm text-ink-2">
                {m.reasons.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span aria-hidden className="text-ink-3">–</span>
                    {r}
                  </li>
                ))}
              </ul>
              {m.id === "captive" && (
                <p className="mt-3 text-xs text-ink-3">
                  Breakeven reference<Cite claims={[fact("cost-captive-breakeven")]} />
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Conflicts */}
      <section className="mt-12" aria-labelledby="conflicts">
        <SectionTitle sub="We show the spread instead of picking one number. See the Counts page for why the GCC totals differ.">
          <span id="conflicts">Where sources disagree</span>
        </SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {b.conflicts.map((c) => (
            <Card key={c.topic} className="p-5">
              <h3 className="font-medium">{c.topic}</h3>
              <p className="mt-1 text-sm text-ink-3">{c.note}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {c.values.map((v) => (
                  <li key={v.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-ink-2">{v.field}</span>
                    <span className="tabular font-medium">
                      {show(v)}
                      <Cite claims={[v]} label={v.publisher} />
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Could not verify */}
      <section className="mt-12" aria-labelledby="unverified">
        <Card className="bg-sunken p-6">
          <h2 id="unverified" className="text-lg font-semibold tracking-tight">
            What we could not verify
          </h2>
          <p className="mt-1 text-sm text-ink-3">Left out of every number above. Listed so you know what is missing.</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-2">
            {unverified.map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.field}</span> ({c.subject}): “{c.value}”, claimed by {c.publisher}.{" "}
                <span className="text-ink-3">{c.status === "unverifiable" ? "Source could not be fetched." : "Our extraction did not match the source, so it was rejected."}</span>
              </li>
            ))}
            <li>City-level office rents: the only figures found were a vendor range covering three cities at once.</li>
            <li>Tier-2 cities: the public data is too thin to rank them against the six metros.</li>
            <li>Rajasthan, Andhra Pradesh and Delhi policy details: not found in any source we could fetch.</li>
          </ul>
        </Card>
      </section>

      <p className="mt-10 text-xs leading-relaxed text-ink-3">
        This brief is general information, not legal, tax or investment advice. Policy terms change; confirm eligibility against the
        official notification before acting. <Link href="/method" className="underline underline-offset-2">How this brief is built</Link>
      </p>
    </Container>
  );
}
