import type { Metadata } from "next";
import { AskBox } from "@/components/AskBox";
import { Block, Card, CardHead, PageHead } from "@/components/ui";
import { evaluation } from "@/lib/ledger";

export const metadata: Metadata = {
  title: "Ask the evidence",
  description: "Ask questions about India GCC cities, pay, incentives and setup models. Answers use only verified, cited facts.",
};

const STEPS = [
  { t: "Retrieve", d: "Your question is matched to the most relevant verified rows in the evidence ledger." },
  { t: "Draft (Groq)", d: "An open model on Groq writes an answer from those rows only, citing a row for every sentence." },
  { t: "Guard (code)", d: "Every number in the draft must appear in the rows it cites. Sentences that fail are removed and shown to you." },
  { t: "Show sources", d: "Each sentence carries source chips with the exact quote, publisher and date." },
];

export default function AskPage() {
  return (
    <>
      <PageHead
        eyebrow="AI research assistant"
        title="Ask the evidence"
        sub={`A real language model, kept on a short leash: it can only use the ${evaluation.verified} verified facts in the ledger, and code checks its numbers before you see them.`}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <Card className="p-6 md:p-8">
          <AskBox />
        </Card>
        <Block tone="cream" className="h-fit p-6 md:p-8">
          <CardHead title="How answers are made" sub="Built for decisions, not open-ended chat" />
          <ol className="divide-y divide-black/10">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span className="tabular grid size-8 shrink-0 place-items-center rounded-full bg-block-lime text-sm font-medium">{i + 1}</span>
                <div>
                  <p className="text-[15px] font-semibold">{s.t}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-3">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Block>
      </div>
    </>
  );
}
