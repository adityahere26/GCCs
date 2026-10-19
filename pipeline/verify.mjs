// Step 3 of the evidence pipeline: check every claim against its cached source
// and write the public ledger plus evaluation numbers.
// Usage: node pipeline/verify.mjs
import { readFile, writeFile } from "node:fs/promises";
import { verifyClaim } from "./verify-core.mjs";

const read = async (p) => JSON.parse(await readFile(new URL(p, import.meta.url), "utf8"));
const sources = Object.fromEntries((await read("./sources.json")).map((s) => [s.id, s]));
const fetchStatus = await read("./fetch-status.json");
const claims = await read("./claims.json");

const textCache = {};
async function sourceText(id) {
  if (!(id in textCache)) {
    textCache[id] = await readFile(new URL(`./cache/${id}.txt`, import.meta.url), "utf8").catch(() => null);
  }
  return textCache[id];
}

const rows = [];
for (const c of claims) {
  const src = sources[c.source];
  if (!src) throw new Error(`claim ${c.id} references unknown source ${c.source}`);
  const result = verifyClaim(c, await sourceText(c.source));
  rows.push({
    ...c,
    probe: Boolean(c.probe),
    status: result.status,
    reason: result.reason,
    sourceUrl: src.url,
    publisher: src.publisher,
    tier: src.tier,
    fetch: fetchStatus[c.source] ?? "unknown",
  });
}

const real = rows.filter((r) => !r.probe);
const probes = rows.filter((r) => r.probe);
const evaluation = {
  generatedAt: new Date().toISOString().slice(0, 10),
  sources: Object.keys(sources).length,
  sourcesFetched: Object.values(fetchStatus).filter((s) => s === "ok" || s === "cached").length,
  claims: real.length,
  verified: real.filter((r) => r.status === "verified").length,
  rejected: real.filter((r) => r.status === "rejected").length,
  unverifiable: real.filter((r) => r.status === "unverifiable").length,
  probes: probes.length,
  probesCaught: probes.filter((r) => r.status === "rejected").length,
};

await writeFile(new URL("../src/data/ledger.json", import.meta.url), JSON.stringify({ evaluation, rows }, null, 2));
console.log(evaluation);
for (const r of rows) {
  const expected = r.probe ? "rejected" : r.fetch === "ok" || r.fetch === "cached" ? "verified" : "unverifiable";
  if (r.status !== expected) console.log("UNEXPECTED", r.id, r.status, r.reason);
}
