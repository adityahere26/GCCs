import "server-only";

/** Minimal Groq client (OpenAI-compatible chat completions). The key never leaves the server. */

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
// Both are on Groq's free tier. The smaller model has more free-tier headroom, so it is the fallback.
export const DEFAULT_MODEL = "openai/gpt-oss-120b";
export const FALLBACK_MODEL = "openai/gpt-oss-20b";

export type GroqErrorCode = "not_configured" | "rate_limited" | "auth" | "timeout" | "upstream" | "bad_output" | "model_unavailable";

export class GroqError extends Error {
  constructor(
    public code: GroqErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export function groqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

interface Message {
  role: "system" | "user";
  content: string;
}

/** Calls Groq in JSON mode and returns the parsed object. Falls back to a smaller free model on rate limits. */
export async function groqJson<T>(messages: Message[], { maxTokens = 1200, timeoutMs = 25000 } = {}): Promise<T> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new GroqError("not_configured", "GROQ_API_KEY is not set");

  const primary = process.env.GROQ_MODEL || DEFAULT_MODEL;
  const fallback = process.env.GROQ_FALLBACK_MODEL || FALLBACK_MODEL;
  const models = primary === fallback ? [primary] : [primary, fallback];

  let lastError: GroqError | undefined;
  for (const model of models) {
    try {
      return await callModel<T>(key, model, messages, maxTokens, timeoutMs);
    } catch (e) {
      lastError = e as GroqError;
      // Only a capacity problem with this model is worth retrying on the other one.
      if (!(e instanceof GroqError) || !["rate_limited", "model_unavailable"].includes(e.code)) throw e;
    }
  }
  throw lastError?.code === "model_unavailable" ? new GroqError("upstream", "No Groq model available") : lastError!;
}

async function callModel<T>(key: string, model: string, messages: Message[], maxTokens: number, timeoutMs: number): Promise<T> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_completion_tokens: maxTokens,
        response_format: { type: "json_object" },
        // gpt-oss models reason before answering; low effort keeps answers fast and inside free-tier token limits.
        ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (e) {
    const name = (e as Error).name;
    throw new GroqError(name === "TimeoutError" || name === "AbortError" ? "timeout" : "upstream", "Could not reach Groq");
  }

  if (res.status === 429) throw new GroqError("rate_limited", "Groq rate limit reached");
  if (res.status === 401 || res.status === 403) throw new GroqError("auth", "Groq rejected the API key");
  if (res.status === 404) throw new GroqError("model_unavailable", `Model ${model} is not available`);
  if (!res.ok) throw new GroqError("upstream", `Groq returned ${res.status}`);

  const body = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
  const content = body?.choices?.[0]?.message?.content;
  if (!content) throw new GroqError("bad_output", "Empty response from Groq");
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new GroqError("bad_output", "Groq returned invalid JSON");
  }
}
