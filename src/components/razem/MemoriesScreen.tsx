"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";

interface Memory {
  id: string;
  title: string;
  entryDate: string;
  note: string | null;
  photoUrl: string | null;
  favoriteCount: number;
  mineFavorite: boolean;
}

export function MemoriesScreen() {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/memories", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Nie udało się wczytać wspomnień.");
        setMemories(data.memories ?? []);
        setError(null);
      })
      .catch((cause) => { setMemories([]); setError(cause instanceof Error ? cause.message : "Nie udało się wczytać wspomnień."); });
  }

  useEffect(load, []);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, note, photoUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać wspomnienia.");
      setTitle("");
      setNote("");
      setPhotoUrl(null);
      setShowForm(false);
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się zapisać wspomnienia.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleFavorite(memoryId: string) {
    setMemories((current) => current?.map((memory) => memory.id === memoryId ? { ...memory, mineFavorite: !memory.mineFavorite, favoriteCount: memory.favoriteCount + (memory.mineFavorite ? -1 : 1) } : memory) ?? null);
    const response = await fetch("/api/memories/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memoryId }),
    });
    if (!response.ok) load();
  }

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    try {
      setPhotoUrl(await compressImage(file));
    } catch {
      setError("Nie udało się przygotować zdjęcia.");
    }
  }

  const visibleMemories = useMemo(() => {
    if (!memories) return [];
    const selected = filter === "favorites" ? memories.filter((memory) => memory.mineFavorite) : memories;
    return [...selected].sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  }, [filter, memories]);

  const groups = useMemo(() => groupByYear(visibleMemories), [visibleMemories]);

  if (!memories) return <div className="mx-5 h-64 animate-pulse bg-[var(--color-surface-muted)]/40" />;

  return (
    <div className="pb-8 pt-1">
      <header className="meow-hero mx-4 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">Wspomnienia</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h1 className="meow-editorial-title max-w-[315px] text-[35px] leading-[1.03] text-[var(--color-ink)]">Wasz album nie musi być idealny, żeby był Wasz.</h1>
          <button onClick={() => setShowForm(true)} className="meow-icon-button meow-touch mb-1 shrink-0 text-[var(--color-primary-strong)]" aria-label="Dodaj wspomnienie"><Icon name="plus" className="h-4.5 w-4.5" /></button>
        </div>
        <div className="mt-6 flex items-center justify-between rounded-[16px] bg-[var(--color-surface)] px-3">
          <div className="flex gap-5">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>Wszystkie</FilterButton>
            <FilterButton active={filter === "favorites"} onClick={() => setFilter("favorites")}>Ulubione</FilterButton>
          </div>
          <p className="pb-2.5 text-[10.5px] text-[var(--color-ink-faint)]">{visibleMemories.length} {visibleMemories.length === 1 ? "chwila" : "chwil"}</p>
        </div>
      </header>

      {error && <button onClick={load} className="mx-5 mt-4 text-left text-[12px] font-semibold text-[var(--color-danger)]">{error} Spróbuj ponownie.</button>}

      {visibleMemories.length === 0 ? (
        <section className="mx-5 mt-8 border-y border-[var(--color-ink)]/[0.09] py-7">
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">{filter === "favorites" ? "Nie masz jeszcze ulubionych wspomnień." : "Jeszcze nic tutaj nie zapisaliście."}</p>
          <p className="mt-1.5 max-w-[330px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">{filter === "favorites" ? "Serduszko przy wspomnieniu oznacza je tylko dla Ciebie. Jeśli oboje wybierzecie to samo, Meow pokaże to jako wspólne ulubione." : "Pierwszym wpisem może być zwykły spacer, leniwy wieczór albo zdjęcie, do którego chcecie wrócić."}</p>
        </section>
      ) : (
        <div className="mt-8">
          {groups.map(([year, items], groupIndex) => (
            <section key={year} className={groupIndex ? "mt-12" : ""}>
              <div className="px-5">
                <p className="meow-editorial-title text-[24px] italic text-[var(--color-ink-faint)]">{year}</p>
              </div>
              <div className="mt-4 space-y-11">
                {items.map((memory, index) => <MemoryStory key={memory.id} memory={memory} index={index} onFavorite={() => toggleFavorite(memory.id)} />)}
              </div>
            </section>
          ))}
        </div>
      )}

      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title="Dodaj wspomnienie" description="Zdjęcie jest opcjonalne. Historia jest ważniejsza niż idealny kadr.">
        <label className="block">
          <span className="text-[11px] font-semibold text-[var(--color-ink-faint)]">Zdjęcie</span>
          <span className="mt-2 flex min-h-[76px] cursor-pointer items-center justify-center border-y border-dashed border-[var(--color-ink)]/15 text-[12.5px] text-[var(--color-ink-soft)]">{photoUrl ? "Zdjęcie gotowe — wybierz inne" : "Wybierz z telefonu lub komputera"}</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(event) => pickPhoto(event.target.files?.[0])} />
        </label>
        {photoUrl && <Image src={photoUrl} alt="Podgląd" width={900} height={540} unoptimized className="mt-3 aspect-[5/3] w-full rounded-[12px] object-cover" />}
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Tytuł" className="mt-4 w-full border-b border-[var(--color-ink)]/15 bg-transparent py-3 text-[16px] outline-none focus:border-[var(--color-dusty-pink)]" />
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-3 w-full border-b border-[var(--color-ink)]/15 bg-transparent py-3 text-[14px] outline-none focus:border-[var(--color-dusty-pink)]" />
        <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={800} rows={3} placeholder="Krótka notatka — opcjonalnie" className="mt-3 w-full resize-none border-b border-[var(--color-ink)]/15 bg-transparent py-3 text-[14px] leading-relaxed outline-none focus:border-[var(--color-dusty-pink)]" />
        <Button onClick={save} disabled={saving || !title.trim()} fullWidth className="mt-5">{saving ? "Zapisuję…" : "Zapisz wspomnienie"}</Button>
      </BottomSheet>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return <button type="button" onClick={onClick} className={`relative min-h-10 pb-2.5 text-[12px] font-semibold ${active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}`}>{children}{active && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--color-dusty-pink)]" />}</button>;
}

