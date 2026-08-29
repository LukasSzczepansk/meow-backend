"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icons";

interface Achievement {
  key: string;
  title: string;
  description: string;
  unlocked: boolean;
}

const ICONS: Record<string, IconName> = {
  first_paw: "paw",
  good_start: "chat",
  getting_to_know: "heart",
  more_ours: "home",
  calmer: "leaf",
  playful_duo: "game",
  memory_keepers: "photo",
  first_meow: "paw",
  meow_10: "paw",
  meow_50: "heart",
  first_memory: "photo",
  first_date_idea: "calendar",
  date_ideas_10: "calendar",
  first_timeline: "history",
  timeline_5: "history",
  book_5: "book",
  book_20: "book",
  home_5: "home",
  home_15: "home",
};

export function AchievementsScreen() {
  const [items, setItems] = useState<Achievement[] | null>(null);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((data) => setItems(data.achievements));
  }, []);

  if (!items) return <div className="mx-5 h-64 animate-pulse rounded-[16px] bg-[var(--color-surface-muted)]" />;

  return (
    <div className="px-5 pb-6">
      <p className="mb-4 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">Nie są rankingiem. To tylko małe pamiątki po rzeczach, które zrobiliście razem.</p>
      <div className="border-y border-[var(--color-ink)]/[0.09]">
        {items.map((a) => (
          <div key={a.key} className={`flex min-h-[76px] items-center gap-4 border-b border-[var(--color-ink)]/[0.08] py-3.5 last:border-b-0 ${a.unlocked ? "" : "opacity-45"}`}>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${a.unlocked ? "border-[var(--color-dusty-pink)]/35 bg-[var(--color-dusty-pink-soft)]/35" : "border-[var(--color-ink)]/10"}`}>
              <Icon name={ICONS[a.key] ?? "trophy"} className="h-5 w-5 text-[var(--color-brown)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[var(--color-ink)]">{a.title}</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">{a.description}</p>
            </div>
            {a.unlocked && <span className="text-[10.5px] font-semibold text-[var(--color-sage)]">zdobyte</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
