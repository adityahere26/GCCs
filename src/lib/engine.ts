import peersJson from "@/data/peers.json";
import { fact, type Claim } from "./ledger";

/* ---------- inputs ---------- */

export const PRIORITIES = {
  balanced: { label: "Balanced", weights: { talent: 0.3, cost: 0.3, peers: 0.2, incentives: 0.2 } },
  cost: { label: "Lowest cost", weights: { talent: 0.2, cost: 0.5, peers: 0.1, incentives: 0.2 } },
  talent: { label: "Deepest talent pool", weights: { talent: 0.5, cost: 0.15, peers: 0.25, incentives: 0.1 } },
  ecosystem: { label: "Strongest peer ecosystem", weights: { talent: 0.25, cost: 0.15, peers: 0.45, incentives: 0.15 } },
} as const;

export const TIMELINES = {
  asap: "Within 3 months",
  mid: "3 to 6 months",
  long: "6 to 12 months",
} as const;

export const OWNERSHIP = {
  yes: "Yes, we want our own entity",
  later: "Eventually, not on day one",
  no: "No, we only need the team",
} as const;

export type Priority = keyof typeof PRIORITIES;
export type Timeline = keyof typeof TIMELINES;
export type Ownership = keyof typeof OWNERSHIP;

export interface BriefInput {
  company: string;
  sector: string;
  headcount: number;
  seniorShare: number; // 0..100
  priority: Priority;
  timeline: Timeline;
  ownership: Ownership;
}

const peers = peersJson as {
  source: { url: string; publisher: string; fetchedAt: string };
  totalCentres: number;
  sectors: string[];
  cities: Record<string, { total: number; captive: number; sectors: Record<string, number>; examples: Record<string, string[]> }>;
};

export const SECTORS = peers.sectors;
export const PEER_SOURCE = peers.source;
export const PEER_TOTAL = peers.totalCentres;

export const LIMITS = { headcountMin: 1, headcountMax: 5000 };

