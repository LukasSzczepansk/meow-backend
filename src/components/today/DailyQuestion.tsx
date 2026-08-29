"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";

interface DailyState {
  question: { id: string; text: string; depth: "light" | "medium" | "deep" };
  myAnswer: string | null;
  partnerAnswered: boolean;
  bothAnswered: boolean;
  partnerNickname: string | null;
}

export function DailyQuestion() {
  const [data, setData] = useState<DailyState | null>(null);
  const [error, setError] = useState(false);

  function load() {
    fetch("/api/questions/daily", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((value) => { setData(value); setError(false); })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    const id = window.setInterval(load, 12_000);
    return () => window.clearInterval(id);
  }, []);

  if (error) return <button onClick={load} className="meow-section-surface mt-6 w-full p-4 text-left text-[12px] text-[var(--color-ink-soft)]">Nie udało się sprawdzić pytania dnia. <span className="font-semibold text-[var(--color-brown)]">Spróbuj ponownie</span></button>;
  if (!data) return <div className="meow-section-surface mt-6 h-28 animate-pulse bg-[var(--color-surface-muted)]/55" />;

  const status = data.bothAnswered
    ? "Odpowiedzi są gotowe do odkrycia."
    : data.myAnswer
      ? `Twoja odpowiedź czeka na ${data.partnerNickname ?? "drugą osobę"}.`
      : data.partnerAnswered
        ? `${data.partnerNickname ?? "Partner"} już odpowiedział/a.`
        : "Jedno pytanie na dzisiaj. Bez pośpiechu.";

  return (
    <section className="meow-section-surface mt-6 overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <p className="meow-eyebrow">Pytanie na dziś</p>
        <span className="text-[10.5px] text-[var(--color-ink-faint)]">{data.question.depth === "deep" ? "szczerze" : data.question.depth === "medium" ? "bliżej" : "lekko"}</span>
      </div>
      <Link href={`/razem/porozmawiajmy/pytanie/${data.question.id}`} className="meow-touch mt-3 block rounded-[18px] bg-[var(--color-primary-soft)] p-4">
        <p className="meow-editorial-title pr-8 text-[21px] leading-[1.25] text-[var(--color-ink)]">{data.question.text}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11.5px] text-[var(--color-ink-soft)]">{status}</p>
          <Icon name="chevron" className="h-4 w-4 shrink-0 text-[var(--color-primary-strong)]" />
        </div>
      </Link>
    </section>
  );
}
