import type { Metadata } from "next";
import { Cite } from "@/components/Cite";
import { Card, Container, Eyebrow } from "@/components/ui";
import { fact, show } from "@/lib/ledger";

export const metadata: Metadata = {
  title: "Why GCC counts disagree",
  description: "India has 536, 1,700, 1,800, 1,900, 2,000, 2,117 or 3,728 GCCs depending on who you ask. Here is what each number counts.",
};

const ROWS = [
  { id: "count-ansr-forbes", what: "Centres run by Forbes Global 2000 firms only", why: "Subset: excludes every mid-market company" },
  { id: "count-flexiple", what: "Centres Flexiple has verified one by one", why: "Public, checkable list; smaller by design" },
  { id: "count-govt", what: "GCCs, per a Parliament reply", why: "Appears to reuse the industry body's FY24 figure" },
  { id: "count-deloitte", what: "Centres, per a Deloitte partner", why: "Different tracker, late 2025" },
  { id: "count-ey", what: "GCCs, in coverage of EY's survey", why: "Media figure, method not published" },
  { id: "count-cea", what: "Centres, per the Chief Economic Adviser", why: "Rounded figure in a speech" },
  { id: "count-zinnov-parents", what: "Parent companies with a GCC (Zinnov–nasscom)", why: "Counts each company once" },
  { id: "count-zinnov-units", what: "GCC units (Zinnov–nasscom)", why: "Counts each centre; same report, 76% higher" },
] as const;

export default function CountsPage() {
  const rows = ROWS.map((r) => ({ ...r, c: fact(r.id) }));
  const values = rows.map((r) => Number(r.c.value.replace(/,/g, "")));
  const max = Math.max(...values);

  return (
    <Container className="py-12">
      <Eyebrow>Count reconciler</Eyebrow>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight">“How many GCCs does India have?” has eight answers</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">
        None of these is a typo. They count different things: parent companies or individual centres, every company or only the
        largest, a verified list or an industry estimate. Quoting one without its definition is how the confusion spreads.
      </p>

      <Card className="mt-10 p-5 sm:p-8">
        <h2 className="text-sm font-medium text-ink-2">Number of GCCs in India, by source and definition</h2>
        <ol className="mt-6 space-y-5">
          {rows.map((r, i) => {
            const pct = (values[i] / max) * 100;
            return (
              <li key={r.id} className="grid gap-1.5 sm:grid-cols-[15rem_1fr] sm:gap-6">
                <div className="text-sm">
                  <p className="font-medium text-ink">{r.what}</p>
                  <p className="text-xs text-ink-3">{r.why}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 flex-1" title={`${r.c.publisher}: ${show(r.c)} (${r.c.asOf})`}>
                    <div className="h-full rounded-r-[4px] bg-chart" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="tabular w-28 shrink-0 text-sm font-semibold">
                    {show(r.c)}
                    <Cite claims={[r.c]} label={r.c.asOf} />
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 text-xs text-ink-3">Bars share one zero-based scale. Hover a bar or open a source chip for the exact quote.</p>
      </Card>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { t: "Parents vs centres", d: "One company with three Indian centres is 1 GCC or 3 units. The same Zinnov–nasscom report gives both, 2,117 and 3,728." },
          { t: "Who is in scope", d: "Lists limited to Forbes 2000 or Fortune 500 parents leave out the mid-market firms that make up most new entrants." },
          { t: "What it means for a brief", d: "We never show a single 'market size'. Each number appears with its definition, source and date, next to the others." },
        ].map((x) => (
          <div key={x.t}>
            <h3 className="font-medium">{x.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-3">{x.d}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
