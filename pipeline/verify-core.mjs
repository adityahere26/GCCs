// Deterministic checks that every extracted claim is grounded in its source.
// An LLM proposes {value, quote}; this code decides whether to trust it.
import { normalize } from "./text.mjs";

const NUM = /\d[\d,]*(?:\.\d+)?/g;

export function numbersIn(s) {
  return (s.match(NUM) ?? []).map((n) => n.replace(/,/g, ""));
}

function hasNumber(text, n) {
  const plain = text.replace(/(\d),(?=\d)/g, "$1");
  return new RegExp(`(?<![\\d.])${n.replace(".", "\\.")}(?![\\d]|\\.\\d)`).test(plain);
}

/**
 * @param {{value: string, quote: string}} claim
 * @param {string | null} sourceText  null when the source could not be fetched
 * @returns {{status: "verified" | "rejected" | "unverifiable", reason: string}}
 */
export function verifyClaim(claim, sourceText) {
  if (sourceText == null) return { status: "unverifiable", reason: "source_unavailable" };
  const quote = normalize(claim.quote);
  if (quote.length < 12) return { status: "rejected", reason: "quote_too_short" };
  if (!normalize(sourceText).includes(quote)) return { status: "rejected", reason: "quote_not_in_source" };
  const nums = numbersIn(claim.value);
  if (nums.length > 0) {
    if (!nums.every((n) => hasNumber(quote, n))) return { status: "rejected", reason: "value_not_in_quote" };
  } else if (!quote.includes(normalize(claim.value))) {
    return { status: "rejected", reason: "value_not_in_quote" };
  }
  return { status: "verified", reason: "quote_and_value_match" };
}
