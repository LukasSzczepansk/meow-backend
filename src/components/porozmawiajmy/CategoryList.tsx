"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icons";
import type { QuestionCategoryKey } from "@/lib/content/questions";

interface CategoryRow {
  key: QuestionCategoryKey;
  label: string;
  description: string;
  total: number;
  answeredCount: number;
  revealedCount: number;
}

const ICONS: Record<QuestionCategoryKey, IconName> = {
  bliskosc: "heart",
  poznaj_mnie: "user",
  na_luzie: "spark",
  relacja: "chat",
  przyszlosc: "sun",
  dziecinstwo: "history",
  codziennosc: "coffee",
  marzenia: "star",
  hipotetyczne: "spark",
  szczerze: "hug",
};

export function CategoryList() {
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);

  useEffect(() => {
    fetch("/api/questions/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  const totalQuestions = categories?.reduce((sum, c) => sum + c.total, 0) ?? 0;
  const totalRevealed = categories?.reduce((sum, c) => sum + c.revealedCount, 0) ?? 0;

  if (!categories) return <div className="mx-5 mt-2 h-72 animate-pulse rounded-[16px] bg-[var(--color-surface-muted)]" />;

  return (
    <div className="px-5">
      <p className="mb-4 text-[11px] text-[var(--color-ink-faint)]">Odkryte razem {totalRevealed} z {totalQuestions}</p>
      <div className="border-y border-[var(--color-ink)]/[0.09]">
        {categories.map((c) => {
          const progress = (c.answeredCount / Math.max(1, c.total)) * 100;
          return (
            <Link key={c.key} href={`/razem/porozmawiajmy/${c.key}`} className="meow-touch flex min-h-[78px] items-center gap-4 border-b border-[var(--color-ink)]/[0.08] py-3.5 last:border-b-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-muted)]"><Icon name={ICONS[c.key as keyof typeof ICONS]} className="h-5 w-5 text-[var(--color-brown)]" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3"><span className="text-[14.5px] font-semibold text-[var(--color-ink)]">{c.label}</span><span className="text-[10.5px] tabular-nums text-[var(--color-ink-faint)]">{c.answeredCount}/{c.total}</span></span>
                <span className="mt-0.5 block text-[12px] text-[var(--color-ink-soft)]">{c.description}</span>
                <span className="mt-2 block h-[2px] overflow-hidden rounded-full bg-[var(--color-surface-muted)]"><span className="block h-full bg-[var(--color-sage)]" style={{ width: `${progress}%` }} /></span>
              </span>
              <Icon name="chevron" className="h-4 w-4 text-[var(--color-ink-faint)]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
