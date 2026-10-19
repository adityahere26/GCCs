import ledgerJson from "@/data/ledger.json";

export type Status = "verified" | "rejected" | "unverifiable";
export type Tier = "research" | "media" | "legal" | "vendor" | "aggregator";

export interface Claim {
  id: string;
  topic: string;
  subject: string;
  field: string;
  value: string;
  num?: number;
  unit?: string;
  asOf: string;
  source: string;
  quote: string;
  probe: boolean;
  status: Status;
  reason: string;
  sourceUrl: string;
  publisher: string;
  tier: Tier;
  fetch: string;
}

export interface Evaluation {
  generatedAt: string;
  sources: number;
  sourcesFetched: number;
  claims: number;
  verified: number;
  rejected: number;
  unverifiable: number;
  probes: number;
  probesCaught: number;
}

const ledger = ledgerJson as { evaluation: Evaluation; rows: Claim[] };

export const evaluation = ledger.evaluation;
export const allRows: Claim[] = ledger.rows;
export const realClaims: Claim[] = ledger.rows.filter((r) => !r.probe);
export const probeClaims: Claim[] = ledger.rows.filter((r) => r.probe);

const byId = new Map(allRows.map((r) => [r.id, r]));

/** Returns a claim only if it passed verification; product surfaces never show anything else as fact. */
export function fact(id: string): Claim {
  const c = byId.get(id);
  if (!c) throw new Error(`Unknown claim id: ${id}`);
  if (c.status !== "verified") throw new Error(`Claim ${id} is ${c.status}; it cannot be used as a fact`);
  return c;
}

/** Looks up any claim, including rejected and unverifiable ones, for the evidence views. */
export function claim(id: string): Claim | undefined {
  return byId.get(id);
}

/** Display form of a claim's value, with its unit (e.g. "16%"). */
export function show(c: Claim): string {
  return `${c.value}${c.unit ?? ""}`;
}

export const TIER_LABEL: Record<Tier, string> = {
  research: "Research firm",
  media: "News media",
  legal: "Law firm",
  vendor: "Vendor (sells a service)",
  aggregator: "Aggregator",
};

export const REASON_LABEL: Record<string, string> = {
  quote_and_value_match: "Quote found in source; value matches quote",
  quote_not_in_source: "Quote not found in the fetched source",
  value_not_in_quote: "Value is not stated in the quote",
  quote_too_short: "Quote too short to verify",
  source_unavailable: "Source could not be fetched",
};
