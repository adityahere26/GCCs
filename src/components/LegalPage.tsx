import type { ReactNode } from "react";
import { Container, Eyebrow } from "./ui";
import { SITE } from "@/lib/site";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Container className="py-12">
      <div className="max-w-2xl">
        <Eyebrow>Last updated {SITE.lastUpdated}</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="prose-legal mt-6">{children}</div>
      </div>
    </Container>
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
