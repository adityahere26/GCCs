import { clientIp, errorResponse, jsonError, rateLimited, sameOrigin } from "@/lib/api";
import { buildBrief, OWNERSHIP, parseInput, PRIORITIES, TIMELINES } from "@/lib/engine";
import { groqJson } from "@/lib/groq";
import { guard, type DraftSentence } from "@/lib/guard";
import { fact, type Claim } from "@/lib/ledger";
import { RULES } from "@/lib/prompts";
import { renderFacts } from "@/lib/retrieve";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError(403, "Cross-site requests are not allowed.", "forbidden");
  if (rateLimited(clientIp(req))) return jsonError(429, "Too many requests in a minute. Please wait a moment.", "rate_limited");

  const body = (await req.json().catch(() => null)) as { query?: unknown } | null;
  const query = typeof body?.query === "string" ? body.query.slice(0, 600) : "";
  const { input, errors } = parseInput(Object.fromEntries(new URLSearchParams(query)));
  if (!input) return jsonError(400, errors.join(" "), "invalid");

  const b = buildBrief(input);
  const facts = new Map<string, Claim>();
  const add = (cs: Claim[]) => cs.forEach((c) => facts.set(c.id, c));
  const computed: string[] = [String(input.headcount), String(input.seniorShare)];

  const cityLines = b.cities.slice(0, 3).map((c, i) => {
    add([c.pool, c.swe, c.senior]);
    computed.push(String(c.score), String(c.blendedMedianLakh), String(c.annualPayrollCrore), String(c.sectorPeers));
    const pol = c.policies.map((p) => {
      p.reasons.forEach((r) => add(r.cite));
      computed.push(p.headline, ...p.reasons.map((r) => r.text));
      return `${p.state}: ${p.status} (${p.headline}) [${p.reasons.flatMap((r) => r.cite.map((x) => x.id)).join(", ")}]`;
    });
    return `Rank ${i + 1}: ${c.name}, score ${c.score}/100; blended pay median ₹${c.blendedMedianLakh}L computed from [${c.swe.id}] and [${c.senior.id}]; base payroll ₹${c.annualPayrollCrore} crore a year for ${input.headcount} people (computed); ${c.sectorPeers} ${input.sector} peer centres (Flexiple directory, computed); talent pool [${c.pool.id}]. Policies: ${pol.join("; ")}`;
  });

  const modelLines = b.models.map((m) => {
    const cites = [...m.timeToStart.cite, ...(m.monthlyFee?.cite ?? []), ...(m.oneTime?.cite ?? [])];
    add(cites);
    computed.push(m.timeToStart.text, m.monthlyFee?.text ?? "", m.oneTime?.text ?? "", ...m.reasons);
    return `${m.name}: ${m.fit}${m.isFlexiple ? " (sold by Flexiple, whose public data this tool uses)" : ""}. Reasons: ${m.reasons.join(" ")} [${cites.map((c) => c.id).join(", ")}]`;
  });

  add([fact("cost-captive-breakeven")]);
  const factLines = renderFacts([...facts.values()]).split("\n");

  const prompt = `USER INPUT: ${input.headcount} people, sector ${input.sector}, ${input.seniorShare}% senior, priority "${PRIORITIES[input.priority].label}", first hires ${TIMELINES[input.timeline]}, entity: ${OWNERSHIP[input.ownership]}.

BRIEF RESULTS (computed by the app's rules; you may restate these numbers):
${cityLines.join("\n")}

SETUP MODELS:
${modelLines.join("\n")}

FACTS:
${factLines.join("\n")}

Task: write a 4 to 6 sentence executive summary of this brief for a busy CTO, using BRIEF RESULTS and FACTS. Explain why the top city leads, the main trade-off against the runner-up, which setup model fits and why, and any eligibility caveat. If Flexiple's managed model is a poor fit, say so plainly.`;

  try {
    const out = await groqJson<{ sentences?: DraftSentence[] }>([
      { role: "system", content: RULES },
      { role: "user", content: prompt },
    ]);
    const result = guard(Array.isArray(out.sentences) ? out.sentences : [], facts, computed);
    if (result.sentences.length === 0) {
      return Response.json({ sentences: [{ text: "The AI summary did not pass our number checks, so it was discarded. The brief below is unaffected.", cites: [] }], dropped: result.dropped });
    }
    return Response.json(result);
  } catch (e) {
    return errorResponse(e);
  }
}
