"use client";

import { useRef, useState } from "react";
import { AiAnswer, postAi, type AiResult } from "./AiAnswer";

const SUGGESTIONS = [
  "Which metro has the lowest engineer pay?",
  "Do state incentives apply to a 60-person team in Pune?",
  "Why do reports disagree on how many GCCs India has?",
  "How fast can a GCC start hiring under each setup model?",
];

type Turn = { q: string; state: "loading" } | { q: string; state: "done"; result: AiResult } | { q: string; state: "error"; error: string };

export function AskBox() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [q, setQ] = useState("");
  const busy = turns.some((t) => t.state === "loading");
  const inputRef = useRef<HTMLInputElement>(null);

  async function ask(question: string) {
    const text = question.trim();
    if (text.length < 3 || busy) return;
    setQ("");
    setTurns((t) => [...t, { q: text, state: "loading" }]);
    const res = await postAi("/api/ask", { question: text });
    setTurns((t) => t.map((turn, i) => (i === t.length - 1 ? (res.ok ? { q: text, state: "done", result: res.data } : { q: text, state: "error", error: res.error }) : turn)));
    inputRef.current?.focus();
  }

  return (
    <div className="flex min-h-[520px] flex-col">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <span aria-hidden className="grid size-10 place-items-center rounded-full bg-block-lilac text-lg text-ink">
          ✧
        </span>
        <div>
          <h2 className="text-[17px] font-semibold">Ground Truth analyst</h2>
          <p className="text-[13px] text-ink-3">
            <span className="text-ok">●</span> Answers only from verified facts · powered by Groq
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 py-5" aria-live="polite">
        <div className="max-w-[88%] self-start rounded-[20px] bg-sunken px-5 py-4 text-[16px] leading-relaxed">
          Ask about cities, pay, state incentives, setup models or GCC counts. I can only use facts from the evidence ledger, and every number I write is
          checked against its source before you see it.
        </div>
        {turns.map((t, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="max-w-[85%] self-end rounded-[20px] bg-ink px-5 py-3 text-[16px] text-accent-ink">{t.q}</div>
            <div className="max-w-[92%] self-start rounded-[20px] border border-line bg-surface px-5 py-4">
              {t.state === "loading" && <p className="animate-pulse text-[16px] text-ink-3">Reading the evidence…</p>}
              {t.state === "error" && (
                <p role="alert" className="text-[16px] text-bad">
                  {t.error}
                </p>
              )}
              {t.state === "done" && <AiAnswer result={t.result} />}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
        className="flex gap-2 border-t border-line pt-4"
      >
        <label htmlFor="ask" className="sr-only">
          Your question
        </label>
        <input
          id="ask"
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={300}
          placeholder="Ask about GCC cities, pay, incentives or setup models…"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-3 text-[16px] focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
        />
        <button type="submit" disabled={busy || q.trim().length < 3} className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-lg text-accent-ink disabled:opacity-40">
          <span aria-hidden>↑</span>
          <span className="sr-only">Send</span>
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" disabled={busy} onClick={() => ask(s)} className="rounded-full border border-line bg-surface px-4 py-2 text-left text-[13px] text-ink-2 hover:bg-sunken disabled:opacity-50">
            {s}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-ink-3">Your question is sent to Groq to generate the answer. Do not include personal or confidential information.</p>
    </div>
  );
}
