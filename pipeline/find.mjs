// Dev helper: print sentences in a cached source that contain any keyword.
// Usage: node pipeline/find.mjs <sourceId> <kw1> [kw2 ...]
import { readFileSync } from "node:fs";
const [id, ...kws] = process.argv.slice(2);
const text = readFileSync(new URL(`./cache/${id}.txt`, import.meta.url), "utf8").replace(/\s+/g, " ");
const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z"“‘(₹$0-9])/);
const hits = sentences.filter((s) => kws.some((k) => s.includes(k)));
console.log(`=== ${id}`);
for (const s of hits.slice(0, 5)) console.log("-", s.slice(0, 400));
