import type { Claim } from "./ledger";

/**
 * Number guard for AI-written text. The model must cite ledger rows for every sentence,
 * and every number it writes must appear in those rows (or in values the app computed itself).
 * Sentences that fail are dropped, never shown.
 */

export interface DraftSentence {
  text: string;
  cites: string[];
}

export interface CheckedSentence {
  text: string;
  cites: Claim[];
}

export interface GuardResult {
  sentences: CheckedSentence[];
  dropped: { text: string; reason: string }[];
}

const NUM = /(\d[\d,]*(?:\.\d+)?)(?:\s*(k|thousand|m|mn|million|bn|billion)(?![a-z]))?/gi;
const SCALE: Record<string, number> = { k: 1e3, thousand: 1e3, m: 1e6, mn: 1e6, million: 1e6, bn: 1e9, billion: 1e9 };

const fmt = (n: number) => String(Number(n.toPrecision(12)));

/** Numbers in a string, without thousands separators ("2,117" -> "2117"). */
export function numbers(s: string): string[] {
  return [...s.matchAll(NUM)].map((m) => fmt(Number(m[1].replace(/,/g, ""))));
}

/** Every reasonable reading of each number: as written, and scaled by a K/M/B suffix ("$200K" -> 200 and 200000). */
function readings(s: string): string[][] {
  return [...s.matchAll(NUM)].map((m) => {
    const raw = Number(m[1].replace(/,/g, ""));
    const unit = m[2]?.toLowerCase();
    return unit ? [fmt(raw), fmt(raw * SCALE[unit])] : [fmt(raw)];
  });
}

/** Normalises a model-supplied citation id ("[talent-pune-swe]" -> "talent-pune-swe"). */
const cleanId = (x: unknown) => (typeof x === "string" ? x.replace(/[^a-z0-9-]/gi, "").toLowerCase() : "");

export function guard(draft: DraftSentence[], allowed: Map<string, Claim>, extraText: string[] = []): GuardResult {
  const sentences: CheckedSentence[] = [];
  const dropped: GuardResult["dropped"] = [];
  const extra = new Set(extraText.flatMap(readings).flat());

  for (const d of draft.slice(0, 12)) {
    const text = typeof d?.text === "string" ? d.text.trim().slice(0, 600) : "";
    if (!text) continue;
    // Unknown ids are discarded rather than trusted; the sentence must then stand on the citations that remain.
    const ids = Array.isArray(d.cites) ? [...new Set(d.cites.map(cleanId).filter(Boolean))] : [];
    const cites = ids.map((id) => allowed.get(id)).filter((c): c is Claim => Boolean(c));

    const pool = new Set([...extra, ...cites.flatMap((c) => readings(`${c.value}${c.unit ?? ""} ${c.quote} ${c.asOf}`).flat())]);
    const unsupported = readings(text).filter((variants) => !variants.some((v) => pool.has(v)));
    if (unsupported.length > 0) {
      dropped.push({ text, reason: `number not in its sources: ${unsupported.map((v) => v[0]).join(", ")}` });
      continue;
    }
    sentences.push({ text, cites });
  }
  return { sentences, dropped };
}
