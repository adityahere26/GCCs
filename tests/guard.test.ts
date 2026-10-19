import { describe, expect, it } from "vitest";
import { guard, numbers } from "@/lib/guard";
import { fact } from "@/lib/ledger";
import { retrieve } from "@/lib/retrieve";

const zinnov = fact("count-zinnov-parents"); // 2,117
const pune = fact("talent-pune-swe"); // ₹9.5L
const allowed = new Map([zinnov, pune].map((c) => [c.id, c]));

describe("guard", () => {
  it("keeps sentences whose numbers appear in their cited facts", () => {
    const r = guard([{ text: "Zinnov counts 2,117 GCCs.", cites: [zinnov.id] }], allowed);
    expect(r.sentences).toHaveLength(1);
    expect(r.sentences[0].cites[0].id).toBe(zinnov.id);
    expect(r.dropped).toHaveLength(0);
  });

  it("drops a sentence with a number its source does not contain", () => {
    const r = guard([{ text: "Zinnov counts 2,400 GCCs.", cites: [zinnov.id] }], allowed);
    expect(r.sentences).toHaveLength(0);
    expect(r.dropped[0].reason).toMatch(/2400/);
  });

  it("drops uncited sentences that state numbers", () => {
    expect(guard([{ text: "India will have 5,000 GCCs.", cites: [] }], allowed).sentences).toHaveLength(0);
  });

  it("ignores citations to facts that were not provided, and still checks the numbers", () => {
    const ok = guard([{ text: "Hyderabad leads.", cites: ["made-up-id"] }], allowed);
    expect(ok.sentences[0].cites).toHaveLength(0);
    expect(guard([{ text: "Hyderabad has 900 centres.", cites: ["made-up-id"] }], allowed).sentences).toHaveLength(0);
  });

  it("accepts bracketed ids and K/M shorthand for numbers in the source", () => {
    const setup = fact("cost-captive-setup"); // $200,000 to $500,000
    const r = guard([{ text: "Setup costs $200K–$500K (vendor estimate).", cites: [`[${setup.id}]`] }], new Map([[setup.id, setup]]));
    expect(r.sentences).toHaveLength(1);
    expect(guard([{ text: "Setup costs $250K.", cites: [setup.id] }], new Map([[setup.id, setup]])).sentences).toHaveLength(0);
  });

  it("allows numbers the app computed or the user typed", () => {
    const r = guard([{ text: "For your 40-person team the payroll is ₹4.1 crore.", cites: [] }], allowed, ["40", "4.1"]);
    expect(r.sentences).toHaveLength(1);
  });

  it("keeps plain uncited sentences without numbers", () => {
    expect(guard([{ text: "The facts do not cover that.", cites: [] }], allowed).sentences).toHaveLength(1);
  });

  it("ignores malformed model output instead of crashing", () => {
    const r = guard([{ text: 42, cites: "x" } as never, null as never, { text: "Pune pay is ₹9.5L.", cites: [pune.id] }], allowed);
    expect(r.sentences.map((s) => s.text)).toEqual(["Pune pay is ₹9.5L."]);
  });

  it("normalises numbers", () => {
    expect(numbers("₹9.5L, 2,117 and 16.0%")).toEqual(["9.5", "2117", "16"]);
    expect(numbers("$200K and 2.36 million")).toEqual(["200", "2.36"]);
  });
});

describe("retrieve", () => {
  it("finds city pay facts for a pay question", () => {
    const ids = retrieve("What is engineer pay in Pune?").map((c) => c.id);
    expect(ids).toContain("talent-pune-swe");
  });

  it("expands aliases like Bangalore and Gurgaon", () => {
    expect(retrieve("salary in Bangalore").some((c) => c.subject === "Bengaluru")).toBe(true);
    expect(retrieve("incentives in Gurgaon").some((c) => c.subject === "Haryana")).toBe(true);
  });

  it("treats capex as capital subsidies", () => {
    const ids = retrieve("Which states give capex subsidies to a 150-person captive GCC?").map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(["policy-hr-capex", "policy-mh-subsidy"]));
  });

  it("returns only verified facts and nothing for unrelated questions", () => {
    expect(retrieve("How many GCCs are there?").every((c) => c.status === "verified")).toBe(true);
    expect(retrieve("zzqx")).toHaveLength(0);
  });
});
