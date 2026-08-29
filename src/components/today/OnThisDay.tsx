"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";

interface Memory {
  id: string;
  title: string;
  entryDate: string;
  note: string | null;
  photoUrl: string | null;
}

export function OnThisDay() {
  const [memory, setMemory] = useState<Memory | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/memories?onThisDay=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setMemory(data.memory ?? null))
      .catch(() => setMemory(null));
  }, []);

  if (memory === undefined || memory === null) return null;

  const years = new Date().getFullYear() - Number(memory.entryDate.slice(0, 4));

  return (
    <Link href="/razem/wspomnienia" className="meow-touch mt-4 flex items-start gap-3 rounded-[18px] bg-[var(--color-peach-soft)] p-4 shadow-[var(--shadow-softer)]">
      {memory.photoUrl ? <Image src={memory.photoUrl} alt="" width={56} height={56} unoptimized className="h-14 w-14 shrink-0 rounded-[14px] object-cover" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-[var(--color-surface-muted)]"><Icon name="memory" className="h-5 w-5 text-[var(--color-brown)]" /></span>}
      <span className="min-w-0 flex-1"><span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">Tego dnia {years === 1 ? "rok" : `${years} lata`} temu</span><span className="mt-1 block text-[14px] font-semibold text-[var(--color-ink)]">{memory.title}</span>{memory.note && <span className="mt-0.5 line-clamp-1 block text-[12px] text-[var(--color-ink-soft)]">{memory.note}</span>}</span>
      <Icon name="chevron" className="mt-4 h-4 w-4 text-[var(--color-ink-faint)]" />
    </Link>
  );
}
