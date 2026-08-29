"use client";

import { useRef, useState } from "react";
import { CalmExperienceShell } from "@/components/calm/CalmExperienceShell";
import { CatFigure } from "@/components/cats/CatFigure";
import { Button } from "@/components/ui/Button";
import { logCalmActivity } from "@/lib/client/calm";

const PAWS = [
  [34,178],[62,147],[83,110],[111,77],[149,70],[188,91],[214,132],[244,154],[277,131],[305,93],[335,73],[365,85],
] as const;

export function PawPathScreen() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [visited, setVisited] = useState(1);
  const [active, setActive] = useState(false);
  const done = visited >= PAWS.length;

  function move(clientX: number, clientY: number) {
    const rect = svgRef.current?.getBoundingClientRect(); if (!rect || done) return;
    const x = ((clientX - rect.left) / rect.width) * 400; const y = ((clientY - rect.top) / rect.height) * 220;
    const nextIndex = Math.min(visited, PAWS.length - 1); const [px,py] = PAWS[nextIndex];
    if (Math.hypot(px - x, py - y) < 33) {
      const next = visited + 1; setVisited(next);
      if (next >= PAWS.length) void logCalmActivity("paw_path");
    }
  }

  function reset() { setVisited(1); setActive(false); }

  return (
    <CalmExperienceShell title="Ścieżka łapek" description="Prowadź palec od łapki do łapki. Jeśli ominiesz którąś, nic się nie dzieje — możesz do niej wrócić.">
      <section className="px-5">
        <div className="overflow-hidden rounded-[24px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)] p-3">
          <svg ref={svgRef} viewBox="0 0 400 220" className="block w-full touch-none" onPointerDown={(event) => { setActive(true); event.currentTarget.setPointerCapture(event.pointerId); move(event.clientX,event.clientY); }} onPointerMove={(event) => { if (active) move(event.clientX,event.clientY); }} onPointerUp={() => setActive(false)} onPointerCancel={() => setActive(false)} aria-label="Ścieżka łapek">
            <path d="M34 178 C72 136 80 86 133 72 S204 92 226 139 S296 132 321 87 S356 72 365 85" fill="none" stroke="var(--color-surface-muted)" strokeWidth="30" strokeLinecap="round" />
            {PAWS.map(([x,y], index) => <g key={index} transform={`translate(${x} ${y})`} opacity={index < visited ? 1 : .25}><ellipse cy="3" rx="8" ry="6" fill="var(--color-dusty-pink)"/><circle cx="-7" cy="-6" r="3.4" fill="var(--color-dusty-pink)"/><circle cy="-8" r="3.4" fill="var(--color-dusty-pink)"/><circle cx="7" cy="-6" r="3.4" fill="var(--color-dusty-pink)"/></g>)}
            {done && <g transform="translate(330 95)"><CatFigure colorVariant="ginger" pose="sit" size={68} animated /></g>}
          </svg>
        </div>
        <div className="mt-4 flex items-center justify-between"><p className="text-[11.5px] text-[var(--color-ink-faint)]">{done ? "Kot przeszedł z Tobą całą ścieżkę." : `${Math.max(0, PAWS.length - visited)} łapek przed Tobą`}</p>{visited > 1 && <Button variant="ghost" onClick={reset}>Od początku</Button>}</div>
      </section>
    </CalmExperienceShell>
  );
}
