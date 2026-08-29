"use client";

import { useState } from "react";
import Link from "next/link";
import { CalmHub } from "@/components/calm/CalmHub";
import { Icon, type IconName } from "@/components/ui/Icons";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

const COUPLE_GAMES: { href: string; title: string; description: string; meta: string; icon: IconName }[] = [
  { href: "/gry/jak-dobrze-mnie-znasz", title: "Jak dobrze mnie znasz?", description: "Jedna osoba wybiera prawdziwą odpowiedź, druga próbuje ją odgadnąć.", meta: "asynchronicznie", icon: "heart" },
  { href: "/gry/czy-sie-zgadzamy", title: "Czy się zgadzamy?", description: "Odpowiadacie osobno i dopiero później odkrywacie wspólne wybory.", meta: "2 osoby", icon: "chat" },
  { href: "/gry/ranking", title: "Ranking partnera", description: "Ułóż swoje Top 5 i zobacz, jak partner odtworzy kolejność.", meta: "jeden telefon", icon: "history" },
  { href: "/gry/kto-bardziej", title: "Kto bardziej?", description: "Drobne obserwacje o Was bez punktowania, kto ma rację.", meta: "na luzie", icon: "dice" },
  { href: "/gry/dopasowanie", title: "Zgadnij mnie", description: "Preferencje, małe zwyczaje i rzeczy, które warto o sobie wiedzieć.", meta: "poznajcie się", icon: "game" },
  { href: "/gry/jeden-telefon", title: "Razem na jednym telefonie", description: "Krótka sesja z przekazywaniem telefonu i ukrywaniem odpowiedzi.", meta: "obok siebie", icon: "hug" },
];

export function GamesHub() {
  const [tab, setTab] = useState<"together" | "solo">("together");

  return (
    <div className="pb-9 pt-4">
      <header className="mx-4 rounded-[26px] bg-[var(--color-ink)] p-5 text-[var(--color-cream)] shadow-[var(--shadow-soft)]">
        <p className="text-[9.5px] font-extrabold uppercase tracking-[0.18em] opacity-55">Gry</p>
        <h1 className="meow-editorial-title mt-2 max-w-[360px] text-[36px] leading-[1.02]">Zagrajcie dla ciekawości, nie dla wyniku.</h1>
        <p className="mt-3 max-w-[330px] text-[12.5px] leading-relaxed opacity-65">Razem możecie się trochę zaskoczyć. Dla siebie — po prostu zwolnić.</p>
      </header>

      <div className="mx-4 mt-4">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          ariaLabel="Rodzaj gier"
          options={[{ value: "together", label: "Razem" }, { value: "solo", label: "Dla mnie" }]}
        />
      </div>

      {tab === "solo" ? <CalmHub /> : <CoupleGames />}
    </div>
  );
}

function CoupleGames() {
  return (
    <div>
      <section className="mx-4 mt-4">
        <Link href="/gry/co-wybierzesz" className="meow-touch group block overflow-hidden rounded-[24px] border border-[var(--color-primary)]/20 bg-[var(--color-primary-soft)] shadow-[var(--shadow-softer)]">
          <div className="flex items-center justify-between px-5 pt-4">
            <p className="meow-eyebrow text-[var(--color-primary-strong)]">Szybki start</p>
            <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-primary-strong)]">około 2 min</span>
          </div>
          <div className="mt-4 grid grid-cols-2 divide-x divide-[var(--color-primary)]/15 border-y border-[var(--color-primary)]/15">
            <span className="meow-editorial-title grid min-h-[112px] place-items-center text-[32px] text-[var(--color-ink)]">Morze</span>
            <span className="meow-editorial-title grid min-h-[112px] place-items-center text-[32px] text-[var(--color-ink)]">Góry</span>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div><p className="text-[14px] font-extrabold text-[var(--color-ink)]">Co wybierzesz?</p><p className="mt-0.5 text-[11.5px] text-[var(--color-ink-soft)]">Szybkie wybory, bez zgodności w procentach.</p></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-strong)] text-[#fff8f7]"><Icon name="chevron" className="h-4 w-4" /></span>
          </div>
        </Link>
      </section>

      <section className="mt-7 px-4">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <div><p className="meow-eyebrow">Dla Was</p><h2 className="mt-1 text-[18px] font-extrabold text-[var(--color-ink)]">Wybierzcie sposób grania</h2></div>
          <p className="pb-0.5 text-[10.5px] text-[var(--color-ink-faint)]">bez rankingu pary</p>
        </div>
        <div className="meow-section-surface p-2">
          {COUPLE_GAMES.map((game) => (
            <Link key={game.href} href={game.href} className="meow-list-row meow-touch group">
              <span className="meow-list-icon"><Icon name={game.icon} className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3"><span className="text-[14.5px] font-bold text-[var(--color-ink)]">{game.title}</span><span className="shrink-0 text-[10px] font-medium text-[var(--color-ink-faint)]">{game.meta}</span></span>
                <span className="mt-1 block max-w-[310px] text-[12px] leading-[1.48] text-[var(--color-ink-soft)]">{game.description}</span>
              </span>
              <span className="meow-row-arrow"><Icon name="chevron" className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-7 rounded-[20px] bg-[var(--color-sage-soft)] p-4">
        <div className="flex gap-3"><span className="meow-list-icon meow-list-icon-quiet"><Icon name="hug" className="h-[18px] w-[18px]" /></span><div><p className="text-[13px] font-extrabold text-[var(--color-ink)]">Gracie obok siebie?</p><p className="mt-1 max-w-[330px] text-[12px] leading-relaxed text-[var(--color-ink-soft)]">Tryb jednego telefonu ukrywa odpowiedź pierwszej osoby przed przekazaniem urządzenia.</p></div></div>
      </section>
    </div>
  );
}
