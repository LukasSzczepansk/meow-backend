"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui/Icons";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/dzis", label: "Dziś", icon: "sun" },
  { href: "/razem", label: "Razem", icon: "heart" },
  { href: "/domek", label: "Domek", icon: "home" },
  { href: "/gry", label: "Gry", icon: "game" },
  { href: "/profil", label: "My", icon: "user" },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/gry/") && pathname !== "/gry/dla-mnie") return null;

  return (
    <nav className="meow-bottom-nav sticky bottom-0 z-30 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
      <ul className="grid grid-cols-5 gap-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const homeTab = tab.href === "/domek";
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={clsx("meow-nav-item meow-touch", active && "meow-nav-item-active", homeTab && "meow-nav-home")}
              >
                <span className="meow-nav-icon"><Icon name={tab.icon} className="h-[19px] w-[19px]" /></span>
                <span className="text-[10px] font-bold tracking-[-0.01em]">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
