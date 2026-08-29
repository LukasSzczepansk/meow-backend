"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icons";

type Need = "quiet" | "focus" | "slow" | "release" | "just";

type Activity = {
  href: string;
  title: string;
  description: string;
  icon: IconName;
  needs: Need[];
  meta: string;
};

const NEEDS: { key: Need; label: string }[] = [
  { key: "quiet", label: "Wyciszyć się" },
  { key: "focus", label: "Zająć myśli" },
  { key: "slow", label: "Zwolnić" },
  { key: "release", label: "Rozładować napięcie" },
  { key: "just", label: "Po prostu pobyć" },
];

const ACTIVITIES: Activity[] = [
  { href: "/gry/oddychaj", title: "Oddychaj z kotem", description: "Spokojny rytm oddechu prowadzony przez śpiącego kota.", icon: "breath", needs: ["quiet", "slow"], meta: "1–3 min" },
  { href: "/gry/krople", title: "Krople na szybie", description: "Dotykaj deszczu na szybie. Bez wyniku i bez końca, który trzeba osiągnąć.", icon: "leaf", needs: ["quiet", "just"], meta: "dowolnie" },
  { href: "/gry/klebek", title: "Rozplącz kłębek", description: "Mała logiczna czynność, która zajmuje ręce i uwagę.", icon: "yarn", needs: ["focus", "slow"], meta: "2–4 min" },
  { href: "/gry/lacz-lapki", title: "Łącz łapki", description: "Połącz pary o tych samych numerach. Spokojna łamigłówka na Phaserze.", icon: "paw", needs: ["focus", "slow"], meta: "2–4 min" },
  { href: "/gry/memory", title: "Kocie Memory", description: "Znajdź osiem par bez timera. Karty, kocie rzeczy i spokojne tempo.", icon: "game", needs: ["focus", "just"], meta: "2–5 min" },
  { href: "/gry/sciezka", title: "Ścieżka łapek", description: "Prowadź palec po miękkiej ścieżce. Nie trzeba robić tego idealnie.", icon: "paw", needs: ["slow", "focus"], meta: "1–2 min" },
  { href: "/gry/banki", title: "Bańki", description: "Powolne pękanie baniek bez combo, punktów i pośpiechu.", icon: "spark", needs: ["release", "focus"], meta: "1–3 min" },
  { href: "/gry/rytm", title: "Koci rytm", description: "Dotykaj w spokojnym rytmie i wracaj uwagą do prostego pulsu.", icon: "motion", needs: ["focus", "release"], meta: "1–2 min" },
  { href: "/gry/porzadek", title: "Mały porządek", description: "Odłóż kilka rzeczy na miejsce w spokojnym kocim pokoju.", icon: "home", needs: ["focus", "slow"], meta: "2 min" },
  { href: "/gry/herbata", title: "Zaparz herbatę", description: "Krótki interaktywny rytuał: kubek, woda, herbata i chwila pary.", icon: "coffee", needs: ["slow", "just"], meta: "2 min" },
  { href: "/gry/ukladanka", title: "Kocia układanka", description: "Dziewięć elementów spokojnej ilustracji. Bez timera.", icon: "photo", needs: ["focus", "just"], meta: "2–5 min" },
  { href: "/gry/chwila-ciszy", title: "Chwila ciszy", description: "Deszcz, noc albo spokojny pokój. Nic nie musisz robić.", icon: "moon", needs: ["quiet", "just"], meta: "dowolnie" },
];

export function CalmHub() {
  const [need, setNeed] = useState<Need>("quiet");
  const recommendations = useMemo(() => ACTIVITIES.filter((item) => item.needs.includes(need)).slice(0, 3), [need]);

  return (
    <div className="pb-10">
      <section className="mx-4 mt-4 rounded-[22px] bg-[var(--color-sage-soft)] p-5">
        <p className="meow-eyebrow">Dla mnie</p>
        <h2 className="meow-editorial-title mt-2 max-w-[340px] text-[32px] leading-[1.08] text-[var(--color-ink)]">Czego teraz potrzebujesz?</h2>
        <p className="mt-3 max-w-[345px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">Wybierz kierunek, a Meow podsunie kilka krótkich aktywności. Bez oceniania i bez obowiązku kończenia.</p>
      </section>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {NEEDS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setNeed(item.key)}
            className={`meow-touch min-h-10 shrink-0 rounded-[13px] border px-3.5 text-[12px] font-bold ${need === item.key ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[#fff8f7] shadow-sm" : "border-[var(--color-ink)]/10 bg-[var(--color-surface)] text-[var(--color-ink-soft)]"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="mt-8 px-5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Na teraz</p>
        <div className="meow-section-surface mt-3 p-2">
          {recommendations.map((activity, index) => (
            <ActivityRow key={activity.href} activity={activity} featured={index === 0} />
          ))}
        </div>
      </section>

      <section className="mt-9 px-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Wszystkie</p>
            <h3 className="meow-editorial-title mt-1 text-[23px] text-[var(--color-ink)]">Małe rzeczy na chwilę</h3>
          </div>
          <span className="pb-1 text-[11px] text-[var(--color-ink-faint)]">{ACTIVITIES.length} aktywności</span>
        </div>
        <div className="meow-section-surface mt-4 p-2">
          {ACTIVITIES.map((activity) => <ActivityRow key={activity.href} activity={activity} />)}
        </div>
      </section>
    </div>
  );
}

function ActivityRow({ activity, featured = false }: { activity: Activity; featured?: boolean }) {
  return (
    <Link href={activity.href} className="meow-touch group flex min-h-[76px] items-center gap-3 py-3.5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${featured ? "bg-[var(--color-sage-soft)] text-[var(--color-sage)]" : "bg-[var(--color-surface-muted)] text-[var(--color-ink-soft)]"}`}>
        <Icon name={activity.icon} className="h-[21px] w-[21px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-[14px] font-semibold text-[var(--color-ink)]">{activity.title}</span>
          <span className="shrink-0 text-[10.5px] text-[var(--color-ink-faint)]">{activity.meta}</span>
        </span>
        <span className="mt-1 block text-[12px] leading-[1.45] text-[var(--color-ink-soft)]">{activity.description}</span>
      </span>
      <Icon name="chevron" className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)] transition-transform group-active:translate-x-0.5" />
    </Link>
  );
}
