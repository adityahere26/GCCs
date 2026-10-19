import { clientIp, errorResponse, jsonError, rateLimited, sameOrigin } from "@/lib/api";
import { groqJson } from "@/lib/groq";
import { guard, type DraftSentence } from "@/lib/guard";
import { RULES } from "@/lib/prompts";
import { renderFacts, retrieve } from "@/lib/retrieve";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError(403, "Cross-site requests are not allowed.", "forbidden");
  if (rateLimited(clientIp(req))) return jsonError(429, "Too many questions in a minute. Please wait a moment.", "rate_limited");

  const body = (await req.json().catch(() => null)) as { question?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.replace(/\s+/g, " ").trim() : "";
  if (question.length < 3) return jsonError(400, "Please type a question.", "invalid");
  if (question.length > 300) return jsonError(400, "Please keep questions under 300 characters.", "invalid");

  const facts = retrieve(question);
  if (facts.length === 0) {
    return Response.json({
      sentences: [{ text: "None of our verified facts cover that question, so we would rather not guess. Try asking about cities, pay, state incentives, setup models or GCC counts.", cites: [] }],
      dropped: [],
      factsConsidered: 0,
    });
  }

  try {
    const out = await groqJson<{ sentences?: DraftSentence[] }>([
      { role: "system", content: RULES },
      { role: "user", content: `FACTS:\n${renderFacts(facts)}\n\nUSER INPUT (question):\n${question}` },
    ]);
    const allowed = new Map(facts.map((f) => [f.id, f]));
    const result = guard(Array.isArray(out.sentences) ? out.sentences : [], allowed, [question]);
    if (result.sentences.length === 0) {
      return Response.json({
        sentences: [{ text: "The AI's draft did not pass our number checks, so nothing is shown. Try rephrasing the question.", cites: [] }],
        dropped: result.dropped,
        factsConsidered: facts.length,
      });
    }
    return Response.json({ ...result, factsConsidered: facts.length });
  } catch (e) {
    return errorResponse(e);
  }
}
