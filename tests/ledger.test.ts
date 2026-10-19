import { describe, expect, it } from "vitest";
import { allRows, evaluation, fact, probeClaims, realClaims } from "@/lib/ledger";

describe("ledger", () => {
  it("catches every hallucination probe", () => {
    expect(probeClaims.length).toBeGreaterThan(0);
    expect(probeClaims.every((p) => p.status === "rejected")).toBe(true);
    expect(evaluation.probesCaught).toBe(evaluation.probes);
  });

  it("only marks claims verified when their source was fetched", () => {
    for (const r of realClaims.filter((r) => r.status === "verified")) expect(["ok", "cached"]).toContain(r.fetch);
  });

  it("refuses to hand out unverified claims as facts", () => {
    const unverified = allRows.find((r) => r.status !== "verified");
    expect(unverified).toBeDefined();
    expect(() => fact(unverified!.id)).toThrow();
  });

  it("has unique claim ids", () => {
    expect(new Set(allRows.map((r) => r.id)).size).toBe(allRows.length);
  });
});
