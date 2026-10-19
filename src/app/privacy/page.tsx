import type { Metadata } from "next";
import Link from "next/link";
import { Contact, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy policy", description: "What Ground Truth collects (almost nothing) and why." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        Ground Truth is a prototype built to collect as little as possible. There are no accounts, no database, no analytics, no
        advertising and no cookies.
      </p>

      <h2>What you enter</h2>
      <p>
        The planning form asks for an optional company name, a sector, a team size, a senior share, a priority, a timeline and an
        ownership preference. It does not ask for your name, email or any personal data, so please do not type any into the company field.
      </p>
      <ul>
        <li>Your answers are sent to our server only to build the brief page, and are placed in that page&apos;s web address.</li>
        <li>They are not saved to any database or file by this application.</li>
        <li>They are sent to an AI service only if you press &ldquo;Explain this brief&rdquo; (see below).</li>
        <li>Because they are in the address, anyone you share the link with can see them. Brief pages are marked so search engines do not index them.</li>
      </ul>

      <h2>AI features (Groq)</h2>
      <p>
        Two optional features use a language model hosted by Groq, Inc.: &ldquo;Ask the evidence&rdquo; and &ldquo;Explain this brief&rdquo;. Only
        when you use them, we send Groq your question or your brief&apos;s planning answers (including the optional company name), together with
        public facts from our evidence ledger. Nothing else is sent, and no account or identifier is attached. Groq processes the request to
        generate the answer under its own terms; see <a href="https://groq.com/privacy-policy/" rel="noopener noreferrer">Groq&apos;s privacy policy</a>.
        Please do not type personal or confidential information into these features.
      </p>

      <h2>Hosting logs</h2>
      <p>
        The site runs on Vercel. Like any web host, Vercel processes technical request data (such as IP address, the requested address
        including your form answers, browser type and time) to deliver and secure the service, and keeps it for a limited period under its
        own policy. We do not use these logs to identify anyone. See <a href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer">Vercel&apos;s privacy policy</a>.
      </p>

      <h2>Third parties</h2>
      <p>
        No third-party scripts, embeds, fonts or trackers load in your browser. The AI features call Groq from our server, not from your browser. Fonts are served from this site&apos;s own domain. Links to
        sources open the publisher&apos;s site, whose own privacy policy then applies.
      </p>

      <h2>Your rights</h2>
      <p>
        Because this application stores no personal data, there is normally nothing to access, correct or delete. If you think otherwise,
        or have questions under India&apos;s Digital Personal Data Protection Act 2023 or the GDPR, please <Contact />.
      </p>

      <h2>Changes</h2>
      <p>
        If the site starts collecting anything new, this page will be updated first. See also the <Link href="/cookies">cookie policy</Link> and{" "}
        <Link href="/terms">terms</Link>.
      </p>
    </LegalPage>
  );
}
