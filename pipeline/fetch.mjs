// Step 1 of the evidence pipeline: download each source and store plain text.
// Usage: node pipeline/fetch.mjs  (re-fetches only sources missing from cache)
import { readFile, writeFile, access } from "node:fs/promises";
import { htmlToText } from "./text.mjs";

const sources = JSON.parse(await readFile(new URL("./sources.json", import.meta.url)));
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";
const status = {};

for (const s of sources) {
  const out = new URL(`./cache/${s.id}.txt`, import.meta.url);
  try { await access(out); status[s.id] = "cached"; continue; } catch {}
  try {
    const res = await fetch(s.url, { headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok) { status[s.id] = `http_${res.status}`; continue; }
    if (!type.includes("html")) { status[s.id] = `unsupported_${type.split(";")[0]}`; continue; }
    const text = htmlToText(await res.text());
    if (text.length < 500) { status[s.id] = "too_short"; continue; }
    await writeFile(out, text);
    status[s.id] = "ok";
  } catch (e) {
    status[s.id] = `error_${e.name}`;
  }
  console.log(s.id, status[s.id]);
}
await writeFile(new URL("./fetch-status.json", import.meta.url), JSON.stringify(status, null, 2));
