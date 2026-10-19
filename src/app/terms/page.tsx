import type { Metadata } from "next";
import { Contact, LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use", description: "Terms for using the Ground Truth prototype." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <h2>What this is</h2>
      <p>
        Ground Truth is a free, non-commercial concept prototype made by {SITE.author} as part of a product internship assignment for
        Flexiple. It is not a Flexiple product, and Flexiple has not reviewed or endorsed it. It sells nothing and takes no payments.
      </p>

      <h2>Not advice</h2>
      <p>
        Briefs are general information produced by fixed rules from public sources. They are not legal, tax, financial, real estate or
        investment advice. State policies, fees and salaries change; confirm eligibility against official notifications and get
        professional advice before making decisions.
      </p>

      <h2>Accuracy</h2>
      <ul>
        <li>Every figure is quoted from a linked public source, with its publisher and date. The quote check confirms the source says it, not that the source is right.</li>
        <li>Figures marked ◆ come from companies that sell the service being described and should be treated as estimates.</li>
        <li>The site contains no reviews, ratings or testimonials. Company names in peer lists come from a public directory and imply no relationship with this site.</li>
      </ul>

      <h2>Third-party content</h2>
      <p>
        Short quotations are reproduced with attribution and a link so readers can check them. All trademarks belong to their owners. If you
        own content quoted here and want it changed or removed, please <Contact />.
      </p>

      <h2>Acceptable use</h2>
      <p>Please do not attempt to disrupt the service, probe it for vulnerabilities without permission, or scrape it at volume.</p>

      <h2>Liability</h2>
      <p>
        The prototype is provided “as is”, without warranties. To the extent the law allows, the author is not liable for losses arising
        from its use. These terms are governed by the laws of India.
      </p>
    </LegalPage>
  );
}
