// Builds city x sector peer counts from Flexiple's public GCC directory
// (flexiple.com/gcc/india). Only aggregates and a few example names are kept.
// Usage: node pipeline/peers.mjs
import { writeFile } from "node:fs/promises";

const URL_ = "https://flexiple.com/gcc/india";
const html = await (await fetch(URL_, { headers: { "user-agent": "Mozilla/5.0" } })).text();
const decode = (s) => s.replace(/&#38;|&amp;/g, "&").replace(/&#39;/g, "'").trim();

const cards = html.split('<li id="gcc-').slice(1).map((chunk) => {
  const attr = (k) => chunk.match(new RegExp(`data-${k}="([^"]*)"`))?.[1] ?? "";
  const name = chunk.match(/class="gcc-name">([^<]+)</)?.[1];
  const hq = chunk.match(/<dd>([^<]+)<\/dd> <dt>Parent HQ/)?.[1];
  return {
    name: name ? decode(name) : null,
    sector: decode(attr("s")),
    size: attr("z"),
    model: attr("m"),
    cities: attr("c").split("|").filter(Boolean),
    hq: hq ? decode(hq) : null,
  };
}).filter((c) => c.name && c.sector);

const cities = {};
for (const c of cards) {
  for (const city of c.cities) {
    const e = (cities[city] ??= { total: 0, captive: 0, sectors: {}, sizes: {}, examples: {} });
    e.total++;
    if (c.model === "captive") e.captive++;
    e.sectors[c.sector] = (e.sectors[c.sector] ?? 0) + 1;
    e.sizes[c.size] = (e.sizes[c.size] ?? 0) + 1;
    const ex = (e.examples[c.sector] ??= []);
    if (ex.length < 6) ex.push(c.name);
  }
}

const out = {
  source: { url: URL_, publisher: "Flexiple", fetchedAt: new Date().toISOString().slice(0, 10) },
  totalCentres: cards.length,
  sectors: [...new Set(cards.map((c) => c.sector))].sort(),
  cities,
};
await writeFile(new URL("../src/data/peers.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`parsed ${cards.length} centres across ${Object.keys(cities).length} cities`);
console.log(out.sectors.join(" | "));
console.log(Object.entries(cities).map(([k, v]) => `${k}:${v.total}`).join(" "));
