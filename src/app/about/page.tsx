import type { Metadata } from "next";
import Link from "next/link";
import { Contact, LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "About", description: "Who made Ground Truth and why." };

export default function AboutPage() {
  return (
    <LegalPage title="About">
      <p>
        Ground Truth is a concept prototype by {SITE.author}, made for Flexiple&apos;s product internship assignment. The brief asked how a
        single source of truth for India&apos;s Global Capability Centre ecosystem might work. This is one answer: start with the company
        deciding where and how to build, and show it evidence instead of opinions.
      </p>
      <h2>Business details</h2>
      <ul>
        <li>Operator: {SITE.author}, an individual. Not a registered company.</li>
        <li>Status: non-commercial prototype. No products or services are sold here.</li>
        <li>Affiliation: none. Flexiple is the intended audience for the concept, not its owner or sponsor.</li>
        <li>Contact: <Contact />.</li>
      </ul>
      <h2>Images and data</h2>
      <p>
        The site uses no photographs, logos or third-party images. Its icon is an original lettermark. Data is quoted from public pages with
        attribution; see the <Link href="/evidence">evidence ledger</Link> and the <Link href="/method">method</Link>.
      </p>
    </LegalPage>
  );
}
