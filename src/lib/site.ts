export const SITE = {
  name: "Ground Truth",
  description:
    "A free, source-cited India entry brief for companies planning a Global Capability Centre: cities, talent, cost, state incentives and operating models, with every number linked to its source.",
  author: "Aditya",
  // Set these in the hosting environment; nothing personal is hard-coded in the repo.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  repoUrl: process.env.NEXT_PUBLIC_REPO_URL ?? "",
  lastUpdated: "19 October 2026",
};

export const EXAMPLE_BRIEF = "/brief?c=Example+fintech&sector=BFSI&n=200&s=30&p=balanced&t=mid&o=yes";
