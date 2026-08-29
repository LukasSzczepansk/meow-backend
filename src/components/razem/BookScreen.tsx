"use client";

import { useEffect, useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icons";
import { BOOK_CATEGORIES, type BookCategoryKey } from "@/lib/content/book";

interface BookEntry {
  id: string;
  aboutMemberId: string;
  category: string;
  content: string;
  visibility: "private" | "shared";
}

const ICONS: Record<string, IconName> = {
  wspieranie: "hug",
  nie_pomaga: "note",
  lubie: "heart",
  nie_lubie: "note",
  uspokaja: "leaf",
  stresuje: "clock",
  marzenia: "star",
  plany: "sun",
  wazne: "book",
  male_rzeczy: "paw",
};

export function BookScreen() {
  const [entries, setEntries] = useState<BookEntry[] | null>(null);
  const [myId, setMyId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [partnerName, setPartnerName] = useState("Druga osoba");
  const [activePerson, setActivePerson] = useState<"me" | "partner">("me");
  const [categoryFilter, setCategoryFilter] = useState<"all" | BookCategoryKey>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [category, setCategory] = useState<BookCategoryKey>("wspieranie");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"private" | "shared">("shared");
  const [busy, setBusy] = useState(false);

  function load() {
    Promise.all([fetch("/api/book", { cache: "no-store" }).then((r) => r.json()), fetch("/api/me", { cache: "no-store" }).then((r) => r.json())]).then(([book, me]) => {
      setEntries(book.entries ?? []);
      setMyId(me.member?.memberId ?? "");
      setPartnerId(me.partner?.memberId ?? "");
      setPartnerName(me.partner?.nickname ?? "Druga osoba");
    });
  }

  useEffect(load, []);

  async function add() {
    if (!content.trim()) return;
    setBusy(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, category, visibility }),
      });
      if (response.ok) {
        setContent("");
        setAddOpen(false);
        load();
      }
    } finally {
      setBusy(false);
    }
  }

  const targetId = activePerson === "me" ? myId : partnerId;
  const targetEntries = useMemo(() => entries?.filter((entry) => entry.aboutMemberId === targetId) ?? [], [entries, targetId]);
  const populatedCategories = useMemo(() => BOOK_CATEGORIES.filter((item) => targetEntries.some((entry) => entry.category === item.key)), [targetEntries]);

  if (!entries) return <div className="mx-5 h-64 animate-pulse bg-[var(--color-surface-muted)]/40" />;

  return (
    <div className="pb-8 pt-1">
      <header className="px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">Księga Nas</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h1 className="meow-editorial-title max-w-[320px] text-[35px] leading-[1.03] text-[var(--color-ink)]">Rzeczy o sobie, które łatwo zgubić w codzienności.</h1>
          {activePerson === "me" && <button onClick={() => setAddOpen(true)} className="meow-touch mb-1 grid h-10 w-10 shrink-0 place-items-center border border-[var(--color-ink)]/10 text-[var(--color-brown)]" aria-label="Zapamiętaj o mnie"><Icon name="plus" className="h-4.5 w-4.5" /></button>}
        </div>
        <p className="mt-3 max-w-[345px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">Nie profil i nie diagnoza. Prywatny notes z tym, co pomaga lepiej się rozumieć.</p>
      </header>

      <div className="mx-5 mt-7 flex gap-6 border-b border-[var(--color-ink)]/[0.09]">
        <PersonTab active={activePerson === "me"} onClick={() => { setActivePerson("me"); setCategoryFilter("all"); }}>O mnie</PersonTab>
        <PersonTab active={activePerson === "partner"} disabled={!partnerId} onClick={() => { setActivePerson("partner"); setCategoryFilter("all"); }}>{`O ${partnerName}`}</PersonTab>
      </div>

      {targetEntries.length > 0 && (
        <div className="no-scrollbar mx-5 mt-5 flex gap-4 overflow-x-auto border-b border-[var(--color-ink)]/[0.07] pb-3">
          <button onClick={() => setCategoryFilter("all")} className={`shrink-0 text-[11px] font-semibold ${categoryFilter === "all" ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}`}>Wszystko</button>
          {populatedCategories.map((item) => (
            <button key={item.key} onClick={() => setCategoryFilter(item.key)} className={`shrink-0 text-[11px] font-semibold ${categoryFilter === item.key ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}`}>{item.label}</button>
          ))}
        </div>
      )}

      {targetEntries.length === 0 ? (
        <section className="mx-5 mt-8 border-y border-[var(--color-ink)]/[0.09] py-7">
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">{activePerson === "me" ? "Zacznijcie od jednej konkretnej rzeczy." : "Nie ma jeszcze udostępnionych wpisów tej osoby."}</p>
          <p className="mt-1.5 max-w-[330px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">{activePerson === "me" ? "Na przykład: „Gdy jestem przebodźcowany, pomaga mi kilka minut ciszy.”" : "Prywatne wpisy partnera nigdy nie pojawią się tutaj."}</p>
        </section>
      ) : (
        <div className="mt-8">
          {BOOK_CATEGORIES.map((bookCategory) => {
            if (categoryFilter !== "all" && categoryFilter !== bookCategory.key) return null;
            const items = targetEntries.filter((entry) => entry.category === bookCategory.key);
            if (!items.length) return null;
            return (
              <section key={bookCategory.key} className="mb-10 px-5">
                <div className="flex items-center justify-between gap-4 border-b border-[var(--color-ink)]/[0.09] pb-2.5">
                  <div className="flex items-center gap-2.5"><Icon name={ICONS[bookCategory.key] ?? "book"} className="h-4 w-4 text-[var(--color-brown)]" /><h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{bookCategory.label}</h2></div>
                  <span className="text-[10px] text-[var(--color-ink-faint)]">{items.length}</span>
                </div>
                <div>
                  {items.map((entry, index) => (
                    <article key={entry.id} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 border-b border-[var(--color-ink)]/[0.07] py-4 last:border-b-0">
                      <span className="pt-0.5 font-[var(--font-display)] text-[18px] italic text-[var(--color-ink-faint)]">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <p className="text-[14px] leading-[1.6] text-[var(--color-ink)]">{entry.content}</p>
                        {activePerson === "me" && <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] text-[var(--color-ink-faint)]"><Icon name={entry.visibility === "private" ? "lock" : "share"} className="h-3 w-3" />{entry.visibility === "private" ? "tylko dla Ciebie" : `widoczne dla ${partnerName}`}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Zapamiętaj o mnie" description="Jedno konkretne zdanie jest lepsze niż długi opis.">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {BOOK_CATEGORIES.map((item) => <button key={item.key} onClick={() => setCategory(item.key)} className={`min-h-10 shrink-0 border-b-2 px-2 text-[12px] ${category === item.key ? "border-[var(--color-sage)] text-[var(--color-ink)]" : "border-transparent text-[var(--color-ink-faint)]"}`}>{item.label}</button>)}
        </div>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} maxLength={500} placeholder="np. Gdy jestem przytłoczony, pomaga mi kilka minut ciszy." className="mt-4 w-full resize-none border-b border-[var(--color-ink)]/15 bg-transparent py-3 text-[15px] leading-relaxed outline-none focus:border-[var(--color-dusty-pink)]" />
        <div className="mt-5 border-y border-[var(--color-ink)]/[0.09]">
          <VisibilityRow label={`Udostępnij ${partnerName}`} active={visibility === "shared"} onClick={() => setVisibility("shared")} icon="share" />
          <VisibilityRow label="Tylko dla mnie" active={visibility === "private"} onClick={() => setVisibility("private")} icon="lock" />
        </div>
        <Button onClick={add} disabled={busy || !content.trim()} fullWidth className="mt-5">{busy ? "Zapisuję…" : "Zapisz"}</Button>
      </BottomSheet>
    </div>
  );
}

function PersonTab({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: string }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`relative min-h-11 pb-2.5 text-[12.5px] font-semibold disabled:opacity-35 ${active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}`}>{children}{active && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--color-dusty-pink)]" />}</button>;
}

function VisibilityRow({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: IconName }) {
  return <button type="button" onClick={onClick} className="flex min-h-12 w-full items-center gap-3 border-b border-[var(--color-ink)]/[0.07] text-left last:border-b-0"><Icon name={icon} className="h-4 w-4 text-[var(--color-ink-faint)]" /><span className="flex-1 text-[12.5px] text-[var(--color-ink)]">{label}</span>{active && <Icon name="check" className="h-4 w-4 text-[var(--color-sage)]" />}</button>;
}
