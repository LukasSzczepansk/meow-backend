"use client";

import { useMemo, useState } from "react";
import { CalmExperienceShell } from "@/components/calm/CalmExperienceShell";
import { CatFigure } from "@/components/cats/CatFigure";
import { Button } from "@/components/ui/Button";
import { logCalmActivity } from "@/lib/client/calm";

type ItemKey = "yarn" | "book" | "pillow" | "toy";
const ITEMS: { key: ItemKey; label: string; symbol: string; target: string }[] = [
  { key: "yarn", label: "Kłębek", symbol: "◉", target: "Koszyk" },
  { key: "book", label: "Książka", symbol: "▤", target: "Półka" },
  { key: "pillow", label: "Poduszka", symbol: "◇", target: "Kanapa" },
  { key: "toy", label: "Zabawka", symbol: "✦", target: "Pudełko" },
];

export function TidyScreen() {
  const [placed, setPlaced] = useState<Set<ItemKey>>(() => new Set());
  const [selected, setSelected] = useState<ItemKey | null>(null);
  const done = placed.size === ITEMS.length;
  const remaining = useMemo(() => ITEMS.filter((item) => !placed.has(item.key)), [placed]);

  function place(key: ItemKey) {
    if (placed.has(key)) return;
    const next = new Set(placed); next.add(key); setPlaced(next); setSelected(null);
    if (next.size === ITEMS.length) void logCalmActivity("tidy");
  }

  function reset() { setPlaced(new Set()); setSelected(null); }

  return (
    <CalmExperienceShell title="Mały porządek" description="Wybierz rzecz, potem miejsce, do którego chcesz ją odłożyć. Możesz też przeciągać wzrokiem — nie ma pośpiechu.">
      <section className="px-5">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)]">
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[var(--color-surface-muted)]/65" />
          <div className="absolute left-[8%] top-[11%] h-[25%] w-[37%] border border-[var(--color-ink)]/10 bg-[var(--color-cream-soft)]"><div className="absolute inset-x-2 top-1/2 h-px bg-[var(--color-ink)]/10" /></div>
          <div className="absolute bottom-[18%] left-[11%] h-[18%] w-[48%] rounded-[18px_18px_8px_8px] bg-[var(--color-brown-soft)]" />
          <div className="absolute bottom-[9%] right-[9%]"><CatFigure colorVariant="gray" pose={done ? "sleep" : "sit"} size={92} animated /></div>

          {remaining.map((item, index) => (
            <button key={item.key} type="button" onClick={() => setSelected(item.key)} className={`meow-touch absolute grid h-12 w-12 place-items-center rounded-[14px] border text-[21px] ${selected === item.key ? "border-[var(--color-dusty-pink)] bg-[var(--color-dusty-pink-soft)]" : "border-[var(--color-ink)]/10 bg-[var(--color-surface)]"}`} style={{ left: `${17 + (index * 23) % 66}%`, bottom: `${8 + (index % 2) * 13}%` }} aria-label={`Wybierz: ${item.label}`}>{item.symbol}</button>
          ))}

          {selected && <div className="absolute inset-x-4 top-[43%] rounded-[16px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)]/95 p-3 shadow-[var(--shadow-soft)]"><p className="text-[11px] text-[var(--color-ink-faint)]">Gdzie odkładamy {ITEMS.find((i) => i.key === selected)?.label.toLowerCase()}?</p><button type="button" onClick={() => place(selected)} className="meow-touch mt-2 min-h-11 w-full text-left text-[13px] font-semibold text-[var(--color-ink)]">{ITEMS.find((i) => i.key === selected)?.target} →</button></div>}
        </div>
        <div className="mt-4 flex items-center justify-between"><p className="text-[11.5px] text-[var(--color-ink-faint)]">{done ? "W pokoju zrobiło się spokojniej." : `${ITEMS.length - placed.size} rzeczy zostały`}</p>{placed.size > 0 && <Button variant="ghost" onClick={reset}>Od początku</Button>}</div>
      </section>
    </CalmExperienceShell>
  );
}
