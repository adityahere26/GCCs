import type { Metadata } from "next";
import { EvidenceTable } from "@/components/EvidenceTable";
import { Container, Eyebrow } from "@/components/ui";
import { allRows, evaluation } from "@/lib/ledger";

export const metadata: Metadata = {
  title: "Evidence ledger",
  description: "Every fact the brief uses, with the exact quote, the source and whether it passed verification.",
};

export default function EvidencePage() {
  const stats = [
    { k: "Verified", v: evaluation.verified },
    { k: "Rejected", v: evaluation.rejected },
    { k: "Source unavailable", v: evaluation.unverifiable },
    { k: "Test probes caught", v: `${evaluation.probesCaught}/${evaluation.probes}` },
  ];
  return (
    <Container className="py-12">
      <Eyebrow>Evidence ledger</Eyebrow>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Every number, and where it came from</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">
        Each row is one extracted fact. It is only used in a brief if its quote appears word for word in the fetched source and the
        quote states the value. Rejected rows and deliberately fabricated test probes are kept here so you can see the checks working.
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k} className="rounded-xl border border-line bg-surface p-4">
            <dt className="text-xs text-ink-3">{s.k}</dt>
            <dd className="tabular mt-1 text-2xl font-semibold">{s.v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10">
        <EvidenceTable rows={allRows} />
      </div>
    </Container>
  );
}
