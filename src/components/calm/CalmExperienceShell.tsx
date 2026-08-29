import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icons";

export function CalmExperienceShell({
  eyebrow = "Chwila dla siebie",
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-[calc(100dvh-86px)] pb-8">
      <div className="px-5 pt-4">
        <Link href="/gry/dla-mnie" className="meow-touch inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-[var(--color-ink-soft)]">
          <Icon name="chevron" className="h-4 w-4 rotate-180" /> Wróć
        </Link>
        <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">{eyebrow}</p>
        <h1 className="meow-editorial-title mt-2 max-w-[350px] text-[32px] leading-[1.08] text-[var(--color-ink)]">{title}</h1>
        {description && <p className="mt-3 max-w-[350px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{description}</p>}
      </div>
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-5 px-5">{footer}</div>}
    </main>
  );
}
