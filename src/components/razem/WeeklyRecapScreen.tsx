"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/navigation/TopBar";
import { Icon, type IconName } from "@/components/ui/Icons";

interface WeekEvent { id: string; type: string; createdAt: string; }

const METRICS: { types: string[]; label: string; icon: IconName }[] = [
  { types: ["question_answered", "question_ready"], label: "wspólne pytania", icon: "chat" },
  { types: ["meow_sent"], label: "Miau", icon: "paw" },
  { types: ["memory_added"], label: "nowe wspomnienia", icon: "photo" },
  { types: ["challenge_completed", "date_selected"], label: "wspólne rzeczy", icon: "spark" },
];

export function WeeklyRecapScreen() {
  const [events, setEvents] = useState<WeekEvent[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/activity?days=7&limit=200", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        setEvents(data.events ?? []);
      })
      .catch((cause) => { if (cause?.name !== "AbortError") { setError(true); setEvents([]); } });
    return () => controller.abort();
  }, []);

  const rows = useMemo(() => METRICS.map((metric) => ({ ...metric, count: events?.filter((event) => metric.types.includes(event.type)).length ?? 0 })), [events]);

  return (
    <div className="pb-8">
      <TopBar title="Wasz tydzień" subtitle="Małe podsumowanie, bez ocen i bez porównywania relacji." backHref="/razem" />
      <section className="px-5 pt-3">
        <p className="meow-editorial-title max-w-[340px] text-[30px] leading-[1.08] text-[var(--color-ink)]">Kilka rzeczy, które wydarzyły się między Wami w Meow.</p>
        <p className="mt-3 max-w-[340px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">Nie ma tu wyniku, serii ani „lepszego tygodnia”. To tylko spokojny ślad wspólnych drobiazgów.</p>
      </section>

      <section className="mt-8 px-5">
        {events === null ? <div className="h-48 animate-pulse bg-[var(--color-surface-muted)]/45" /> : error ? <p className="border-y border-[var(--color-ink)]/10 py-5 text-[13px] text-[var(--color-ink-soft)]">Nie udało się teraz zebrać tygodnia.</p> : (
          <div className="border-y border-[var(--color-ink)]/[0.09]">
            {rows.map((row) => <div key={row.label} className="flex min-h-[68px] items-center gap-3 border-b border-[var(--color-ink)]/[0.07] last:border-b-0">
              <Icon name={row.icon} className="h-4.5 w-4.5 text-[var(--color-ink-faint)]" />
              <span className="flex-1 text-[13.5px] text-[var(--color-ink-soft)]">{row.label}</span>
              <span className="text-[18px] font-semibold tabular-nums text-[var(--color-ink)]">{row.count}</span>
            </div>)}
          </div>
        )}
      </section>

      <section className="mt-8 px-5">
        <div className="border-l-2 border-[var(--color-sage)]/60 pl-4">
          <p className="text-[12px] font-semibold text-[var(--color-ink)]">Mała rzecz tygodnia</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">Pomyślcie po jednej rzeczy, która była w tym tygodniu po prostu miła. Nie musicie jej nawet zapisywać.</p>
        </div>
      </section>
    </div>
  );
}
