import { describe, expect, it } from "vitest";
import { verifyClaim, numbersIn } from "../pipeline/verify-core.mjs";

const source = "India is now home to 2,117 GCCs employing 2.36 million professionals. Fees run $50K–$150K one-time.";

describe("verifyClaim", () => {
  it("verifies an exact quote whose numbers match the value", () => {
    expect(verifyClaim({ value: "2,117", quote: "home to 2,117 GCCs employing" }, source).status).toBe("verified");
  });

  it("tolerates whitespace, case and dash differences", () => {
    expect(verifyClaim({ value: "$50K-$150K", quote: "FEES RUN   $50K-$150K one-time" }, source).status).toBe("verified");
  });

  it("rejects a quote that is not in the source", () => {
    expect(verifyClaim({ value: "2,171", quote: "home to 2,171 GCCs employing" }, source)).toEqual({ status: "rejected", reason: "quote_not_in_source" });
  });

  it("rejects a value that the quote does not state", () => {
    expect(verifyClaim({ value: "2,200", quote: "home to 2,117 GCCs employing" }, source).reason).toBe("value_not_in_quote");
  });

  it("does not let 17 match inside 2,117", () => {
    expect(verifyClaim({ value: "17", quote: "home to 2,117 GCCs employing" }, source).reason).toBe("value_not_in_quote");
  });

  it("marks claims from unfetched sources as unverifiable, never verified", () => {
    expect(verifyClaim({ value: "1", quote: "anything at all here" }, null).status).toBe("unverifiable");
  });

  it("rejects trivially short quotes", () => {
    expect(verifyClaim({ value: "2", quote: "2,117" }, source).reason).toBe("quote_too_short");
  });

  it("checks text values when there are no numbers", () => {
    expect(verifyClaim({ value: "million professionals", quote: "employing 2.36 million professionals" }, source).status).toBe("verified");
    expect(verifyClaim({ value: "billion", quote: "employing 2.36 million professionals" }, source).status).toBe("rejected");
  });

  it("extracts numbers without thousands separators", () => {
    expect(numbersIn("$1,500–$3,000 and 2.36")).toEqual(["1500", "3000", "2.36"]);
  });
});
