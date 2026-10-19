# Ground Truth

A free, source-cited India entry brief for companies planning a Global Capability Centre (GCC).
Concept prototype for Flexiple's product internship assignment. Not affiliated with Flexiple.

**Core idea:** AI reads the sources; code decides what to trust. Every number in a brief links to
the exact sentence it came from, and a deterministic check rejects any fact whose quote is not in
the fetched source or does not state the value.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Checks: `npm test` · `npm run lint` · `npm run typecheck` · `npm run build`

## Evidence pipeline

```
pipeline/sources.json   source list (URL, publisher, tier)
pipeline/fetch.mjs      1. download each source to pipeline/cache/<id>.txt (git-ignored)
pipeline/claims.json    2. facts proposed by an LLM: {field, value, exact quote}, plus fabricated test probes
pipeline/verify.mjs     3. deterministic quote + value check → src/data/ledger.json
pipeline/peers.mjs      city × sector peer counts from Flexiple's public GCC directory → src/data/peers.json
```

```bash
npm run pipeline:fetch && npm run pipeline:verify && npm run pipeline:peers
```

Extraction in this prototype was done with Claude during development; `claims.json` is that output.
The app never calls a model at request time, so it costs nothing to run and cannot invent numbers.

## Architecture

- Next.js 15 App Router, TypeScript, Tailwind v4. No database, no auth, no cookies, no analytics.
- `/brief` is server-rendered from URL parameters, validated in `src/lib/engine.ts` (`parseInput`).
- `src/lib/engine.ts` holds all scoring, policy and operating-model rules; `src/lib/ledger.ts` only hands out verified facts.
- Security headers and CSP in `next.config.ts`.

## Deploy (Vercel)

Import the GitHub repo in Vercel, keep defaults, optionally set the variables in `.env.example`.

## Rollback and recovery

- Vercel keeps every deployment. Roll back from the dashboard (Deployments → previous → Promote to Production) or `npx vercel rollback`.
- The app has no stored state, so a rollback restores everything. Data changes ship only through git (`src/data/*.json`), so `git revert` + redeploy restores data too.

## Known limits

- Talent and pay figures come from Flexiple's published statistics page, standing in for its private talent graph.
- Policy terms come from law-firm summaries, not gazette text. Many cost figures come from vendors and are flagged ◆.
- The verifier proves a quote exists and states the value; it does not prove the source is right, or that the field label is correct.
