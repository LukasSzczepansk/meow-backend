"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { DATE_IDEA_CATEGORIES } from "@/lib/content/dateJar";

interface DateIdea {
  id: string;
  title: string;
  note: string | null;
  category: string;
  status: "idea" | "planned" | "completed";
  createdByMemberId: string;
}

export function DateJarScreen() {
  const [ideas, setIdeas] = useState<DateIdea[] | null>(null);
  const [myId, setMyId] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [randomOpen, setRandomOpen] = useState(false);
  const [picked, setPicked] = useState<DateIdea | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("spontaniczne");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/date-ideas", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Nie udało się wczytać słoika.");
        setIdeas(data.ideas);
        setMyId(data.myMemberId);
        setError(null);
      })
      .catch((cause) => { setIdeas([]); setError(cause instanceof Error ? cause.message : "Nie udało się wczytać słoika."); });
  }

  useEffect(load, []);

  async function addIdea() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const response = await fetch("/api/date-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, note, category }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się dodać pomysłu.");
      setTitle("");
      setNote("");
      setAddOpen(false);
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się dodać pomysłu.");
    } finally {
      setBusy(false);
    }
  }

  async function draw() {
    setBusy(true);
    try {
      const response = await fetch("/api/date-ideas/random", { cache: "no-store" });
      const data = await response.json();
      setPicked(data.idea ?? null);
      setRandomOpen(true);
    } finally {
      setBusy(false);
    }
  }

  async function choose(id: string) {
    setBusy(true);
    try {
      await fetch("/api/date-ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "planned" }),
      });
      setRandomOpen(false);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!ideas) return <div className="mx-5 mt-5 h-64 animate-pulse bg-[var(--color-surface-muted)]/45" />;

  const available = ideas.filter((idea) => idea.status === "idea");
  const planned = ideas.filter((idea) => idea.status === "planned");

  return (
    <div className="pb-7">
      <section className="px-5 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">Słoik pomysłów</p>
        <p className="meow-editorial-title mt-2 max-w-[345px] text-[35px] leading-[1.03]">Na dni, kiedy macie ochotę gdzieś wyjść — albo właśnie nigdzie.</p>
        <p className="mt-3 max-w-[335px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">Każde z Was wrzuca własne pomysły. Meow tylko pomaga wyciągnąć jeden z nich.</p>

        <button type="button" onClick={draw} disabled={busy || available.length === 0} className="meow-touch group mt-8 w-full border-y border-[var(--color-ink)]/[0.09] py-5 text-left disabled:opacity-45">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">Losowanie</p>
            <Icon name="dice" className="h-4.5 w-4.5 text-[var(--color-brown)]" />
          </div>
          <div className="mt-3 flex items-end justify-between gap-5">
            <div><span className="meow-editorial-title block text-[25px] leading-tight text-[var(--color-ink)]">Nie wiemy co robić.</span><span className="mt-1.5 block text-[12px] text-[var(--color-ink-soft)]">{available.length ? `W słoiku czeka ${available.length} pomysłów.` : "Najpierw dodajcie kilka pomysłów."}</span></div>
            <Icon name="chevron" className="mb-1 h-4 w-4 shrink-0 text-[var(--color-ink-faint)] transition-transform group-active:translate-x-0.5" />
          </div>
        </button>
      </section>

      {planned.length > 0 && (
        <section className="mt-9 px-5">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Wybrane na później</p>
          <div className="mt-2 border-y border-[var(--color-ink)]/[0.09]">
            {planned.map((idea) => <IdeaRow key={idea.id} idea={idea} mine={idea.createdByMemberId === myId} />)}
          </div>
        </section>
      )}

      <section className="mt-8 px-5">
        <div className="flex items-end justify-between">
          <div><p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">W słoiku</p><p className="mt-1 text-[12px] text-[var(--color-ink-soft)]">{available.length} pomysłów</p></div>
          <button type="button" onClick={() => setAddOpen(true)} className="meow-touch inline-flex min-h-10 items-center gap-2 text-[12.5px] font-semibold text-[var(--color-brown)]"><Icon name="plus" className="h-4 w-4" /> Dodaj</button>
        </div>
        {error && <p className="mt-3 text-[12px] text-[#9c5c52]">{error}</p>}
        <div className="mt-3 border-y border-[var(--color-ink)]/[0.09]">
          {available.length === 0 ? <p className="py-5 text-[13px] text-[var(--color-ink-soft)]">Słoik jest pusty. Wrzućcie pierwszą rzecz, na którą macie ochotę.</p> : available.map((idea) => <IdeaRow key={idea.id} idea={idea} mine={idea.createdByMemberId === myId} />)}
        </div>
      </section>

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Wrzuć pomysł" description="Krótko. Resztę możecie ustalić później.">
        <label className="block text-[11px] font-semibold text-[var(--color-ink-faint)]">Pomysł</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="np. spacer i coś słodkiego" className="mt-2 w-full border-b border-[var(--color-ink)]/15 bg-transparent px-0 py-3 text-[16px] outline-none focus:border-[var(--color-dusty-pink)]" />
        <label className="mt-5 block text-[11px] font-semibold text-[var(--color-ink-faint)]">Kategoria</label>
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
          {DATE_IDEA_CATEGORIES.map((item) => <button key={item.key} type="button" onClick={() => setCategory(item.key)} className={`min-h-10 shrink-0 rounded-xl border px-3 text-[12px] ${category === item.key ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)]/55" : "border-[var(--color-ink)]/10"}`}>{item.label}</button>)}
        </div>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={300} placeholder="Drobna notatka — opcjonalnie" className="mt-4 w-full resize-none border-b border-[var(--color-ink)]/15 bg-transparent py-3 text-[14px] outline-none focus:border-[var(--color-dusty-pink)]" />
        <Button onClick={addIdea} disabled={busy || !title.trim()} fullWidth className="mt-5">{busy ? "Dodaję…" : "Wrzuć do słoika"}</Button>
      </BottomSheet>

      <BottomSheet open={randomOpen} onClose={() => setRandomOpen(false)} title="Kot wyciągnął karteczkę">
        {picked ? (
          <div className="py-2">
            <p className="meow-editorial-title text-[27px] leading-tight">{picked.title}</p>
            {picked.note && <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{picked.note}</p>}
            <div className="mt-6 flex gap-2"><Button variant="ghost" fullWidth onClick={draw} disabled={busy}>Jeszcze jeden</Button><Button fullWidth onClick={() => choose(picked.id)} disabled={busy}>Robimy to</Button></div>
          </div>
        ) : <p className="py-5 text-[13px] text-[var(--color-ink-soft)]">Nie ma jeszcze czego losować. Dodajcie kilka pomysłów.</p>}
      </BottomSheet>
    </div>
  );
}

function IdeaRow({ idea, mine }: { idea: DateIdea; mine: boolean }) {
  const label = DATE_IDEA_CATEGORIES.find((category) => category.key === idea.category)?.label ?? "Pomysł";
  return (
    <div className="border-b border-[var(--color-ink)]/[0.07] py-3.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4"><p className="text-[13.5px] font-semibold text-[var(--color-ink)]">{idea.title}</p><span className="shrink-0 text-[10.5px] text-[var(--color-ink-faint)]">{label}</span></div>
      {idea.note && <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">{idea.note}</p>}
      <p className="mt-1.5 text-[10.5px] text-[var(--color-ink-faint)]">{mine ? "dodane przez Ciebie" : "dodane przez drugą osobę"}</p>
    </div>
  );
}