/** Parses untrusted query params into a valid input, or returns a list of problems. */
export function parseInput(q: Record<string, string | undefined>): { input?: BriefInput; errors: string[] } {
  const errors: string[] = [];
  const headcount = Number(q.n);
  const seniorShare = q.s === undefined ? 30 : Number(q.s);
  const sector = q.sector ?? "";
  const priority = (q.p ?? "balanced") as Priority;
  const timeline = (q.t ?? "mid") as Timeline;
  const ownership = (q.o ?? "later") as Ownership;

  if (!Number.isInteger(headcount) || headcount < LIMITS.headcountMin || headcount > LIMITS.headcountMax) {
    errors.push(`Team size must be a whole number between ${LIMITS.headcountMin} and ${LIMITS.headcountMax}.`);
  }
  if (!Number.isFinite(seniorShare) || seniorShare < 0 || seniorShare > 100) errors.push("Senior share must be between 0 and 100.");
  if (!SECTORS.includes(sector)) errors.push("Choose a sector from the list.");
  if (!Object.hasOwn(PRIORITIES, priority)) errors.push("Unknown priority.");
  if (!Object.hasOwn(TIMELINES, timeline)) errors.push("Unknown timeline.");
  if (!Object.hasOwn(OWNERSHIP, ownership)) errors.push("Unknown ownership preference.");
  if (errors.length) return { errors };

  const company = (q.c ?? "").replace(/[^\p{L}\p{N} .,&'()-]/gu, "").trim().slice(0, 80);
  return { input: { company, sector, headcount, seniorShare: Math.round(seniorShare), priority, timeline, ownership }, errors };
}

export function toQuery(i: BriefInput): string {
  const p = new URLSearchParams({ n: String(i.headcount), s: String(i.seniorShare), sector: i.sector, p: i.priority, t: i.timeline, o: i.ownership });
  if (i.company) p.set("c", i.company);
  return p.toString();
}

/* ---------- incentives ---------- */

export type Eligibility = "likely" | "check" | "unlikely" | "none";

export interface PolicyResult {
  state: string;
  status: Eligibility;
  headline: string;
  reasons: { text: string; cite: Claim[] }[];
  score: number; // 0..1, used for ranking
}

const ELIGIBILITY_SCORE: Record<Eligibility, number> = { likely: 1, check: 0.6, unlikely: 0.2, none: 0.1 };

function policyFor(state: string, i: BriefInput): PolicyResult {
  const n = i.headcount;
  const r = (status: Eligibility, headline: string, reasons: PolicyResult["reasons"]): PolicyResult => ({
    state, status, headline, reasons, score: ELIGIBILITY_SCORE[status],
  });

  switch (state) {
    case "Karnataka":
      return r("check", "Dedicated GCC policy (2024–29). Size thresholds for Bengaluru were not in the sources we could verify.", [
        { text: "Policy targets 500 new GCCs by 2029.", cite: [fact("policy-ka-target")] },
        { text: "Headline incentives include rental reimbursement up to 50% and EPF support.", cite: [fact("policy-ka-incentives")] },
        { text: "Extra recruitment assistance applies only Beyond Bengaluru, for 100+ employees.", cite: [fact("policy-ka-beyond")] },
      ]);
    case "Maharashtra":
      return n >= 100
        ? r("likely", "Your planned size meets Maharashtra's 100-employee entry threshold.", [
            { text: "Eligibility begins at INR 50 crore investment or 100 employees.", cite: [fact("policy-mh-eligibility")] },
            { text: "Choice of a 20% capital subsidy or a 10–20% rental subsidy for five years.", cite: [fact("policy-mh-subsidy")] },
          ])
        : r("unlikely", `At ${n} people you are below the 100-employee threshold, unless investment exceeds INR 50 crore.`, [
            { text: "Eligibility begins at INR 50 crore investment or 100 employees.", cite: [fact("policy-mh-eligibility")] },
          ]);
    case "Haryana": {
      const owns = i.ownership !== "no";
      if (n >= 100 && owns) {
        return r("likely", "Captive centres reaching 100 employees within three years qualify (Gurugram).", [
          { text: "Must reach 100 employees within three years and serve only its own group.", cite: [fact("policy-hr-eligibility")] },
          { text: "Capex reimbursement is 50% in non-TOD Gurugram and 65% in TOD zones.", cite: [fact("policy-hr-capex")] },
        ]);
      }
      return r("unlikely", owns ? `At ${n} people you are below the 100-employee commitment.` : "Haryana supports captive units only; a team run by a third party does not qualify.", [
        { text: "Must reach 100 employees within three years and serve only its own group.", cite: [fact("policy-hr-eligibility")] },
      ]);
    }
    case "Uttar Pradesh":
      return n >= 200
        ? r("likely", "Meets UP's Level-1 threshold for Noida (200 employees).", [
            { text: "Level-1 needs 200 employees in Noida or Ghaziabad.", cite: [fact("policy-up-threshold")] },
            { text: "Incentives include 30–50% land subsidy and full stamp duty exemption.", cite: [fact("policy-up-incentives")] },
          ])
        : r("unlikely", `At ${n} people you are below UP's 200-employee Level-1 threshold for Noida.`, [
            { text: "Level-1 needs 200 employees in Noida or Ghaziabad.", cite: [fact("policy-up-threshold")] },
          ]);
    case "Tamil Nadu":
      return r("unlikely", "Tamil Nadu's GCC scheme targets Forbes Global 2000 and Fortune 1000 parents. General R&D incentives still apply.", [
        { text: "Scheme limited to Forbes G2000 / Fortune 1000 parents committing 200+ jobs.", cite: [fact("policy-tn-eligibility")] },
        { text: "General land cost incentive up to 50%.", cite: [fact("policy-tn-land")] },
      ]);
    case "Telangana":
      return r("check", "No standalone GCC policy we could verify; a new policy focused on frontier tech is being drafted.", [
        { text: "A new GCC policy is in preparation, aimed at frontier technologies.", cite: [fact("policy-tg-draft")] },
        { text: "Incentives today come from general IT policy: land, electricity, employment-linked support.", cite: [fact("policy-tg-target")] },
      ]);
    default:
      return r("none", "No policy data.", []);
  }
}

/* ---------- cities ---------- */

interface CityDef {
  id: string;
  name: string;
  states: string[];
  peersKey: string;
  talent: { pool: string; swe: string; senior: string };
  fitout: string;
  signals: string[];
}

export const CITIES: CityDef[] = [
  { id: "blr", name: "Bengaluru", states: ["Karnataka"], peersKey: "bengaluru", talent: { pool: "talent-blr-pool", swe: "talent-blr-swe", senior: "talent-blr-senior" }, fitout: "fitout-blr", signals: ["city-blr-units", "attrition-blr-vendor"] },
  { id: "hyd", name: "Hyderabad", states: ["Telangana"], peersKey: "hyderabad", talent: { pool: "talent-hyd-pool", swe: "talent-hyd-swe", senior: "talent-hyd-senior" }, fitout: "fitout-hyd", signals: ["city-hyd-share", "new-2025-hyd-share"] },
  { id: "pune", name: "Pune", states: ["Maharashtra"], peersKey: "pune", talent: { pool: "talent-pune-pool", swe: "talent-pune-swe", senior: "talent-pune-senior" }, fitout: "fitout-pune", signals: ["city-pune-share"] },
  { id: "mum", name: "Mumbai", states: ["Maharashtra"], peersKey: "mumbai", talent: { pool: "talent-mum-pool", swe: "talent-mum-swe", senior: "talent-mum-senior" }, fitout: "fitout-mum", signals: [] },
  { id: "chn", name: "Chennai", states: ["Tamil Nadu"], peersKey: "chennai", talent: { pool: "talent-chn-pool", swe: "talent-chn-swe", senior: "talent-chn-senior" }, fitout: "fitout-chn", signals: ["risk-wf-chennai"] },
  { id: "ncr", name: "Delhi NCR", states: ["Haryana", "Uttar Pradesh"], peersKey: "delhi", talent: { pool: "talent-ncr-pool", swe: "talent-ncr-swe", senior: "talent-ncr-senior" }, fitout: "fitout-ncr", signals: [] },
];

export interface CityResult {
  id: string;
  name: string;
  score: number; // 0..100
  components: { talent: number; cost: number; peers: number; incentives: number }; // each 0..100
  pool: Claim;
  swe: Claim;
  senior: Claim;
  blendedMedianLakh: number;
  annualPayrollCrore: number;
  fitout: Claim;
  sectorPeers: number;
  totalPeers: number;
  peerExamples: string[];
  policies: PolicyResult[];
  signals: Claim[];
}

const minMax = (vals: number[]) => {
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return (v: number) => (hi === lo ? 1 : (v - lo) / (hi - lo));
};

/* ---------- operating models ---------- */

export type ModelId = "captive" | "bot" | "eor" | "managed";

export interface ModelResult {
  id: ModelId;
  name: string;
  fit: "recommended" | "consider" | "not-recommended";
  timeToStart: { text: string; cite: Claim[] };
  monthlyFee: { text: string; cite: Claim[] } | null;
  oneTime: { text: string; cite: Claim[] } | null;
  reasons: string[];
  isFlexiple: boolean;
}

const usd = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

function models(i: BriefInput): ModelResult[] {
  const n = i.headcount;
  const fast = i.timeline === "asap";
  const wantsEntity = i.ownership === "yes";
  const noEntity = i.ownership === "no";
  const big = n > 50;
  const small = n < 20;

  const captive: ModelResult = {
    id: "captive", name: "Own entity (captive)", isFlexiple: false,
    fit: small || fast || noEntity ? "not-recommended" : big && wantsEntity ? "recommended" : "consider",
    timeToStart: { text: "16–24 weeks to first hire (vendor); 12–18 months for a full legacy setup (vendor)", cite: [fact("time-models-vlink"), fact("time-models-ansr")] },
    monthlyFee: null,
    oneTime: { text: "$200K–$500K one-time setup", cite: [fact("cost-captive-setup")] },
    reasons: [
      small ? `At ${n} people you are below the 20–50 engineer range where a vendor source says captive economics start to win.` : big ? `At ${n} people you are above the 20–50 engineer range where captive economics typically win (vendor source).` : `At ${n} people you are inside the 20–50 range where captive and partner models are close.`,
      fast ? "Your 3-month timeline is shorter than typical captive setup times." : "",
      noEntity ? "You said you do not want an entity." : "",
    ].filter(Boolean),
  };

  const bot: ModelResult = {
    id: "bot", name: "Build-operate-transfer (BOT)", isFlexiple: false,
    fit: small || noEntity ? "not-recommended" : (i.ownership === "later" || fast) && n >= 20 ? "recommended" : "consider",
    timeToStart: { text: "8–16 weeks to first hire (vendor)", cite: [fact("time-models-vlink")] },
    monthlyFee: { text: `${usd(1500 * n)}–${usd(3000 * n)}/month management fees for ${n} people, plus salaries`, cite: [fact("cost-bot-mgmt")] },
    oneTime: { text: "$50K–$150K setup + $100K–$300K transfer fee", cite: [fact("cost-bot-setup"), fact("cost-bot-transfer")] },
    reasons: [
      small ? "Setup and transfer fees are hard to recover on a team this small." : "A partner builds the centre, then hands you the entity.",
      i.ownership === "later" ? "Matches your plan to own the entity later." : "",
    ].filter(Boolean),
  };

  const eor: ModelResult = {
    id: "eor", name: "Employer of record (EOR)", isFlexiple: false,
    fit: big ? "not-recommended" : small || fast ? "recommended" : "consider",
    timeToStart: { text: "4–8 weeks for managed or EOR-style teams (vendor)", cite: [fact("time-models-vlink")] },
    monthlyFee: { text: `${usd(99 * n)}–${usd(699 * n)}/month in EOR fees for ${n} people, plus salaries`, cite: [fact("cost-eor-range-asanify"), fact("cost-eor-range-boundless")] },
    oneTime: null,
    reasons: [
      "Published EOR fees vary about 7x for similar service; sources even disagree on the floor ($99 vs $199).",
      big ? "At this size, per-head fees add up faster than the cost of your own entity." : "No entity needed to start hiring.",
    ],
  };

  const managedCost = 299 * n;
  const managed: ModelResult = {
    id: "managed", name: "Managed team (Flexiple)", isFlexiple: true,
    fit: big && !noEntity ? "not-recommended" : small || fast || noEntity ? "recommended" : "consider",
    timeToStart: { text: "From 72 hours (Flexiple's own claim)", cite: [fact("time-flexiple-managed")] },
    monthlyFee: { text: `${usd(managedCost)}/month at $299 per person, plus salaries at cost`, cite: [fact("cost-flexiple-managed")] },
    oneTime: null,
    reasons: [
      big && !noEntity
        ? `At ${n} people, fees of about ${usd(managedCost * 12)} a year are likely more than running your own entity. Use Flexiple as a short bridge at most.`
        : "Fixed published fee; the team can transfer to your entity later.",
      "Flexiple sells this model. Treat this row as a vendor option, not neutral advice.",
    ],
  };

  return [captive, bot, eor, managed];
}

/* ---------- brief ---------- */

export interface Brief {
  input: BriefInput;
  cities: CityResult[];
  models: ModelResult[];
  runCost: { text: string; cite: Claim[] };
  conflicts: { topic: string; note: string; values: Claim[] }[];
}

export function buildBrief(i: BriefInput): Brief {
  const s = i.seniorShare / 100;
  const weights = PRIORITIES[i.priority].weights;

  const raw = CITIES.map((c) => {
    const pool = fact(c.talent.pool);
    const swe = fact(c.talent.swe);
    const senior = fact(c.talent.senior);
    const blended = (1 - s) * (swe.num ?? 0) + s * (senior.num ?? 0);
    const p = peers.cities[c.peersKey];
    const policies = c.states.map((st) => policyFor(st, i));
    return {
      c, pool, swe, senior, blended,
      sectorPeers: p?.sectors[i.sector] ?? 0,
      totalPeers: p?.total ?? 0,
      peerExamples: p?.examples[i.sector] ?? [],
      policies,
      policyScore: Math.max(...policies.map((x) => x.score)),
    };
  });

  const nTalent = minMax(raw.map((r) => Math.log(r.pool.num ?? 1)));
  const nCost = minMax(raw.map((r) => -r.blended));
  const nPeers = minMax(raw.map((r) => r.sectorPeers));

  const cities: CityResult[] = raw
    .map((r) => {
      const components = {
        talent: nTalent(Math.log(r.pool.num ?? 1)),
        cost: nCost(-r.blended),
        peers: nPeers(r.sectorPeers),
        incentives: r.policyScore,
      };
      const score =
        components.talent * weights.talent + components.cost * weights.cost + components.peers * weights.peers + components.incentives * weights.incentives;
      return {
        id: r.c.id,
        name: r.c.name,
        score: Math.round(score * 100),
        components: {
          talent: Math.round(components.talent * 100),
          cost: Math.round(components.cost * 100),
          peers: Math.round(components.peers * 100),
          incentives: Math.round(components.incentives * 100),
        },
        pool: r.pool,
        swe: r.swe,
        senior: r.senior,
        blendedMedianLakh: Math.round(r.blended * 10) / 10,
        annualPayrollCrore: Math.round(((r.blended * i.headcount) / 100) * 10) / 10,
        fitout: fact(r.c.fitout),
        sectorPeers: r.sectorPeers,
        totalPeers: r.totalPeers,
        peerExamples: r.peerExamples,
        policies: r.policies,
        signals: r.c.signals.map(fact),
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return {
    input: i,
    cities,
    models: models(i),
    runCost: {
      text: `${usd(25000 * i.headcount)}–${usd(80000 * i.headcount)} a year fully loaded for ${i.headcount} engineers`,
      cite: [fact("cost-run-per-engineer")],
    },
    conflicts: [
      {
        topic: "How many GCCs India has",
        note: "Sources count different things: parent companies, centres, or subsets such as Forbes 2000 firms.",
        values: ["count-flexiple", "count-govt", "count-deloitte", "count-ey", "count-cea", "count-zinnov-parents", "count-zinnov-units"].map(fact),
      },
      {
        topic: "Attrition",
        note: "A survey of centres, a talent tracker and a vendor blog give answers from 9% to 25%.",
        values: ["attrition-ey", "attrition-zinnov", "attrition-blr-vendor"].map(fact),
      },
      {
        topic: "GCC office leasing in 2025",
        note: "Three real estate firms measure leasing differently.",
        values: ["lease-colliers-2025", "lease-jll-2025", "lease-vestian-2025"].map(fact),
      },
      {
        topic: "EOR price floor",
        note: "Two comparison pages published weeks apart disagree on the cheapest India EOR fee.",
        values: ["cost-eor-range-asanify", "cost-eor-range-boundless"].map(fact),
      },
    ],
  };
}
