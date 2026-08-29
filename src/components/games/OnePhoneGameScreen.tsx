"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

const ROUNDS = [
  ["Morze", "Góry"], ["Plan", "Spontan"], ["Film", "Serial"], ["Spacer", "Kanapa"],
  ["Śniadanie na mieście", "Kolacja na mieście"], ["Wschód słońca", "Zachód słońca"], ["Zwiedzanie", "Odpoczynek"], ["Kawa", "Herbata"],
] as const;

type Stage = "first" | "handoff" | "second" | "result";

export function OnePhoneGameScreen() {
  const [stage, setStage] = useState<Stage>("first");
  const [round, setRound] = useState(0);
  const [first, setFirst] = useState<string[]>([]);
  const [second, setSecond] = useState<string[]>([]);
  const same = useMemo(() => first.filter((value,index) => second[index] === value).length, [first,second]);

  function choose(value:string) {
    if (stage === "first") {
      const next = [...first, value]; setFirst(next);
      if (round === ROUNDS.length - 1) { setRound(0); setStage("handoff"); } else setRound((r) => r + 1);
    } else if (stage === "second") {
      const next = [...second, value]; setSecond(next);
      if (round === ROUNDS.length - 1) { setStage("result"); } else setRound((r) => r + 1);
    }
  }

  function reset() { setStage("first"); setRound(0); setFirst([]); setSecond([]); }

  return <main className="pb-9"><div className="px-5 pt-4"><Link href="/gry" className="meow-touch inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-[var(--color-ink-soft)]"><Icon name="chevron" className="h-4 w-4 rotate-180"/> Gry</Link><p className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Razem na jednym telefonie</p><h1 className="meow-editorial-title mt-2 text-[32px] leading-[1.08]">Co wybierzecie?</h1></div>
    {(stage === "first" || stage === "second") && <section className="mt-8 px-5"><div className="flex items-center justify-between"><p className="text-[11px] text-[var(--color-ink-faint)]">{stage === "first" ? "Pierwsza osoba" : "Druga osoba"}</p><p className="text-[11px] text-[var(--color-ink-faint)]">{round + 1} z {ROUNDS.length}</p></div><div className="mt-2 h-[2px] bg-[var(--color-surface-muted)]"><span className="block h-full bg-[var(--color-dusty-pink)] transition-[width]" style={{ width: `${((round + 1) / ROUNDS.length) * 100}%` }}/></div><p className="meow-editorial-title mx-auto mt-12 max-w-[330px] text-center text-[25px]">Co wybierasz?</p><div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2"><Choice value={ROUNDS[round][0]} onClick={() => choose(ROUNDS[round][0])}/><span className="grid place-items-center text-[10px] uppercase tracking-[.14em] text-[var(--color-ink-faint)]">czy</span><Choice value={ROUNDS[round][1]} onClick={() => choose(ROUNDS[round][1])}/></div><p className="mx-auto mt-6 max-w-[280px] text-center text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">Odpowiedzi pierwszej osoby pozostają ukryte do samego końca.</p></section>}
    {stage === "handoff" && <section className="px-5 pt-16 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-sage-soft)] text-[var(--color-sage)]"><Icon name="lock" className="h-7 w-7"/></div><h2 className="meow-editorial-title mt-6 text-[30px]">Przekaż telefon.</h2><p className="mx-auto mt-3 max-w-[300px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">Pierwszy zestaw odpowiedzi jest schowany. Teraz kolej drugiej osoby.</p><Button className="mt-7" onClick={() => setStage("second")}>Jestem gotowy/a</Button></section>}
    {stage === "result" && <section className="mt-8 px-5"><p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Odkryte</p><h2 className="meow-editorial-title mt-2 text-[28px]">{same} z {ROUNDS.length} wyborów było takich samych.</h2><p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">To nie jest wynik zgodności. Najciekawsze mogą być właśnie miejsca, w których wybraliście inaczej.</p><div className="mt-6 divide-y divide-[var(--color-ink)]/[0.08] border-y border-[var(--color-ink)]/[0.09]">{ROUNDS.map((choices,index) => <div key={index} className="py-3.5"><p className="text-[10.5px] text-[var(--color-ink-faint)]">{choices[0]} / {choices[1]}</p><div className="mt-1 flex items-center justify-between gap-3 text-[12px]"><span className="font-semibold">{first[index]}</span><span className="text-[var(--color-ink-faint)]">{first[index] === second[index] ? "tak samo" : "inaczej"}</span><span className="font-semibold">{second[index]}</span></div></div>)}</div><Button fullWidth variant="secondary" className="mt-6" onClick={reset}>Zagrajcie jeszcze raz</Button></section>}
  </main>;
}

function Choice({ value, onClick }: { value:string; onClick:()=>void }) { return <button type="button" onClick={onClick} className="meow-touch min-h-[160px] rounded-[22px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)] px-4 text-center text-[18px] font-semibold leading-tight text-[var(--color-ink)] shadow-[var(--shadow-softer)]">{value}</button>; }
