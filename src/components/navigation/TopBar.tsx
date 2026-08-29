import type { ReactNode } from "react";
import { BackLink } from "@/components/navigation/BackLink";

export function TopBar({ title, subtitle, right, backHref }: { title: string; subtitle?: string; right?: ReactNode; backHref?: string }) {
  return (
    <>
      {backHref && <BackLink href={backHref} />}
      <header className={`meow-topbar mx-4 flex items-start justify-between ${backHref ? "mt-1" : "mt-4"}`}>
        <div className="min-w-0 pr-4">
          <span className="meow-topbar-mark" aria-hidden="true" />
          <h1 className="meow-editorial-title text-[30px] leading-[1.03] text-[var(--color-ink)]">{title}</h1>
          {subtitle && <p className="mt-2 max-w-[325px] text-[12.5px] leading-[1.55] text-[var(--color-ink-soft)]">{subtitle}</p>}
        </div>
        {right}
      </header>
    </>
  );
}
