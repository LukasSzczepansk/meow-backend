"use client";

import { useCallback, useEffect, useState } from "react";
import { TopBar } from "@/components/navigation/TopBar";
import { Icon } from "@/components/ui/Icons";
import { getMeowType } from "@/lib/content/meows";
import { useCoupleSync } from "@/lib/client/useCoupleSync";

interface HistoryItem {
  id: string;
  type: string;
  nickname: string;
  mine: boolean;
  createdAt: string;
}

export function MeowHistoryScreen() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/meows?history=1", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.meows ?? []);
    } catch {
      setError(true);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initial);
  }, [load]);
  useCoupleSync(load, 15_000);

  return (
    <div className="pb-7">
      <TopBar title="Miau" subtitle="Małe sygnały, bez czatu i bez statusu przeczytania." backHref="/razem" />
      <section className="px-5 pt-3">
        <p className="meow-editorial-title max-w-[330px] text-[30px] leading-[1.08] text-[var(--color-ink)]">Wasze małe „jestem obok”.</p>
        <p className="mt-3 max-w-[330px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">Historia jest celowo prosta. Meow nie pokazuje online, „seen” ani czasu ostatniej aktywności.</p>
      </section>

      <section className="mt-8 px-5">
        {items === null ? (
          <div className="space-y-4" aria-label="Ładowanie historii Miau"><div className="h-12 animate-pulse bg-[var(--color-surface-muted)]"/><div className="h-12 animate-pulse bg-[var(--color-surface-muted)]"/></div>
        ) : error ? (
          <div className="border-y border-[var(--color-ink)]/[0.09] py-5"><p className="text-[13px] text-[var(--color-ink-soft)]">Nie udało się teraz sprawdzić historii.</p><button onClick={() => void load()} className="mt-2 text-[12px] font-semibold text-[var(--color-brown)]">Spróbuj ponownie</button></div>
        ) : items.length === 0 ? (
          <div className="border-y border-[var(--color-ink)]/[0.09] py-7 text-center"><Icon name="paw" className="mx-auto h-6 w-6 text-[var(--color-dusty-pink)]"/><p className="mt-3 text-[14px] font-medium text-[var(--color-ink)]">Jeszcze żadnego Miau.</p><p className="mt-1 text-[12px] text-[var(--color-ink-soft)]">Pierwszy mały sygnał możecie wysłać z ekranu Dziś.</p></div>
        ) : (
          <div className="border-y border-[var(--color-ink)]/[0.09]">
            {items.map((item) => {
              const type = getMeowType(item.type);
              const date = new Date(item.createdAt);
              return <div key={item.id} className="flex min-h-[64px] items-center gap-3 border-b border-[var(--color-ink)]/[0.07] py-3 last:border-b-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-muted)]"><Icon name="paw" className="h-4 w-4 text-[var(--color-dusty-pink)]"/></span>
                <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-medium text-[var(--color-ink)]">{type?.label ?? "Miau"}</span><span className="mt-0.5 block text-[11.5px] text-[var(--color-ink-faint)]">{item.mine ? "Ty" : item.nickname}</span></span>
                <time className="text-[10.5px] tabular-nums text-[var(--color-ink-faint)]">{date.toLocaleDateString("pl-PL", { day: "2-digit", month: "short" })} · {date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</time>
              </div>;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
