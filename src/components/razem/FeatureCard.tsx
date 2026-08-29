import Link from "next/link";
import { Icon } from "@/components/ui/Icons";

export function FeatureCard({ href, title, description }: { href: string; emoji?: string; tint?: string; title: string; description: string }) {
  return (
    <Link href={href} className="meow-touch flex min-h-[70px] items-center gap-3 border-b border-[var(--color-ink)]/[0.08] py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1"><h3 className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</h3><p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">{description}</p></div>
      <Icon name="chevron" className="h-4 w-4 text-[var(--color-ink-faint)]" />
    </Link>
  );
}
