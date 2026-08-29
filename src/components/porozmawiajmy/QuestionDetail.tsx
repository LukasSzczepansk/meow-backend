"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CatFigure } from "@/components/cats/CatFigure";
import { Icon, type IconName } from "@/components/ui/Icons";
import { BOOK_CATEGORIES } from "@/lib/content/book";

interface QuestionState {
  question: { id: string; text: string };
  myAnswer: string | null;
  addedToBook: boolean;
  partnerAnswered: boolean;
  partnerAnswer: string | null;
  bothAnswered: boolean;
  partnerNickname: string | null;
}

const BOOK_ICONS: Record<string, IconName> = {
  wspieranie: "hug",
  lubie: "heart",
  nie_lubie: "leaf",
  uspokaja: "leaf",
  stresuje: "note",
  plany: "sun",
  male_rzeczy: "paw",
};

export function QuestionDetail({ questionId }: { questionId: string }) {
  const [state, setState] = useState<QuestionState | null>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showBookPrompt, setShowBookPrompt] = useState(false);
  const [bookCategory, setBookCategory] = useState<string | null>(null);
  const [bookSaved, setBookSaved] = useState(false);

  function load() {
    fetch(`/api/questions/${questionId}`)
      .then((r) => r.json())
      .then((data) => setState(data));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  async function submit() {
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/questions/${questionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft }),
      });
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function saveToBook() {
    if (!bookCategory) return;
    await fetch(`/api/questions/${questionId}/add-to-book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: bookCategory }),
    });
    setBookSaved(true);
    setShowBookPrompt(false);
  }

  if (!state) return <div className="mx-5 h-64 animate-pulse rounded-[16px] bg-[var(--color-surface-muted)]" />;

  return (
    <div className="px-5 pb-6">
      <section className="pt-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Pytanie dla Was</p>
        <h2 className="meow-editorial-title mt-3 text-[29px] leading-[1.14] text-[var(--color-ink)]">{state.question.text}</h2>
      </section>

      {!state.myAnswer && (
        <section className="mt-8">
          <div className="flex items-center gap-2 text-[11.5px] text-[var(--color-ink-faint)]">
            <Icon name="lock" className="h-3.5 w-3.5" />
            Odpowiedź pozostanie ukryta do czasu, aż oboje odpowiecie.
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Napisz po swojemu…"
            rows={6}
            className="mt-4 w-full resize-none border-y border-[var(--color-ink)]/[0.12] bg-transparent px-0 py-4 text-[15px] leading-relaxed text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-dusty-pink)]"
          />
          <Button className="mt-5" fullWidth onClick={submit} disabled={submitting || !draft.trim()}>
            {submitting ? "Zapisujemy…" : "Zapisz odpowiedź"}
          </Button>
        </section>
      )}

      {state.myAnswer && !state.bothAnswered && (
        <section className="mt-8 text-center">
          <div className="mx-auto flex h-28 items-end justify-center"><CatFigure colorVariant="tabby" pose="sleep" size={104} /></div>
          <h3 className="mt-3 text-[16px] font-semibold text-[var(--color-ink)]">Twoja odpowiedź już czeka.</h3>
          <p className="mx-auto mt-2 max-w-[300px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">Gdy {state.partnerNickname ?? "partner"} też odpowie, zobaczycie obie odpowiedzi razem. Nic nie trzeba teraz robić.</p>
        </section>
      )}

      {state.myAnswer && state.bothAnswered && !revealed && (
        <section className="mt-8 text-center">
          <div className="flex justify-center gap-1"><CatFigure colorVariant="black" pose="sit" size={83} /><CatFigure colorVariant="ginger" pose="sit" flip size={83} /></div>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">Oboje odpowiedzieliście</p>
          <h3 className="meow-editorial-title mt-2 text-[26px] text-[var(--color-ink)]">Gotowi zobaczyć odpowiedzi?</h3>
          <Button className="mt-5" onClick={() => setRevealed(true)}>Odkryjmy je</Button>
        </section>
      )}

      <AnimatePresence>
        {revealed && state.bothAnswered && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-8">
            <AnswerBlock label="Ty" answer={state.myAnswer ?? ""} />
            <AnswerBlock label={state.partnerNickname ?? "Partner"} answer={state.partnerAnswer ?? ""} />

            {!state.addedToBook && !bookSaved && (
              <button onClick={() => setShowBookPrompt(true)} className="meow-touch mt-5 flex w-full items-center justify-between border-y border-[var(--color-ink)]/[0.09] py-4 text-left">
                <span><span className="block text-[13.5px] font-semibold text-[var(--color-ink)]">Zapamiętać moją odpowiedź?</span><span className="mt-0.5 block text-[11.5px] text-[var(--color-ink-soft)]">Może trafić do Twojej części Księgi Nas.</span></span>
                <Icon name="book" className="h-5 w-5 text-[var(--color-brown)]" />
              </button>
            )}

            {(bookSaved || state.addedToBook) && <p className="mt-5 text-center text-[12px] font-medium text-[var(--color-sage)]">Zapisane w Księdze Nas.</p>}
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBookPrompt && !bookSaved && (
          <motion.div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 px-3 pb-[max(env(safe-area-inset-bottom),12px)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBookPrompt(false)}>
            <motion.div className="w-full max-w-[454px] rounded-[18px] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]" initial={{ y: 18 }} animate={{ y: 0 }} exit={{ y: 12 }} onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto h-1 w-10 rounded-full bg-[var(--color-ink)]/10" />
              <h3 className="mt-5 text-[18px] font-semibold text-[var(--color-ink)]">Gdzie to zapisać?</h3>
              <div className="mt-4 border-y border-[var(--color-ink)]/[0.09]">
                {BOOK_CATEGORIES.map((c) => (
                  <button key={c.key} onClick={() => setBookCategory(c.key)} className={`flex min-h-[52px] w-full items-center gap-3 border-b border-[var(--color-ink)]/[0.07] text-left last:border-b-0 ${bookCategory === c.key ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"}`}>
                    <Icon name={BOOK_ICONS[c.key] ?? "book"} className={`h-4.5 w-4.5 ${bookCategory === c.key ? "text-[var(--color-dusty-pink)]" : "text-[var(--color-ink-faint)]"}`} />
                    <span className="flex-1 text-[13px] font-medium">{c.label}</span>
                    {bookCategory === c.key && <span className="h-2 w-2 rounded-full bg-[var(--color-dusty-pink)]" />}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2"><Button variant="ghost" className="flex-1" onClick={() => setShowBookPrompt(false)}>Anuluj</Button><Button className="flex-1" onClick={saveToBook} disabled={!bookCategory}>Zapisz</Button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnswerBlock({ label, answer }: { label: string; answer: string }) {
  return (
    <div className="border-t border-[var(--color-ink)]/[0.09] py-5 last:border-b">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">{label}</p>
      <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-ink)]">{answer}</p>
    </div>
  );
}
