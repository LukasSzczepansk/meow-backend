import Link from "next/link";
import type { IconName } from "@/components/ui/Icons";
import { Icon } from "@/components/ui/Icons";

export function ListRow({
  href,
  icon,
  title,
  description,
  quiet = false,
  meta,
  eyebrow,
}: {
  href: string;
  icon: IconName;
  title: string;
  description?: string;
  quiet?: boolean;
  meta?: string;
  eyebrow?: string;
}) {
  return (
    <Link href={href} className="meow-list-row meow-touch group">
      <span className={`meow-list-icon ${quiet ? "meow-list-icon-quiet" : ""}`}>
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        {eyebrow && <span className="meow-eyebrow mb-1 block">{eyebrow}</span>}
        <span className="flex items-baseline gap-2">
          <span className="block text-[14.5px] font-bold text-[var(--color-ink)]">{title}</span>
          {meta && <span className="shrink-0 text-[10.5px] font-medium text-[var(--color-ink-faint)]">{meta}</span>}
        </span>
        {description && <span className="mt-1 block max-w-[315px] text-[12px] leading-[1.5] text-[var(--color-ink-soft)]">{description}</span>}
      </span>
      <span className="meow-row-arrow"><Icon name="chevron" className="h-4 w-4" /></span>
    </Link>
  );
}
