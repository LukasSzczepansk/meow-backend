import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icons";
import clsx from "clsx";

export function ActionTile({ href, icon, eyebrow, title, description, tone = "rose" }: { href: string; icon: IconName; eyebrow?: string; title: string; description: string; tone?: "rose" | "sage" | "sand" | "ink" }) {
  return (
    <Link href={href} className={clsx("meow-action-tile meow-touch group", `meow-action-${tone}`)}>
      <span className="meow-action-icon"><Icon name={icon} className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1">
        {eyebrow && <span className="meow-eyebrow block opacity-75">{eyebrow}</span>}
        <span className="mt-1 block text-[15px] font-extrabold tracking-[-0.015em]">{title}</span>
        <span className="mt-1 block text-[11.5px] leading-relaxed opacity-75">{description}</span>
      </span>
      <Icon name="chevron" className="h-4 w-4 shrink-0 opacity-60 transition-transform group-active:translate-x-0.5" />
    </Link>
  );
}
