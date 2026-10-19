import "server-only";
import { GroqError, type GroqErrorCode } from "./groq";

/** Per-instance sliding-window limiter. Serverless instances do not share memory, so this is a soft cap. */
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, max = 6, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

/** Rejects cross-site calls so other sites cannot spend this deployment's Groq quota from a browser. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

const MESSAGES: Record<GroqErrorCode, { status: number; message: string }> = {
  not_configured: { status: 503, message: "The AI assistant is not switched on for this deployment. Everything else works without it." },
  rate_limited: { status: 429, message: "The free AI quota is busy right now. Please try again in a minute." },
  auth: { status: 503, message: "The AI assistant is misconfigured. Everything else still works." },
  timeout: { status: 504, message: "The AI took too long to answer. Please try again." },
  model_unavailable: { status: 502, message: "The AI model is unavailable right now. Please try again shortly." },
  upstream: { status: 502, message: "The AI service is unavailable right now. Please try again shortly." },
  bad_output: { status: 502, message: "The AI returned an answer we could not check, so it was discarded. Please try again." },
};

export function errorResponse(e: unknown): Response {
  if (e instanceof GroqError) {
    const m = MESSAGES[e.code];
    return Response.json({ error: m.message, code: e.code }, { status: m.status });
  }
  console.error("ai route failed", e);
  return Response.json({ error: "Something went wrong. Please try again.", code: "internal" }, { status: 500 });
}

export function jsonError(status: number, error: string, code: string): Response {
  return Response.json({ error, code }, { status });
}
