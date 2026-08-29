"use client";

import { useEffect, useState } from "react";
import { CalmExperienceShell } from "@/components/calm/CalmExperienceShell";
import { CatFigure } from "@/components/cats/CatFigure";
import { Button } from "@/components/ui/Button";
import { logCalmActivity } from "@/lib/client/calm";

const PATTERN = [0, 1, 0, 2, 0, 1, 0, 3] as const;

export function RhythmScreen() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setStep((value) => (value + 1) % PATTERN.length), 850);
    return () => window.clearInterval(id);
  }, [running]);

  function tap() { if (!running) setRunning(true); setTaps((value) => value + 1); }
  function stop() { if (running && taps > 3) void logCalmActivity("rhythm"); setRunning(false); }

  const active = PATTERN[step];

  return (
    <CalmExperienceShell title="Koci rytm" description="Obserwuj spokojny puls i dotykaj dużego koła, kiedy masz ochotę. To nie jest test refleksu.">
      <section className="px-5">
        <div className="relative overflow-hidden rounded-[24px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)] px-5 pb-8 pt-9 text-center">
          <div className="mx-auto flex w-[220px] items-center justify-center gap-3" aria-hidden="true">
            {[0,1,2,3].map((index) => <span key={index} className={`block rounded-full transition-all duration-500 ${active === index && running ? "h-3.5 w-3.5 bg-[var(--color-dusty-pink)]" : "h-2 w-2 bg-[var(--color-ink)]/15"}`} />)}
          </div>
          <button type="button" onClick={tap} aria-label="Dotknij w rytmie" className={`meow-touch mx-auto mt-10 grid h-40 w-40 place-items-center rounded-full border border-[var(--color-ink)]/10 bg-[var(--color-surface-muted)]/60 ${running ? "meow-rhythm-pulse" : ""}`}>
            <CatFigure colorVariant="ginger" pose="sit" size={102} animated={running} />
          </button>
          <p className="mt-7 text-[12px] text-[var(--color-ink-soft)]">{running ? "Nie musisz trafiać idealnie. Po prostu wracaj do pulsu." : "Dotknij kota, żeby zacząć."}</p>
        </div>
        <div className="mt-4 flex items-center justify-between"><p className="text-[11.5px] text-[var(--color-ink-faint)]">{taps > 0 ? `${taps} spokojnych dotknięć` : "Bez wyniku"}</p>{running && <Button variant="ghost" onClick={stop}>Zakończ</Button>}</div>
      </section>
    </CalmExperienceShell>
  );
}
