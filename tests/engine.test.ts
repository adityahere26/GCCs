import { describe, expect, it } from "vitest";
import { buildBrief, parseInput, toQuery, SECTORS, type BriefInput } from "@/lib/engine";

const base: BriefInput = { company: "Acme", sector: SECTORS[0], headcount: 40, seniorShare: 30, priority: "balanced", timeline: "mid", ownership: "later" };

describe("parseInput", () => {
  it("round-trips through the query string", () => {
    const q = Object.fromEntries(new URLSearchParams(toQuery(base)));
    expect(parseInput(q).input).toEqual(base);
  });

  it("rejects out-of-range and malformed values", () => {
    expect(parseInput({ n: "0", sector: SECTORS[0] }).errors.length).toBeGreaterThan(0);
    expect(parseInput({ n: "5001", sector: SECTORS[0] }).errors.length).toBeGreaterThan(0);
    expect(parseInput({ n: "12.5", sector: SECTORS[0] }).errors.length).toBeGreaterThan(0);
    expect(parseInput({ n: "10", sector: "Crypto" }).errors).toContain("Choose a sector from the list.");
    expect(parseInput({ n: "10", sector: SECTORS[0], p: "__proto__" }).errors).toContain("Unknown priority.");
  });

  it("strips markup from the company name", () => {
    const { input } = parseInput({ n: "10", sector: SECTORS[0], c: "<script>alert(1)</script>Acme" });
    expect(input?.company).toBe("scriptalert(1)scriptAcme");
  });
});

describe("buildBrief", () => {
  it("ranks all six cities with scores between 0 and 100", () => {
    const b = buildBrief(base);
    expect(b.cities).toHaveLength(6);
    for (const c of b.cities) {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(100);
    }
    expect(b.cities.map((c) => c.score)).toEqual([...b.cities.map((c) => c.score)].sort((a, z) => z - a));
  });

  it("puts the cheapest city first when cost is the priority", () => {
    const b = buildBrief({ ...base, priority: "cost" });
    const cheapest = [...b.cities].sort((a, z) => a.blendedMedianLakh - z.blendedMedianLakh)[0];
    expect(b.cities[0].components.cost).toBe(100);
    expect(cheapest.components.cost).toBe(100);
  });

  it("puts the deepest talent pool first when talent is the priority", () => {
    expect(buildBrief({ ...base, priority: "talent" }).cities[0].name).toBe("Bengaluru");
  });

  it("tells large teams that Flexiple's managed model is not the right fit", () => {
    const managed = buildBrief({ ...base, headcount: 200, ownership: "yes" }).models.find((m) => m.id === "managed")!;
    expect(managed.fit).toBe("not-recommended");
    expect(managed.isFlexiple).toBe(true);
  });

  it("recommends captive for large teams that want their own entity", () => {
    expect(buildBrief({ ...base, headcount: 200, ownership: "yes" }).models.find((m) => m.id === "captive")!.fit).toBe("recommended");
  });

  it("does not recommend captive for tiny teams or 3-month timelines", () => {
    expect(buildBrief({ ...base, headcount: 8 }).models.find((m) => m.id === "captive")!.fit).toBe("not-recommended");
    expect(buildBrief({ ...base, timeline: "asap" }).models.find((m) => m.id === "captive")!.fit).toBe("not-recommended");
  });

  it("applies policy thresholds to team size", () => {
    const small = buildBrief({ ...base, headcount: 50 }).cities.find((c) => c.name === "Pune")!;
    const large = buildBrief({ ...base, headcount: 150 }).cities.find((c) => c.name === "Pune")!;
    expect(small.policies[0].status).toBe("unlikely");
    expect(large.policies[0].status).toBe("likely");
  });

  it("does not let non-captive teams qualify for Haryana's captive-only policy", () => {
    const ncr = buildBrief({ ...base, headcount: 300, ownership: "no" }).cities.find((c) => c.name === "Delhi NCR")!;
    expect(ncr.policies.find((p) => p.state === "Haryana")!.status).toBe("unlikely");
  });

  it("cites only verified claims", () => {
    const b = buildBrief(base);
    const cites = [
      ...b.cities.flatMap((c) => [c.pool, c.swe, c.senior, c.fitout, ...c.signals, ...c.policies.flatMap((p) => p.reasons.flatMap((r) => r.cite))]),
      ...b.models.flatMap((m) => [...m.timeToStart.cite, ...(m.monthlyFee?.cite ?? []), ...(m.oneTime?.cite ?? [])]),
      ...b.conflicts.flatMap((c) => c.values),
    ];
    expect(cites.every((c) => c.status === "verified")).toBe(true);
  });

  it("scales payroll with headcount", () => {
    const a = buildBrief({ ...base, headcount: 10 }).cities.find((c) => c.name === "Pune")!;
    const b = buildBrief({ ...base, headcount: 100 }).cities.find((c) => c.name === "Pune")!;
    expect(b.annualPayrollCrore).toBeCloseTo(a.annualPayrollCrore * 10, 0);
  });
});