function MemoryStory({ memory, index, onFavorite }: { memory: Memory; index: number; onFavorite: () => void }) {
  const alignment = index % 3 === 1 ? "ml-8" : index % 3 === 2 ? "mr-6" : "";
  const aspect = index % 3 === 0 ? "aspect-[5/4]" : index % 3 === 1 ? "aspect-[4/3]" : "aspect-[16/11]";
  return (
    <article className={`px-5 ${alignment}`}>
      <div className="flex items-end justify-between gap-4">
        <p className="font-[var(--font-display)] text-[12px] italic text-[var(--color-ink-faint)]">{formatDate(memory.entryDate)}</p>
        {memory.favoriteCount >= 2 && <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sage)]">wspólne ulubione</p>}
      </div>
      {memory.photoUrl ? (
        <Image src={memory.photoUrl} alt="" width={900} height={720} unoptimized className={`mt-2 w-full rounded-[10px] object-cover ${aspect}`} />
      ) : (
        <div className="mt-2 flex min-h-[130px] items-end border-y border-[var(--color-ink)]/[0.08] py-5"><Icon name="memory" className="h-6 w-6 text-[var(--color-ink-faint)]" /></div>
      )}
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_40px] items-start gap-3">
        <div className="min-w-0"><h2 className="text-[17px] font-semibold text-[var(--color-ink)]">{memory.title}</h2>{memory.note && <p className="mt-1.5 max-w-[330px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{memory.note}</p>}</div>
        <button onClick={onFavorite} className="meow-touch grid h-10 w-10 place-items-center" aria-label={memory.mineFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}><Icon name="heart" className={`h-5 w-5 ${memory.mineFavorite ? "fill-[var(--color-dusty-pink)] text-[var(--color-dusty-pink)]" : "text-[var(--color-ink-faint)]"}`} /></button>
      </div>
    </article>
  );
}

function groupByYear(memories: Memory[]) {
  const map = new Map<string, Memory[]>();
  for (const memory of memories) {
    const year = memory.entryDate.slice(0, 4) || "Inne";
    map.set(year, [...(map.get(year) ?? []), memory]);
  }
  return [...map.entries()];
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
}

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 900;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}
