"use client";

import { useState } from "react";
import { AiAnswer, postAi, type AiResult } from "./AiAnswer";

type State = { s: "idle" } | { s: "loading" } | { s: "done"; result: AiResult } | { s: "error"; error: string };

export function ExplainBrief({ query }: { query: string }) {
  const [state, setState] = useState<State>({ s: "idle" });

  async function run() {
    setState({ s: "loading" });
    const res = await postAi("/api/explain", { query });
    setState(res.ok ? { s: "done", result: res.data } : { s: "error", error: res.error });
  }

  return (
    <div className="mt-6 rounded-[24px] bg-block-lilac p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-[12px] text-ink/70">AI summary · Groq</p>
          <p className="mt-1 text-[15px] text-ink-2">Written from this brief&apos;s verified facts only. Numbers are checked before display.</p>
        </div>
        {state.s !== "done" && (
          <button type="button" onClick={run} disabled={state.s === "loading"} className="rounded-full bg-ink px-5 py-2.5 text-[15px] font-medium text-accent-ink hover:opacity-85 disabled:opacity-60">
            {state.s === "loading" ? "Writing…" : state.s === "error" ? "Try again" : "Explain this brief"}
          </button>
        )}
      </div>
      <div aria-live="polite">
        {state.s === "loading" && <p className="mt-5 animate-pulse text-[16px] text-ink-2">Reading the brief and its sources…</p>}
        {state.s === "error" && (
          <p role="alert" className="mt-5 text-[16px] text-bad">
            {state.error}
          </p>
        )}
        {state.s === "done" && (
          <div className="mt-4">
            <AiAnswer result={state.result} />
          </div>
        )}
      </div>
    </div>
  );
}
