import { Container } from "@/components/ui";

export default function Loading() {
  return (
    <Container aria-busy="true">
      <p className="sr-only">Building your brief…</p>
      <div className="h-4 w-48 animate-pulse rounded bg-sunken" />
      <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-sunken" />
      <div className="mt-8 h-40 animate-pulse rounded-[14px] bg-sunken" />
    </Container>
  );
}
