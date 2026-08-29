import Link from "next/link";
import { CalmHub } from "@/components/calm/CalmHub";
import { Icon } from "@/components/ui/Icons";

export default function Page() {
  return <div className="pb-4"><div className="px-5 pt-4"><Link href="/gry" className="meow-touch inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-[var(--color-ink-soft)]"><Icon name="chevron" className="h-4 w-4 rotate-180"/> Gry</Link></div><CalmHub /></div>;
}
