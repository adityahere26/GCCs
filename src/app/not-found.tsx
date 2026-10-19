import Link from "next/link";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <p className="tabular text-sm text-ink-3">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">This page does not exist</h1>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-[15px] font-medium text-accent-ink">
        Back to the planner
      </Link>
    </Container>
  );
}
