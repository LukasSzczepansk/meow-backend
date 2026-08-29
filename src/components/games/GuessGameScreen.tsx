"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CatFigure } from "@/components/cats/CatFigure";
import { KNOW_ME_PROMPTS, MATCH_PROMPTS } from "@/lib/content/games";

interface Session {
  id: string;
  promptId: string;
  initiatorMemberId: string | null;
  initiatorAnswer: string | null;
  guesserMemberId: string | null;
  guesserAnswer: string | null;
  status: string;
  result: string | null;
}

interface PartnerInfo {
  memberId: string;
  nickname: string;
  cat: { colorVariant: string } | null;
}

export function GuessGameScreen({ gameType }: { gameType: "know_me" | "match" }) {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [bookStage, setBookStage] = useState<"idle" | "asked" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const catalog = gameType === "know_me" ? KNOW_ME_PROMPTS : MATCH_PROMPTS;

  function load() {
    fetch(`/api/games/${gameType}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Nie udało się wczytać gry.");
        setSession(data.session);
        setMe(data.me);
        setPartner(data.partner);
        setBookStage("idle");
        setError(null);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Nie udało się wczytać gry."));
  }

  useEffect(() => {
    load();
    const id = window.setInterval(() => {
      if (session?.status === "awaiting_guess") load();
    }, 10_000);
    return () => window.clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, session?.status]);

  const prompt = session ? catalog.find((item) => item.id === session.promptId) : null;

  async function answer(role: "initiator" | "guesser", value: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/games/${gameType}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać odpowiedzi.");
      setSession(data.session);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się zapisać odpowiedzi.");
    } finally {
      setBusy(false);
    }
  }

  async function playAgain() {
    setBusy(true);
    try {
      const response = await fetch(`/api/games/${gameType}/next`, { method: "POST" });
      const data = await response.json();
      setSession(data.session);
      setBookStage("idle");
    } finally {
      setBusy(false);
    }
  }

  async function saveToBook() {
    if (!session || !prompt?.bookCategory) return;
    const response = await fetch(`/api/games/${gameType}/add-to-book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, category: prompt.bookCategory }),
    });
    if (response.ok) setBookStage("saved");
  }

  if (error && !session) return <div className="px-5"><button onClick={load} className="border-y border-[var(--color-ink)]/[0.09] py-5 text-[13px] text-[var(--color-ink-soft)]">{error} <span className="font-semibold text-[var(--color-brown)]">Spróbuj ponownie</span></button></div>;
  if (!session || !prompt || !me) return <div className="mx-5 h-64 animate-pulse bg-[var(--color-surface-muted)]/40" />;

  const amInitiator = session.initiatorMemberId === me;

  if (session.status === "awaiting_initiator") {
    return (
      <GameQuestion eyebrow="Najpierw odpowiadasz o sobie" title={prompt.question} options={prompt.options} busy={busy} onPick={(value) => answer("initiator", value)} error={error} />
    );
  }

  if (session.status === "awaiting_guess") {
    if (amInitiator) {
      return (
        <div className="px-5 pt-4 text-center">
          <CatFigure colorVariant="gray" pose="sleep" size={108} />
          <p className="meow-editorial-title mt-4 text-[25px] leading-tight">Odpowiedź schowana.</p>
          <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">Teraz {partner?.nickname ?? "druga osoba"} próbuje odgadnąć Twój wybór.</p>
        </div>
      );
    }
    const title = "guessQuestion" in prompt && prompt.guessQuestion ? prompt.guessQuestion(partner?.nickname ?? "partner") : `Jak myślisz: ${prompt.question}`;
    return <GameQuestion eyebrow={`${partner?.nickname ?? "Druga osoba"} już wybrał/a`} title={title} options={prompt.options} busy={busy} onPick={(value) => answer("guesser", value)} error={error} />;
  }

  const same = session.result === "correct";
  const myGuess = amInitiator ? null : session.guesserAnswer;

  return (
    <div className="px-5 pt-2">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">Odkryte</p>
      <h2 className="meow-editorial-title mt-3 text-[29px] leading-[1.12]">{same ? "Tym razem trafione." : "Teraz już wiesz."}</h2>
      <div className="mt-7 border-y border-[var(--color-ink)]/[0.09]">
        {myGuess && <ResultRow label="Twój typ" value={myGuess} />}
        <ResultRow label={`Odpowiedź ${partner?.nickname ?? "drugiej osoby"}`} value={session.initiatorAnswer ?? "—"} />
      </div>
      <p className="mt-5 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{same ? "Fajnie znać takie małe rzeczy. Bez punktowania tego, kto zna kogo lepiej." : "Nie chodzi o wynik. W tej rundzie pojawiła się po prostu nowa informacja o drugiej osobie."}</p>

      {prompt.bookCategory && amInitiator && bookStage === "idle" && <button onClick={() => setBookStage("asked")} className="meow-touch mt-5 text-[12.5px] font-semibold text-[var(--color-brown)]">Zapamiętaj tę odpowiedź o mnie</button>}
      {bookStage === "asked" && <div className="mt-4 flex gap-2"><Button variant="ghost" fullWidth onClick={() => setBookStage("idle")}>Nie</Button><Button fullWidth onClick={saveToBook}>Zapisz</Button></div>}
      {bookStage === "saved" && <p className="mt-4 text-[12px] text-[var(--color-sage)]">Zapisane w Księdze Nas.</p>}
      <Button variant="secondary" onClick={playAgain} disabled={busy} className="mt-6">Następna runda</Button>
    </div>
  );
}

function GameQuestion({ eyebrow, title, options, busy, onPick, error }: { eyebrow: string; title: string; options: string[]; busy: boolean; onPick: (value: string) => void; error: string | null }) {
  return (
    <div className="px-5 pt-2">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">{eyebrow}</p>
      <h2 className="meow-editorial-title mt-3 text-[30px] leading-[1.12]">{title}</h2>
      <div className="mt-7 border-y border-[var(--color-ink)]/[0.09]">
        {options.map((option) => <button key={option} disabled={busy} onClick={() => onPick(option)} className="meow-touch flex min-h-[58px] w-full items-center justify-between border-b border-[var(--color-ink)]/[0.07] text-left text-[14px] font-medium last:border-b-0 disabled:opacity-50"><span>{option}</span><span className="h-4 w-4 rounded-full border border-[var(--color-ink)]/20" /></button>)}
      </div>
      {error && <p className="mt-3 text-[12px] text-[#9b5c52]">{error}</p>}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return <div className="flex min-h-[62px] items-center justify-between gap-4 border-b border-[var(--color-ink)]/[0.07] last:border-b-0"><span className="text-[12px] font-semibold text-[var(--color-ink-faint)]">{label}</span><span className="text-right text-[14px] font-semibold">{value}</span></div>;
}
