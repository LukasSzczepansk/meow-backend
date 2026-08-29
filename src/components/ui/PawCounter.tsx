"use client";

import clsx from "clsx";

export function PawCounter({ value, className }: { value: number; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-soft)]", className)}>
      <PawIcon className="h-4 w-4 text-[var(--color-brown)]" />
      <span key={value} className="tabular-nums">{value.toLocaleString("pl-PL")}</span>
    </span>
  );
}

function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <ellipse cx="12" cy="15.4" rx="5.2" ry="4.2" fill="currentColor" />
      <ellipse cx="6.2" cy="10" rx="2.2" ry="2.8" fill="currentColor" />
      <ellipse cx="10.2" cy="6.7" rx="2.1" ry="2.7" fill="currentColor" />
      <ellipse cx="15" cy="6.7" rx="2.1" ry="2.7" fill="currentColor" />
      <ellipse cx="18.2" cy="10.2" rx="2" ry="2.6" fill="currentColor" />
    </svg>
  );
}
