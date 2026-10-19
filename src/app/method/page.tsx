import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, PageHead, SectionTitle } from "@/components/ui";
import { PRIORITIES } from "@/lib/engine";
import { evaluation } from "@/lib/ledger";

export const metadata: Metadata = {
  title: "Method",
  description: "How Ground Truth extracts, verifies and uses facts, how cities are scored, and the rules that keep it neutral.",
};

const STEPS = [
  { n: "1", t: "Fetch", d: `Download each source page and store its plain text. ${evaluation.sourcesFetched} of ${evaluation.sources} sources could be fetched; the rest are marked unavailable rather than guessed.` },
  { n: "2", t: "Extract (AI)", d: "A language model reads each page and proposes facts as {field, value, exact quote}. In this prototype, extraction was run with Claude during development." },
  { n: "3", t: "Verify (code)", d: "A deterministic check confirms the quote appears word for word in the fetched text, and that every number in the value also appears in the quote. Anything else is rejected." },
  { n: "4", t: "Probe", d: `Fabricated facts (digit swaps, invented forecasts, wrong sources, paraphrases) are mixed in on every run. The verifier must reject all of them: ${evaluation.probesCaught} of ${evaluation.probes} caught.` },
  { n: "5", t: "Build the brief (rules)", d: "The brief is assembled by published rules from verified rows only. No model writes numbers at request time, so nothing can be invented when you use it." },
];

export default function MethodPage() {
  return (
    <Container>
      <PageHead
        eyebrow="Method"
        title="AI reads the sources. Code decides what to trust."
        sub="Language models are good at reading messy reports and bad at being trusted with numbers. So the model only proposes facts, with the sentence it took them from, and a simple check either confirms the sentence exists or throws the fact out."
      />

      <ol className="grid gap-4 md:grid-cols-5">
        {STEPS.map((s) => (
          <li key={s.n}>
            <Card className="h-full p-4">
              <span className="tabular grid size-8 place-items-center rounded-[9px] bg-accent-soft text-sm font-bold text-accent-text">{s.n}</span>
              <h2 className="mt-3 font-medium">{s.t}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{s.d}</p>
            </Card>
          </li>
        ))}
      </ol>

      <section className="mt-14 grid gap-10 md:grid-cols-2">
        <div>
          <SectionTitle>What the evaluation shows, and what it does not</SectionTitle>
          <ul className="space-y-3 text-sm leading-relaxed text-ink-2">
            <li>
              <strong>{evaluation.verified}</strong> of {evaluation.claims} extracted facts verified. <strong>{evaluation.unverifiable}</strong> come from
              sources that blocked or failed the download and are excluded.
            </li>
            <li>
              <strong>{evaluation.rejected}</strong> real extraction was rejected: the model counted eight states in a list and wrote “8”, but the
              sentence never says “8”. The rule is strict on purpose: a value has to be stated, not inferred.
            </li>
            <li>
              It proves a quote exists and contains the number. It does <em>not</em> prove the source is right. That is why every chip shows who the
              publisher is, and vendor sources are flagged ◆.
            </li>
            <li>It does not catch a correct quote attached to the wrong field. Field labels were reviewed by hand for this prototype.</li>
          </ul>
        </div>
        <div>
          <SectionTitle>How cities are scored</SectionTitle>
          <ul className="space-y-3 text-sm leading-relaxed text-ink-2">
            <li><strong>Talent depth</strong>: log of tracked professionals, scaled across the six metros.</li>
            <li><strong>Cost</strong>: blended pay median, weighting junior and senior medians by your senior share. Lower is better.</li>
            <li><strong>Peers</strong>: centres in your sector already in the city, from Flexiple&apos;s public directory.</li>
            <li><strong>Incentives</strong>: whether a state policy is likely to apply at your size and model (1.0 likely, 0.6 check, 0.2 unlikely).</li>
            <li>
              Weights by priority:{" "}
              {Object.values(PRIORITIES)
                .map((p) => `${p.label} (talent ${p.weights.talent}, cost ${p.weights.cost}, peers ${p.weights.peers}, incentives ${p.weights.incentives})`)
                .join("; ")}
              .
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-14">
        <SectionTitle>Neutrality rules</SectionTitle>
        <ul className="grid gap-3 text-sm text-ink-2 md:grid-cols-2">
          {[
            "The concept is pitched to Flexiple, which sells managed teams and GCC setup. Every brief says so.",
            "Flexiple's model is scored by the same rules as the others and is marked a poor fit above 50 people when you want your own entity.",
            "No ranking, placement or data edit can be bought. Vendor-sourced numbers are labelled as estimates.",
            "Where sources disagree, all values are shown. Nothing is averaged away.",
          ].map((t) => (
            <li key={t} className="rounded-[14px] border border-line bg-surface p-4 shadow-card">
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <SectionTitle>Data sources</SectionTitle>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-2">
          Talent and pay medians come from Flexiple&apos;s published statistics page, standing in for the private talent graph a production version
          would use. Peer counts come from Flexiple&apos;s public directory. Policy terms come from law-firm and consultancy summaries, not gazette
          text. Cost and timeline figures mostly come from vendors. Full list on the <Link href="/evidence" className="text-accent-text underline underline-offset-2">evidence ledger</Link>.
        </p>
      </section>
    </Container>
  );
}
