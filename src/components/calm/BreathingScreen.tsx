"use client";

import { useEffect, useRef, useState } from "react";
import { CalmExperienceShell } from "@/components/calm/CalmExperienceShell";
import { CatFigure } from "@/components/cats/CatFigure";
import { Button } from "@/components/ui/Button";
import { logCalmActivity } from "@/lib/client/calm";

type PatternKey = "slow" | "even" | "box";

type Pattern = {
  key: PatternKey;
  name: string;
  note: string;
  phases: { label: string; seconds: number; kind: "in" | "hold" | "out" }[];
};

const PATTERNS: Pattern[] = [
  { key: "slow", name: "Zwolnij", note: "Spokojny wdech i trochę dłuższy wydech.", phases: [{ label: "Wdech", seconds: 4, kind: "in" }, { label: "Wydech", seconds: 6, kind: "out" }] },
  { key: "even", name: "Równo", note: "Prosty, równy rytm bez zatrzymywania.", phases: [{ label: "Wdech", seconds: 4, kind: "in" }, { label: "Wydech", seconds: 4, kind: "out" }] },
  { key: "box", name: "Skup się", note: "Cztery spokojne części po cztery sekundy.", phases: [{ label: "Wdech", seconds: 4, kind: "in" }, { label: "Zatrzymaj", seconds: 4, kind: "hold" }, { label: "Wydech", seconds: 4, kind: "out" }, { label: "Zatrzymaj", seconds: 4, kind: "hold" }] },
];

const DURATIONS = [60, 120, 180] as const;

function getCurrentPhase(pattern: Pattern, cyclePosition: number) {
  return pattern.phases.find((item, index) => {
    const start = pattern.phases.slice(0, index).reduce((sum, phase) => sum + phase.seconds, 0);
    return cyclePosition >= start && cyclePosition < start + item.seconds;
  }) ?? pattern.phases[0];
}

export function BreathingScreen() {
  const [patternKey, setPatternKey] = useState<PatternKey>("slow");
  const [sessionDuration, setSessionDuration] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const loggedRef = useRef(false);
  const pattern = PATTERNS.find((item) => item.key === patternKey) ?? PATTERNS[0];

  useEffect(() => {
    if (sessionDuration === null || done) return;
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setDone(true);
          if (!loggedRef.current) {
            loggedRef.current = true;
            void logCalmActivity(`breathing_${patternKey}`, sessionDuration);
          }
          return 0;
        }
        return current - 1;
      });
      setElapsed((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [done, patternKey, sessionDuration]);

  const cycleLength = pattern.phases.reduce((sum, phase) => sum + phase.seconds, 0);
  const cyclePosition = elapsed % cycleLength;
  const phase = getCurrentPhase(pattern, cyclePosition);

  function start(seconds: number) {
    loggedRef.current = false;
    setElapsed(0);
    setRemaining(seconds);
    setDone(false);
    setSessionDuration(seconds);
  }

  function finish() {
    setSessionDuration(null);
    setRemaining(0);
    setElapsed(0);
    setDone(false);
    loggedRef.current = false;
  }

  if (sessionDuration === null) {
    return (
      <CalmExperienceShell title="Oddychaj z kotem" description="Wybierz rytm i czas. Nie musisz obserwować licznika — kot poprowadzi tempo.">
        <section className="px-5">
          <div className="relative overflow-hidden rounded-[22px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)] px-5 pb-5 pt-8 text-center">
            <div className="absolute left-1/2 top-7 h-28 w-28 -translate-x-1/2 rounded-full bg-[var(--color-sage-soft)]/50 blur-3xl" />
            <div className="relative mx-auto w-fit"><CatFigure colorVariant="gray" pose="sleep" size={148} animated /></div>
            <p className="mt-3 text-[11px] text-[var(--color-ink-faint)]">Nic nie trzeba robić idealnie.</p>
          </div>

          <p className="mt-7 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Rytm</p>
          <div className="mt-3 divide-y divide-[var(--color-ink)]/[0.08] border-y border-[var(--color-ink)]/[0.09]">
            {PATTERNS.map((item) => (
              <button key={item.key} type="button" onClick={() => setPatternKey(item.key)} className="meow-touch flex min-h-[67px] w-full items-center gap-3 py-3 text-left">
                <span className={`h-4 w-4 shrink-0 rounded-full border ${patternKey === item.key ? "border-[var(--color-ink)] bg-[var(--color-ink)] shadow-[inset_0_0_0_3px_var(--color-cream)]" : "border-[var(--color-ink)]/20"}`} />
                <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-semibold text-[var(--color-ink)]">{item.name}</span><span className="mt-0.5 block text-[11.5px] leading-relaxed text-[var(--color-ink-soft)]">{item.note}</span></span>
                <span className="text-[10.5px] text-[var(--color-ink-faint)]">{item.phases.map((p) => p.seconds).join(" · ")} s</span>
              </button>
            ))}
          </div>

          <p className="mt-7 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Czas</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DURATIONS.map((seconds) => <Button key={seconds} variant="outline" onClick={() => start(seconds)} className="px-2">{seconds / 60} min</Button>)}
          </div>
        </section>
      </CalmExperienceShell>
    );
  }

  if (done) {
    return (
      <CalmExperienceShell eyebrow="Koniec sesji" title="Gotowe." description="Możesz zostać jeszcze chwilę albo wrócić do Meow.">
        <div className="px-5 text-center">
          <div className="mx-auto w-fit"><CatFigure colorVariant="gray" pose="sleep" size={170} animated /></div>
          <div className="mx-auto mt-8 flex max-w-[300px] flex-col gap-2">
            <Button variant="secondary" onClick={() => start(sessionDuration)} fullWidth>Jeszcze raz</Button>
            <Button variant="ghost" onClick={finish} fullWidth>Wróć</Button>
          </div>
        </div>
      </CalmExperienceShell>
    );
  }

  const progress = Math.max(0, Math.min(100, ((sessionDuration - remaining) / sessionDuration) * 100));
  const animationDuration = `${phase.seconds}s`;

  return (
    <CalmExperienceShell eyebrow={pattern.name} title={phase.label} description="Patrz na ruch kota zamiast na zegar. Jeśli zgubisz rytm, po prostu wróć przy następnym oddechu.">
      <section className="px-5">
        <div className="relative overflow-hidden rounded-[24px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)] py-14 text-center">
          <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-sage-soft)]/45 blur-3xl" />
          <div className={`relative mx-auto w-fit ${phase.kind === "in" ? "meow-breathe-in" : phase.kind === "out" ? "meow-breathe-out" : ""}`} style={{ animationDuration }}>
            <CatFigure colorVariant="gray" pose="sleep" size={190} animated={false} />
          </div>
          <p className="relative mt-7 text-[12px] text-[var(--color-ink-faint)]">{remaining}s</p>
        </div>
        <div className="mt-5 h-[2px] overflow-hidden rounded-full bg-[var(--color-surface-muted)]"><span className="block h-full bg-[var(--color-sage)] transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} /></div>
        <Button variant="ghost" fullWidth className="mt-4" onClick={finish}>Zakończ wcześniej</Button>
      </section>
    </CalmExperienceShell>
  );
}
