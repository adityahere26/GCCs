import type { Metadata } from "next";
import { EvidenceTable } from "@/components/EvidenceTable";
import { Container, PageHead } from "@/components/ui";
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
    <Container>
      <PageHead
        eyebrow="Evidence ledger"
        title="Every number, and where it came from"
        sub="Each row is one extracted fact. It is only used in a brief if its quote appears word for word in the fetched source and the quote states the value. Rejected rows and deliberately fabricated test probes are kept here so you can see the checks working."
      />
      <dl className="grid grid-cols-2 gap-2.5 md:gap-[15px] lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k} className="rounded-[24px] border border-line bg-surface p-5">
            <dt className="eyebrow text-[11px] text-ink-3">{s.k}</dt>
            <dd className="tabular mt-3 text-[40px] font-[340] leading-none tracking-[-0.04em]">{s.v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6">
        <EvidenceTable rows={allRows} />
      </div>
    </Container>
  );
}
