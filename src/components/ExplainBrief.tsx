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
    <div className="mt-6 rounded-[14px] border border-line bg-gradient-to-br from-[#e0f4fb] to-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-accent-text">✧ AI summary · Groq</p>
          <p className="mt-1 text-xs text-ink-3">Written from this brief&apos;s verified facts only. Numbers are checked before display.</p>
        </div>
        {state.s !== "done" && (
          <button type="button" onClick={run} disabled={state.s === "loading"} className="rounded-[9px] bg-accent px-4 py-2.5 text-xs font-semibold text-accent-ink hover:opacity-90 disabled:opacity-60">
            {state.s === "loading" ? "Writing…" : state.s === "error" ? "Try again" : "Explain this brief"}
          </button>
        )}
      </div>
      <div aria-live="polite">
        {state.s === "loading" && <p className="mt-4 animate-pulse text-[13px] text-ink-3">Reading the brief and its sources…</p>}
        {state.s === "error" && (
          <p role="alert" className="mt-4 text-[13px] text-bad">
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
