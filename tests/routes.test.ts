import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as ask } from "@/app/api/ask/route";
import { POST as explain } from "@/app/api/explain/route";
import { SECTORS, toQuery } from "@/lib/engine";

const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/ask", { method: "POST", headers: { "content-type": "application/json", host: "localhost", ...headers }, body: JSON.stringify(body) });

const groqReply = (content: unknown, status = 200) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }), { status }));

let n = 0;
beforeEach(() => {
  process.env.GROQ_API_KEY = "test-key";
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GROQ_API_KEY;
});
// Each test uses its own client IP so the per-IP rate limiter does not interfere.
const ip = () => ({ "x-forwarded-for": `10.0.0.${++n}` });

describe("/api/ask", () => {
  it("returns guarded sentences with full source objects", async () => {
    const fetchMock = groqReply({
      sentences: [
        { text: "Chennai has the lowest engineer median at ₹7.6L.", cites: ["talent-chn-swe"] },
        { text: "It is also 99% cheaper.", cites: ["talent-chn-swe"] },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await ask(req({ question: "Which metro has the lowest engineer pay?" }, ip()));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sentences).toHaveLength(1);
    expect(data.sentences[0].cites[0].quote).toContain("₹7.6L");
    expect(data.dropped).toHaveLength(1);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.messages[1].content).toContain("[talent-chn-swe]");
    expect(fetchMock.mock.calls[0][1].headers.authorization).toBe("Bearer test-key");
  });

  it("validates input", async () => {
    expect((await ask(req({ question: "" }, ip()))).status).toBe(400);
    expect((await ask(req({ question: "x".repeat(301) }, ip()))).status).toBe(400);
    expect((await ask(req({ nope: 1 }, ip()))).status).toBe(400);
  });

  it("blocks cross-site requests", async () => {
    expect((await ask(req({ question: "pay in Pune" }, { ...ip(), origin: "https://evil.example" }))).status).toBe(403);
  });

  it("answers without calling Groq when no facts match", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await ask(req({ question: "zzqx qqzz" }, ip()));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("explains a missing key clearly", async () => {
    delete process.env.GROQ_API_KEY;
    const res = await ask(req({ question: "pay in Pune" }, ip()));
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe("not_configured");
  });

  it("maps Groq rate limits and bad JSON to friendly errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));
    expect((await ask(req({ question: "pay in Pune" }, ip()))).status).toBe(429);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "not json" } }] }))));
    expect((await (await ask(req({ question: "pay in Pune" }, ip()))).json()).code).toBe("bad_output");
  });

  it("rate limits a single client", async () => {
    vi.stubGlobal("fetch", groqReply({ sentences: [] }));
    const h = ip();
    const codes = [];
    for (let i = 0; i < 8; i++) codes.push((await ask(req({ question: "pay in Pune" }, h))).status);
    expect(codes).toContain(429);
  });
});

describe("/api/explain", () => {
  const query = toQuery({ company: "", sector: SECTORS[0], headcount: 40, seniorShare: 30, priority: "balanced", timeline: "mid", ownership: "later" });

  it("allows computed brief numbers and cited facts, drops invented ones", async () => {
    vi.stubGlobal(
      "fetch",
      groqReply({
        sentences: [
          { text: "For 40 people, the brief ranks cities by your balanced priority.", cites: [] },
          { text: "Setup would cost exactly $123,456.", cites: [] },
        ],
      }),
    );
    const res = await explain(req({ query }, ip()));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.sentences.map((s: { text: string }) => s.text)).toEqual(["For 40 people, the brief ranks cities by your balanced priority."]);
    expect(data.dropped).toHaveLength(1);
  });

  it("rejects an invalid brief query", async () => {
    expect((await explain(req({ query: "n=0" }, ip()))).status).toBe(400);
  });
});

describe("groq fallback", () => {
  it("retries on the free fallback model when the main model is rate limited", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ sentences: [{ text: "Pune pay is ₹9.5L.", cites: ["talent-pune-swe"] }] }) } }] })));
    vi.stubGlobal("fetch", fetchMock);
    const res = await ask(req({ question: "engineer pay in Pune" }, ip()));
    expect(res.status).toBe(200);
    const models = fetchMock.mock.calls.map((c) => JSON.parse(c[1].body).model);
    expect(models).toEqual(["openai/gpt-oss-120b", "openai/gpt-oss-20b"]);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).reasoning_effort).toBe("low");
  });
});
