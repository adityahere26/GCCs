"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Claim } from "@/lib/ledger";
import { REASON_LABEL, TIER_LABEL } from "@/lib/ledger";

/** Inline source chip. Opens a panel with the exact quote, source and verification result. */
export function Cite({ claims, label }: { claims: Claim[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (claims.length === 0) return null;
  const vendor = claims.some((c) => c.tier === "vendor");
  const text = label ?? (claims.length === 1 ? claims[0].publisher : `${claims.length} sources`);

  return (
    <span ref={wrap} className="relative inline-block align-baseline">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`ml-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium leading-4 transition-colors ${
          vendor ? "border-transparent bg-block-cream text-warn hover:border-warn" : "border-line bg-sunken text-ink-2 hover:border-ink hover:text-ink"
        }`}
      >
        <span aria-hidden>{vendor ? "◆" : "✓"}</span>
        {text}
        <span className="sr-only">{vendor ? ", vendor source. " : ", verified source. "}Show quote</span>
      </button>
      {open && (
        <span
          id={id}
          role="dialog"
          aria-label="Source details"
          className="fixed inset-x-4 bottom-4 z-30 block max-h-[60vh] overflow-y-auto rounded-xl border border-line bg-surface p-3 text-left text-sm font-normal shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:w-[22rem]"
        >
          {claims.map((c) => (
            <span key={c.id} className="block border-b border-line py-2 first:pt-0 last:border-0 last:pb-0">
              <span className="block text-ink">“{c.quote}”</span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-ink underline underline-offset-2">
                  {c.publisher}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <span>{TIER_LABEL[c.tier]}</span>
                <span>· {c.asOf}</span>
              </span>
              <span className={`mt-1 block text-xs ${c.status === "verified" ? "text-ok" : "text-bad"}`}>{REASON_LABEL[c.reason] ?? c.reason}</span>
            </span>
          ))}
          {vendor && <span className="mt-2 block text-xs text-warn">◆ From a company that sells this service. Treat it as an estimate.</span>}
        </span>
      )}
    </span>
  );
}
