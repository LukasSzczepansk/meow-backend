"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

const TOPICS = [
  { id: "date", title: "Idealna randka", items: ["Spacer", "Dobre jedzenie", "Kino", "Krótki wyjazd", "Wieczór w domu"] },
  { id: "rest", title: "Najlepszy odpoczynek", items: ["Sen", "Serial", "Spacer", "Gry", "Cisza bez telefonu"] },
  { id: "trip", title: "Wyjazd we dwoje", items: ["Góry", "Morze", "Duże miasto", "Domek na odludziu", "Spontaniczna trasa"] },
  { id: "food", title: "Plan z jedzeniem", items: ["Restauracja", "Gotowanie razem", "Street food", "Śniadanie na mieście", "Zamówienie do domu"] },
] as const;

type Stage = "topic" | "mine" | "handoff" | "guess" | "result";

export function RankingGameScreen() {
  const [stage, setStage] = useState<Stage>("topic");
  const [topicId, setTopicId] = useState<string>(TOPICS[0].id);
  const topic = TOPICS.find((item) => item.id === topicId) ?? TOPICS[0];
  const [mine, setMine] = useState<string[]>([...topic.items]);
  const [guess, setGuess] = useState<string[]>([...topic.items].reverse());

  function chooseTopic(id: string) {
    const next = TOPICS.find((item) => item.id === id) ?? TOPICS[0];
    setTopicId(id); setMine([...next.items]); setGuess([...next.items].reverse()); setStage("mine");
  }

  function move(list: string[], setList: (value: string[]) => void, index: number, delta: number) {
    const target = index + delta; if (target < 0 || target >= list.length) return;
    const next = [...list]; [next[index], next[target]] = [next[target], next[index]]; setList(next);
  }

  const exact = mine.filter((item, index) => guess[index] === item).length;

  return (
    <main className="pb-9">
      <div className="px-5 pt-4">
        <Link href="/gry" className="meow-touch inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-[var(--color-ink-soft)]"><Icon name="chevron" className="h-4 w-4 rotate-180"/> Gry</Link>
        <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Jeden telefon</p>
        <h1 className="meow-editorial-title mt-2 text-[32px] leading-[1.08]">Ranking partnera</h1>
        <p className="mt-3 max-w-[350px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">Pierwsza osoba układa swoje Top 5. Potem telefon przechodzi do partnera, który próbuje odtworzyć kolejność.</p>
      </div>

      {stage === "topic" && <section className="mt-7 px-5"><p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Wybierz temat</p><div className="mt-3 divide-y divide-[var(--color-ink)]/[0.08] border-y border-[var(--color-ink)]/[0.09]">{TOPICS.map((item) => <button key={item.id} type="button" onClick={() => chooseTopic(item.id)} className="meow-touch flex min-h-[62px] w-full items-center justify-between text-left"><span className="text-[14px] font-semibold">{item.title}</span><Icon name="chevron" className="h-4 w-4 text-[var(--color-ink-faint)]"/></button>)}</div></section>}

      {stage === "mine" && <RankingStage title="Ułóż po swojemu" subtitle={topic.title} items={mine} onMove={(index, delta) => move(mine,setMine,index,delta)} action="Schowaj mój ranking" onNext={() => setStage("handoff")} />}

      {stage === "handoff" && <Handoff title="Teraz druga osoba." note="Ranking został schowany. Przekaż telefon partnerowi, a potem naciśnij przycisk poniżej." onNext={() => setStage("guess")} />}

      {stage === "guess" && <RankingStage title="Jak myślisz?" subtitle={`Spróbuj odtworzyć ranking: ${topic.title.toLowerCase()}`} items={guess} onMove={(index, delta) => move(guess,setGuess,index,delta)} action="Odkryj oba rankingi" onNext={() => setStage("result")} />}

      {stage === "result" && <section className="mt-7 px-5"><p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Odkryte</p><h2 className="meow-editorial-title mt-2 text-[27px]">{topic.title}</h2><div className="mt-6 grid grid-cols-2 gap-5"><RankResult title="Prawdziwy" items={mine}/><RankResult title="Typ partnera" items={guess}/></div><p className="mt-6 border-l-2 border-[var(--color-sage)]/55 pl-4 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">{exact === 0 ? "Żaden element nie był dokładnie w tym samym miejscu. Macie o czym pogadać." : exact === 1 ? "Jeden element trafił dokładnie w to samo miejsce." : `${exact} elementy trafiły dokładnie w te same miejsca.`}</p><div className="mt-6 flex flex-col gap-2"><Button fullWidth variant="secondary" onClick={() => setStage("topic")}>Inny temat</Button><Button fullWidth variant="ghost" onClick={() => { setGuess([...topic.items].reverse()); setStage("handoff"); }}>Jeszcze raz ten temat</Button></div></section>}
    </main>
  );
}

function RankingStage({ title, subtitle, items, onMove, action, onNext }: { title: string; subtitle: string; items: string[]; onMove: (index:number, delta:number) => void; action: string; onNext: () => void }) {
  return <section className="mt-7 px-5"><p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">{subtitle}</p><h2 className="meow-editorial-title mt-2 text-[27px]">{title}</h2><div className="mt-5 divide-y divide-[var(--color-ink)]/[0.08] border-y border-[var(--color-ink)]/[0.09]">{items.map((item,index) => <div key={item} className="flex min-h-[64px] items-center gap-3"><span className="w-5 text-center text-[11px] font-semibold text-[var(--color-ink-faint)]">{index + 1}</span><span className="min-w-0 flex-1 text-[13.5px] font-semibold">{item}</span><div className="flex gap-1"><button type="button" aria-label={`Przenieś ${item} wyżej`} disabled={index === 0} onClick={() => onMove(index,-1)} className="meow-touch grid h-11 w-10 place-items-center rounded-lg text-[var(--color-ink-soft)] disabled:opacity-20">↑</button><button type="button" aria-label={`Przenieś ${item} niżej`} disabled={index === items.length - 1} onClick={() => onMove(index,1)} className="meow-touch grid h-11 w-10 place-items-center rounded-lg text-[var(--color-ink-soft)] disabled:opacity-20">↓</button></div></div>)}</div><Button fullWidth className="mt-6" onClick={onNext}>{action}</Button></section>;
}

function Handoff({ title, note, onNext }: { title:string; note:string; onNext:()=>void }) { return <section className="px-5 pt-16 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-sage-soft)] text-[var(--color-sage)]"><Icon name="lock" className="h-7 w-7"/></div><h2 className="meow-editorial-title mt-6 text-[30px]">{title}</h2><p className="mx-auto mt-3 max-w-[300px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{note}</p><Button className="mt-7" onClick={onNext}>Mam telefon</Button></section>; }
function RankResult({ title, items }: { title:string; items:string[] }) { return <div><p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">{title}</p><ol className="mt-3 space-y-2.5">{items.map((item,index) => <li key={item} className="flex gap-2 text-[12px] leading-snug"><span className="text-[var(--color-ink-faint)]">{index + 1}.</span><span className="font-medium text-[var(--color-ink)]">{item}</span></li>)}</ol></div>; }
