"use client";

import { useState } from "react";
import { CalmExperienceShell } from "@/components/calm/CalmExperienceShell";
import { CatFigure } from "@/components/cats/CatFigure";
import { Icon } from "@/components/ui/Icons";

type Scene = "rain" | "night" | "fire" | "balcony" | "sleep";
const SCENES: { key: Scene; label: string }[] = [
  { key: "rain", label: "Deszcz" },
  { key: "night", label: "Noc" },
  { key: "fire", label: "Lampka" },
  { key: "balcony", label: "Balkon" },
  { key: "sleep", label: "Śpiące koty" },
];

export function AmbientScreen() {
  const [scene, setScene] = useState<Scene>("rain");
  const [minimal, setMinimal] = useState(false);

  if (minimal) {
    return (
      <main className="relative min-h-[calc(100dvh-86px)] overflow-hidden bg-[var(--color-cream)]">
        <button type="button" onClick={() => setMinimal(false)} className="meow-touch absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-[var(--color-surface)]/80 text-[var(--color-ink-soft)] backdrop-blur" aria-label="Zakończ chwilę ciszy"><Icon name="close" className="h-5 w-5"/></button>
        <SceneView scene={scene} full />
      </main>
    );
  }

  return (
    <CalmExperienceShell title="Chwila ciszy" description="Wybierz scenę. Nie ma timera, wyniku ani zadania do wykonania.">
      <section className="px-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {SCENES.map((item) => <button key={item.key} type="button" onClick={() => setScene(item.key)} className={`meow-touch min-h-10 shrink-0 rounded-full border px-3.5 text-[12px] font-medium ${scene === item.key ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-cream)]" : "border-[var(--color-ink)]/10 text-[var(--color-ink-soft)]"}`}>{item.label}</button>)}
        </div>
        <div className="mt-5 overflow-hidden rounded-[24px] border border-[var(--color-ink)]/10"><SceneView scene={scene} /></div>
        <button type="button" onClick={() => setMinimal(true)} className="meow-touch mt-4 min-h-12 w-full text-[12.5px] font-semibold text-[var(--color-brown)]">Ukryj wszystko i zostań ze sceną</button>
      </section>
    </CalmExperienceShell>
  );
}

function SceneView({ scene, full = false }: { scene: Scene; full?: boolean }) {
  const dark = scene === "night" || scene === "sleep";
  return (
    <div className={`relative ${full ? "min-h-[calc(100dvh-86px)]" : "aspect-[4/5]"} overflow-hidden ${dark ? "bg-[#25282d]" : scene === "balcony" ? "bg-[#d7d4c6]" : "bg-[#cfd6d2]"}`}>
      <div className={`absolute inset-x-0 bottom-0 h-[34%] ${dark ? "bg-[#51483f]" : "bg-[#b6a793]"}`} />
      {scene !== "balcony" && <div className={`absolute left-1/2 top-[8%] h-[43%] w-[58%] -translate-x-1/2 border-[7px] ${dark ? "border-[#665e57] bg-[#3c4350]" : "border-[#e5dfd5] bg-[#acbfbd]"}`}>
        {scene === "rain" && Array.from({ length: 17 }, (_, index) => <span key={index} className="meow-ambient-rain absolute h-6 w-px rotate-[15deg] bg-white/40" style={{ left: `${8 + (index * 17) % 88}%`, top: `${(index * 23) % 72}%`, animationDelay: `${(index % 5) * .3}s` }} />)}
        {(scene === "night" || scene === "sleep") && <><span className="absolute right-[15%] top-[12%] h-8 w-8 rounded-full bg-[#e7ddbd]/90"/><span className="absolute left-[18%] top-[22%] h-1 w-1 rounded-full bg-white/60"/><span className="absolute left-[63%] top-[37%] h-1 w-1 rounded-full bg-white/45"/></>}
      </div>}
      {scene === "balcony" && <><div className="absolute inset-x-[7%] top-[10%] h-[46%] border-b-4 border-[#766e64]/50 bg-[#bfcac3]"/><div className="absolute left-[14%] top-[20%] h-28 w-16 rounded-t-full bg-[var(--color-sage)]/55"/><div className="absolute right-[16%] top-[31%] h-20 w-20 rounded-full bg-[var(--color-sage)]/45"/></>}
      {scene === "fire" && <><div className="absolute bottom-[25%] right-[12%] h-40 w-24 rounded-t-[45px] bg-[#8f765f]"/><div className="absolute bottom-[48%] right-[17%] h-24 w-14 rounded-full bg-[#dfac71]/25 blur-xl"/><div className="absolute bottom-[52%] right-[19%] h-11 w-10 rounded-full bg-[#e7b373]/75"/></>}
      <div className={`absolute ${scene === "sleep" ? "bottom-[13%] left-[27%]" : "bottom-[11%] left-1/2 -translate-x-1/2"}`}><CatFigure colorVariant="ginger" pose={scene === "sleep" || scene === "night" ? "sleep" : "sit"} size={full ? 190 : 150} animated /></div>
      {scene === "sleep" && <div className="absolute bottom-[12%] right-[23%]"><CatFigure colorVariant="gray" pose="sleep" size={full ? 170 : 135} animated /></div>}
      {!full && <p className={`absolute bottom-4 left-4 text-[10.5px] ${dark ? "text-white/55" : "text-[#625b54]/70"}`}>{SCENES.find((item) => item.key === scene)?.label.toLowerCase()}</p>}
    </div>
  );
}
