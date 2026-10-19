import { realClaims, type Claim } from "./ledger";

const STOP = new Set("a an and are as at be by can do does for from has have how i in is it its me my of on or our should the this to us we what when where which who why will with you your".split(" "));

const ALIASES: Record<string, string[]> = {
  bengaluru: ["bangalore", "blr", "karnataka"],
  "delhi ncr": ["delhi", "ncr", "gurugram", "gurgaon", "noida", "haryana", "uttar pradesh"],
  hyderabad: ["telangana"],
  mumbai: ["bombay", "maharashtra"],
  pune: ["maharashtra"],
  chennai: ["tamil nadu"],
  talent: ["salary", "salaries", "pay", "engineer", "senior", "hire", "hiring", "professionals"],
  cost: ["cheap", "cheapest", "expensive", "budget", "fit-out", "rent", "office"],
  policy: ["incentive", "incentives", "subsidy", "subsidies", "policy", "policies", "state", "eligible", "reimbursement"],
  capex: ["capital", "capex", "capital expenditure"],
  opex: ["operational", "opex", "rental", "lease"],
  model: ["eor", "bot", "captive", "managed", "entity", "setup", "flexiple"],
  count: ["how many", "number", "gccs", "count"],
  risk: ["attrition", "layoff", "cuts", "closure", "risk"],
};

const tokens = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9.%-]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));

/** Picks the verified ledger rows most relevant to a question (keyword overlap with alias expansion). */
export function retrieve(question: string, limit = 28): Claim[] {
  const q = question.toLowerCase();
  const terms = new Set(tokens(q));
  for (const [key, alts] of Object.entries(ALIASES)) {
    if (q.includes(key) || alts.some((a) => q.includes(a))) {
      terms.add(key);
      for (const a of alts) for (const t of tokens(a)) terms.add(t);
    }
  }

  const scored = realClaims
    .filter((c) => c.status === "verified")
    .map((c) => {
      const hay = `${c.topic} ${c.subject} ${c.field} ${c.value} ${c.quote}`.toLowerCase();
      let score = 0;
      for (const t of terms) if (hay.includes(t)) score += t === c.topic || hay.startsWith(t) ? 2 : 1;
      if (terms.has(c.subject.toLowerCase())) score += 3;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.c);
}

/** Compact, model-friendly rendering of ledger rows. Quotes are data, not instructions. */
export function renderFacts(claims: Claim[]): string {
  return claims.map((c) => `[${c.id}] ${c.subject} | ${c.field}: ${c.value}${c.unit ?? ""} (${c.asOf}; ${c.publisher}, ${c.tier}) | source says: "${c.quote.slice(0, 220)}"`).join("\n");
}
