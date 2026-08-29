import Link from "next/link";

export function BackLink({ href, label = "Wstecz" }: { href: string; label?: string }) {
  return (
    <div className="px-5 pt-5">
      <Link href={href} aria-label={label} className="meow-touch inline-flex min-h-10 items-center gap-2 text-[12px] font-semibold text-[var(--color-ink-soft)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {label}
      </Link>
    </div>
  );
}
