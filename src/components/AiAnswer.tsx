"use client";

import { Cite } from "./Cite";
import type { Claim } from "@/lib/ledger";

export interface AiResult {
  sentences: { text: string; cites: Claim[] }[];
  dropped: { text: string; reason: string }[];
}

/** Renders a guarded AI answer: each sentence with its source chips, plus what the number guard removed. */
export function AiAnswer({ result }: { result: AiResult }) {
  return (
    <div>
      <p className="text-[13px] leading-relaxed text-ink">
        {result.sentences.map((s, i) => (
          <span key={i}>
            {/[.!?]$/.test(s.text) ? s.text : `${s.text}.`}
            {s.cites.length > 0 && <Cite claims={s.cites} label={s.cites.length === 1 ? s.cites[0].publisher : `${s.cites.length} sources`} />}{" "}
          </span>
        ))}
      </p>
      {result.dropped.length > 0 && (
        <details className="mt-3 rounded-[9px] border border-line bg-sunken px-3 py-2 text-[11px] text-ink-3">
          <summary className="cursor-pointer font-semibold text-ink-2">
            Number guard removed {result.dropped.length} {result.dropped.length === 1 ? "sentence" : "sentences"}
          </summary>
          <ul className="mt-2 space-y-1.5">
            {result.dropped.map((d, i) => (
              <li key={i}>
                <span className="line-through decoration-bad/60">{d.text}</span> <span className="text-bad">({d.reason})</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export async function postAi(url: string, body: unknown): Promise<{ ok: true; data: AiResult } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: data?.error ?? "Something went wrong. Please try again." };
    return { ok: true, data: data as AiResult };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
}
