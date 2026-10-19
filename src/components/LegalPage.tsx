import type { ReactNode } from "react";
import { Card, Eyebrow } from "./ui";
import { SITE } from "@/lib/site";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="max-w-3xl p-6 md:p-8">
      <Eyebrow>Last updated {SITE.lastUpdated}</Eyebrow>
      <h1 className="text-2xl font-bold tracking-[-0.03em] md:text-[28px]">{title}</h1>
      <div className="prose-legal mt-4">{children}</div>
    </Card>
  );
}

/** Contact line that only renders details the deployer has configured. */
export function Contact() {
  if (SITE.contactEmail) {
    return (
      <>
        email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
      </>
    );
  }
  if (SITE.repoUrl) {
    return (
      <>
        open an issue on the <a href={SITE.repoUrl}>project repository</a>
      </>
    );
  }
  return <>contact the author through the channel where you received this link</>;
}
