"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";
import { getCategory, type QuestionCategoryKey } from "@/lib/content/questions";

interface QuestionRow {
  id: string;
  text: string;
  answeredByMe: boolean;
  revealed: boolean;
}

export function QuestionList({ categoryKey }: { categoryKey: QuestionCategoryKey }) {
  const [items, setItems] = useState<QuestionRow[] | null>(null);
  const category = getCategory(categoryKey);

  useEffect(() => {
    fetch(`/api/questions/category/${categoryKey}`)
      .then((r) => r.json())
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
  }, [categoryKey]);

  if (!items) return <div className="mx-5 h-60 animate-pulse rounded-[16px] bg-[var(--color-surface-muted)]" />;

  return (
    <div className="px-5">
      <div className="border-y border-[var(--color-ink)]/[0.09]">
        {items.map((q, index) => (
          <Link key={q.id} href={`/razem/porozmawiajmy/pytanie/${q.id}`} className="meow-touch flex min-h-[78px] items-center gap-3 border-b border-[var(--color-ink)]/[0.08] py-4 last:border-b-0">
            <span className="w-6 shrink-0 text-[11px] tabular-nums text-[var(--color-ink-faint)]">{String(index + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1 text-[14px] leading-relaxed text-[var(--color-ink)]">{q.text}</span>
            {q.revealed ? <span className="shrink-0 text-[10.5px] font-semibold text-[var(--color-sage)]">odkryte</span> : q.answeredByMe ? <span className="shrink-0 text-[10.5px] font-semibold text-[var(--color-brown)]">czeka</span> : <Icon name="chevron" className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)]" />}
          </Link>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-[var(--color-ink-faint)]">{category.description}. Odpowiedzi pozostają ukryte, dopóki oboje nie odpowiecie.</p>
    </div>
  );
}
