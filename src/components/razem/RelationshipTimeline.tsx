"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";

interface RelationshipEvent {
  id: string;
  title: string;
  eventDate: string;
  description: string | null;
  photoUrl: string | null;
  eventType: string;
}

const TYPES = [
  ["poznanie", "Poznaliśmy się"],
  ["pierwsza_randka", "Pierwsza randka"],
  ["para", "Zostaliśmy parą"],
  ["wyjazd", "Wspólny wyjazd"],
  ["wazny_moment", "Ważny moment"],
  ["custom", "Inne"],
] as const;

export function RelationshipTimeline() {
  const [events, setEvents] = useState<RelationshipEvent[] | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("custom");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    fetch("/api/relationship-events", { cache: "no-store" }).then((r) => r.json()).then((data) => setEvents(data.events ?? [])).catch(() => setEvents([]));
  }

  useEffect(load, []);

  async function save() {
    if (!title.trim() || !date) return;
    setBusy(true);
    try {
      const response = await fetch("/api/relationship-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, description, eventType, photoUrl }),
      });
      if (response.ok) {
        setOpen(false);
        setTitle("");
        setDate("");
        setDescription("");
        setPhotoUrl(null);
        setEventType("custom");
        load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function pickPhoto(file?: File) {
    if (!file) return;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    setPhotoUrl(canvas.toDataURL("image/jpeg", 0.72));
  }

  const grouped = useMemo(() => groupEvents(events ?? []), [events]);

  if (!events) return <div className="mx-5 mt-5 h-64 animate-pulse bg-[var(--color-surface-muted)]/40" />;

  return (
    <div className="pb-8 pt-1">
      <header className="px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">Nasza historia</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h1 className="meow-editorial-title max-w-[315px] text-[35px] leading-[1.03] text-[var(--color-ink)]">Nie wszystko trzeba pamiętać w głowie.</h1>
          <button onClick={() => setOpen(true)} className="meow-touch mb-1 grid h-10 w-10 shrink-0 place-items-center border border-[var(--color-ink)]/10 text-[var(--color-brown)]" aria-label="Dodaj wydarzenie"><Icon name="plus" className="h-4.5 w-4.5" /></button>
        </div>
        <p className="mt-3 max-w-[340px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">Ta oś nie musi być kompletna. Wystarczą momenty, do których naprawdę chcecie wracać.</p>
      </header>

      {events.length === 0 ? (
        <section className="mx-5 mt-8 border-y border-[var(--color-ink)]/[0.09] py-7">
          <p className="text-[15px] font-semibold">Pierwsza linia jest jeszcze pusta.</p>
          <p className="mt-1.5 max-w-[330px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">Możecie zacząć od dnia, w którym się poznaliście, albo od dowolnego momentu, który coś dla Was znaczy.</p>
        </section>
      ) : (
        <div className="mt-10">
          {grouped.map(([year, yearEvents], groupIndex) => (
            <section key={year} className={groupIndex ? "mt-12" : ""}>
              <div className="px-5">
                <p className="meow-editorial-title text-[30px] italic leading-none text-[var(--color-ink-faint)]">{year}</p>
              </div>
              <div className="relative mt-5 px-5 pl-[50px]">
                <div className="absolute bottom-5 left-[26px] top-1 w-px bg-[var(--color-ink)]/[0.11]" />
                {yearEvents.map((event, index) => (
                  <article key={event.id} className="relative mb-11 last:mb-0">
                    <span className="absolute -left-[30px] top-[3px] h-2.5 w-2.5 rounded-full bg-[var(--color-sage)] ring-4 ring-[var(--color-cream)]" />
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-[var(--font-display)] text-[12px] italic text-[var(--color-ink-faint)]">{formatDate(event.eventDate)}</p>
                      <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-faint)]">{labelForType(event.eventType)}</p>
                    </div>
                    <h2 className="mt-1.5 max-w-[300px] text-[18px] font-semibold leading-snug text-[var(--color-ink)]">{event.title}</h2>
                    {event.description && <p className="mt-1.5 max-w-[315px] text-[13px] leading-[1.6] text-[var(--color-ink-soft)]">{event.description}</p>}
                    {event.photoUrl && <Image src={event.photoUrl} alt="" width={900} height={675} unoptimized className={`mt-4 object-cover ${index % 2 ? "ml-5 aspect-[16/10] w-[calc(100%-20px)] rounded-[10px]" : "aspect-[4/3] w-full rounded-[12px]"}`} />}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Dopisz do Waszej historii">
        <div className="no-scrollbar flex gap-3 overflow-x-auto border-b border-[var(--color-ink)]/[0.08] pb-3">
          {TYPES.map(([key, label]) => <button key={key} onClick={() => setEventType(key)} className={`shrink-0 text-[11.5px] font-semibold ${eventType === key ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}`}>{label}</button>)}
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Co się wydarzyło?" maxLength={120} className="mt-4 w-full border-b border-[var(--color-ink)]/15 bg-transparent py-3 text-[16px] outline-none focus:border-[var(--color-dusty-pink)]" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-3 w-full border-b border-[var(--color-ink)]/15 bg-transparent py-3 text-[14px] outline-none focus:border-[var(--color-dusty-pink)]" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={800} placeholder="Krótka historia — opcjonalnie" className="mt-3 w-full resize-none border-b border-[var(--color-ink)]/15 bg-transparent py-3 text-[14px] outline-none focus:border-[var(--color-dusty-pink)]" />
        <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-between border-y border-[var(--color-ink)]/[0.09] text-[12.5px]"><span>{photoUrl ? "Zdjęcie gotowe" : "Dodaj zdjęcie"}</span><Icon name="photo" className="h-4 w-4 text-[var(--color-ink-faint)]" /><input type="file" accept="image/*" className="sr-only" onChange={(e) => pickPhoto(e.target.files?.[0])} /></label>
        <Button fullWidth className="mt-5" onClick={save} disabled={busy || !title.trim() || !date}>{busy ? "Zapisuję…" : "Dodaj do historii"}</Button>
      </BottomSheet>
    </div>
  );
}

function groupEvents(events: RelationshipEvent[]) {
  const sorted = [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const map = new Map<string, RelationshipEvent[]>();
  for (const event of sorted) {
    const year = event.eventDate.slice(0, 4) || "Inne";
    map.set(year, [...(map.get(year) ?? []), event]);
  }
  return [...map.entries()];
}

function labelForType(type: string) {
  return TYPES.find(([key]) => key === type)?.[1] ?? "Ważny moment";
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
}
