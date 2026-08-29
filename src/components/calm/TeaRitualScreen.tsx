"use client";

import { useState } from "react";
import { CalmExperienceShell } from "@/components/calm/CalmExperienceShell";
import { CatFigure } from "@/components/cats/CatFigure";
import { Button } from "@/components/ui/Button";
import { logCalmActivity } from "@/lib/client/calm";

const STEPS = [
  { title: "Wybierz kubek", note: "Nie ma złego wyboru." },
  { title: "Nalej ciepłą wodę", note: "Powoli." },
  { title: "Dodaj herbatę", note: "Jeszcze chwila." },
  { title: "Poczekaj, aż zaparzy", note: "Możesz po prostu popatrzeć na parę." },
] as const;

export function TeaRitualScreen() {
  const [step, setStep] = useState(0);
  const [cup, setCup] = useState<"round" | "tall" | "small">("round");
  const done = step >= STEPS.length;

  function next() {
    const nextStep = step + 1; setStep(nextStep);
    if (nextStep === STEPS.length) void logCalmActivity("tea_ritual");
  }
  function reset() { setStep(0); }

  return (
    <CalmExperienceShell title="Zaparz herbatę" description="Krótki rytuał bez zadania do zaliczenia. Kilka spokojnych gestów i gotowe.">
      <section className="px-5">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)]">
          <div className="absolute inset-x-0 bottom-0 h-[32%] bg-[var(--color-brown-soft)]/75" />
          <div className="absolute right-[8%] top-[9%]"><CatFigure colorVariant="ginger" pose={done ? "sleep" : "sit"} size={92} animated /></div>
          {step >= 3 && !done && <div className="meow-steam absolute bottom-[41%] left-1/2 h-24 w-16 -translate-x-1/2"><span/><span/><span/></div>}
          <div className={`absolute bottom-[25%] left-1/2 -translate-x-1/2 border-2 border-[var(--color-ink)]/20 bg-[var(--color-cream-soft)] ${cup === "tall" ? "h-28 w-20 rounded-[18px_18px_12px_12px]" : cup === "small" ? "h-16 w-24 rounded-[10px_10px_20px_20px]" : "h-24 w-28 rounded-[18px_18px_28px_28px]"}`}><span className="absolute -right-6 top-[28%] h-10 w-8 rounded-r-full border-2 border-l-0 border-[var(--color-ink)]/20" />{step >= 1 && <span className="absolute inset-x-2 bottom-2 h-[55%] rounded-b-[20px] bg-[var(--color-peach)]/55" />}{step >= 2 && <span className="absolute left-1/2 top-[27%] h-9 w-px -translate-x-1/2 bg-[var(--color-brown)]/60" />}</div>
          <div className="absolute inset-x-5 top-[42%] text-center"><p className="meow-editorial-title text-[24px] text-[var(--color-ink)]">{done ? "Gotowe." : STEPS[step].title}</p><p className="mt-1 text-[11.5px] text-[var(--color-ink-soft)]">{done ? "Możesz zostać tu jeszcze chwilę." : STEPS[step].note}</p></div>
        </div>

        {step === 0 && <div className="mt-4 grid grid-cols-3 gap-2">{(["round","tall","small"] as const).map((variant, index) => <button key={variant} type="button" onClick={() => setCup(variant)} className={`meow-touch min-h-12 rounded-xl border text-[12px] font-medium ${cup === variant ? "border-[var(--color-ink)] bg-[var(--color-surface-muted)]" : "border-[var(--color-ink)]/10 text-[var(--color-ink-soft)]"}`}>{["Okrągły","Wysoki","Mały"][index]}</button>)}</div>}
        {!done ? <Button fullWidth variant="secondary" className="mt-4" onClick={next}>{step === 0 ? "Ten kubek" : step === 3 ? "Gotowe" : "Dalej"}</Button> : <Button fullWidth variant="ghost" className="mt-4" onClick={reset}>Zaparz jeszcze raz</Button>}
      </section>
    </CalmExperienceShell>
  );
}
