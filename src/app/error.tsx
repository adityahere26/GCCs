"use client";

import { Container } from "@/components/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong building this page</h1>
      <p className="mt-2 text-ink-3">Nothing you entered was saved. Try again, or go back and adjust your inputs.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-ink px-5 py-2.5 text-[15px] font-medium text-accent-ink">
        Try again
      </button>
    </Container>
  );
}
