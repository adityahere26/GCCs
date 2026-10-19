import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Cookie policy", description: "Ground Truth does not set cookies." };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie policy">
      <p>This site does not set any cookies, and it does not use local storage, analytics, advertising pixels or other tracking technologies.</p>
      <p>
        Because nothing optional is stored on your device, there is no cookie banner and nothing to consent to. If that ever changes, a
        consent prompt will be added before any non-essential cookie is set.
      </p>
      <p>
        Source links take you to other websites, which may set their own cookies under their own policies. See the{" "}
        <Link href="/privacy">privacy policy</Link> for what happens to the answers you enter.
      </p>
    </LegalPage>
  );
}
