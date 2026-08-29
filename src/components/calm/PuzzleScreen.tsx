"use client";

import { useMemo, useState } from "react";
import { CalmExperienceShell } from "@/components/calm/CalmExperienceShell";
import { Button } from "@/components/ui/Button";
import { logCalmActivity } from "@/lib/client/calm";

const SHUFFLES = [
  [4,0,7,2,8,3,1,6,5],
  [6,2,4,8,1,7,5,0,3],
  [3,8,1,6,0,5,2,7,4],
];

export function PuzzleScreen() {
  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState<number[]>(() => [...SHUFFLES[0]]);
  const [selected, setSelected] = useState<number | null>(null);
  const solved = tiles.every((tile, index) => tile === index);
  const moves = useMemo(() => tiles.reduce((count, tile, index) => count + (tile === index ? 0 : 1), 0), [tiles]);

  function pick(index: number) {
    if (solved) return;
    if (selected === null) { setSelected(index); return; }
    if (selected === index) { setSelected(null); return; }
    const next = [...tiles]; [next[selected], next[index]] = [next[index], next[selected]]; setTiles(next); setSelected(null);
    if (next.every((tile, tileIndex) => tile === tileIndex)) void logCalmActivity("puzzle");
  }

  function newPuzzle() {
    const nextRound = (round + 1) % SHUFFLES.length; setRound(nextRound); setTiles([...SHUFFLES[nextRound]]); setSelected(null);
  }

  return (
    <CalmExperienceShell title="Kocia układanka" description="Dotknij dwóch elementów, żeby zamienić je miejscami. Bez timera i bez liczby prób.">
      <section className="px-5">
        <div className="grid aspect-square grid-cols-3 overflow-hidden rounded-[22px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)] p-1.5">
          {tiles.map((tile, index) => (
            <button key={`${tile}-${index}`} type="button" onClick={() => pick(index)} aria-label={`Element układanki ${index + 1}`} className={`meow-touch relative overflow-hidden border border-[var(--color-cream)]/80 ${selected === index ? "z-10 outline outline-2 outline-[var(--color-dusty-pink)]" : ""}`}>
              <PuzzleTile tile={tile} />
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4"><p className="text-[11.5px] text-[var(--color-ink-faint)]">{solved ? "Obraz jest znowu cały." : selected === null ? "Wybierz pierwszy element." : "Teraz wybierz drugi element."}</p>{!solved && <span className="text-[10.5px] text-[var(--color-ink-faint)]">{moves} poza miejscem</span>}</div>
        {solved && <Button fullWidth variant="secondary" className="mt-4" onClick={newPuzzle}>Nowa układanka</Button>}
      </section>
    </CalmExperienceShell>
  );
}

function PuzzleTile({ tile }: { tile: number }) {
  const row = Math.floor(tile / 3); const col = tile % 3;
  return (
    <svg viewBox={`${col * 100} ${row * 100} 100 100`} className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="300" height="300" fill="var(--color-cream-soft)" />
      <rect y="190" width="300" height="110" fill="var(--color-brown-soft)" opacity=".9" />
      <rect x="28" y="30" width="105" height="96" rx="3" fill="var(--color-sage-soft)" stroke="var(--color-ink)" strokeOpacity=".09" />
      <circle cx="101" cy="65" r="17" fill="var(--color-peach-soft)" />
      <path d="M38 120 78 80l45 40" fill="none" stroke="var(--color-sage)" strokeWidth="4" opacity=".5" />
      <rect x="72" y="176" width="160" height="69" rx="24" fill="var(--color-dusty-pink-soft)" />
      <rect x="63" y="231" width="178" height="18" rx="9" fill="var(--color-surface-muted)" />
      <g transform="translate(105 162)"><ellipse cx="0" cy="37" rx="33" ry="24" fill="#c88755"/><circle cx="0" cy="6" r="27" fill="#d79a67"/><path d="M-21-8 -25-35 -6-19M21-8 25-35 6-19" fill="#d79a67"/><circle cx="-9" cy="5" r="2.3" fill="#423a35"/><circle cx="9" cy="5" r="2.3" fill="#423a35"/><path d="M-5 15c4 3 7 3 10 0" fill="none" stroke="#423a35" strokeWidth="2" strokeLinecap="round"/></g>
      <g transform="translate(190 170)"><ellipse cx="0" cy="35" rx="30" ry="22" fill="#88847d"/><circle cx="0" cy="6" r="25" fill="#99958e"/><path d="M-19-8 -23-31 -5-18M19-8 23-31 5-18" fill="#99958e"/><circle cx="-8" cy="5" r="2.2" fill="#423a35"/><circle cx="8" cy="5" r="2.2" fill="#423a35"/></g>
      <circle cx="255" cy="78" r="26" fill="var(--color-sage-soft)"/><path d="M254 103v68" stroke="var(--color-brown)" strokeWidth="7" opacity=".55"/><ellipse cx="242" cy="100" rx="18" ry="9" fill="var(--color-sage)" opacity=".8"/><ellipse cx="270" cy="112" rx="17" ry="8" fill="var(--color-sage)" opacity=".65"/>
    </svg>
  );
}
