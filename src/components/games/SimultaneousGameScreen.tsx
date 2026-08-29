"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CatFigure } from "@/components/cats/CatFigure";
import { AGREE_PROMPTS, CHOOSE_PROMPTS, WHO_MORE_PROMPTS, type ChoicePrompt } from "@/lib/content/games";
import type { CatColorVariant } from "@/lib/content/cats";

type SimGameType = "who_more" | "agree" | "choose";

interface Session {
  id: string;
  promptId: string;
  status: string;
  responses: Record<string, string> | null;
}

interface PartnerInfo {
  memberId: string;
  nickname: string;
  cat: { colorVariant: string } | null;
}

export function SimultaneousGameScreen({ gameType }: { gameType: SimGameType }) {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [myNickname, setMyNickname] = useState("Ty");
  const [myColor, setMyColor] = useState<CatColorVariant>("ginger");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [reflection, setReflection] = useState(false);

  function load() {
    Promise.all([
      fetch(`/api/games/${gameType}`, { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/me", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([game, meData]) => {
      setSession(game.session);
      setMe(game.me);
      setPartner(game.partner);
      if (meData.member) {
        setMyNickname(meData.member.nickname);
        setMyColor((meData.member.cat?.colorVariant ?? "ginger") as CatColorVariant);
      }
      setError(null);
    }).catch(() => setError("Nie udało się wczytać rundy."));
  }

  useEffect(() => {
    load();
    const id = window.setInterval(() => {
      if (session?.status !== "completed") load();
    }, 10_000);
    return () => window.clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, session?.status]);

  const prompt = useMemo(() => {
    if (!session) return null;
    if (gameType === "who_more") return WHO_MORE_PROMPTS.find((item) => item.id === session.promptId) ?? null;
    if (gameType === "agree") return AGREE_PROMPTS.find((item) => item.id === session.promptId) ?? null;
    return CHOOSE_PROMPTS.find((item) => item.id === session.promptId) ?? null;
  }, [gameType, session]);

  const options = useMemo(() => {
    if (!me || !partner || !prompt) return [];
    if (gameType === "who_more") return [
      { label: myNickname, value: me },
      { label: partner.nickname, value: partner.memberId },
      { label: "Oboje", value: "both" },
    ];
    const choicePrompt = prompt as ChoicePrompt;
    return choicePrompt.options.map((option) => ({ label: option, value: option }));
  }, [gameType, me, partner, prompt, myNickname]);

  async function answer(value: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/games/${gameType}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
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

  async function next() {
    setBusy(true);
    try {
      const response = await fetch(`/api/games/${gameType}/next`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się przygotować kolejnej rundy.");
      setSession(data.session);
      setRound((value) => value + 1);
      setReflection(false);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się przygotować kolejnej rundy.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !session) return <RetryState message={error} onRetry={load} />;
  if (!session || !prompt || !me) return <div className="mx-5 mt-5 h-56 animate-pulse rounded-[18px] bg-[var(--color-surface-muted)]/40" />;

  const myAnswer = session.responses?.[me];
  const partnerAnswer = partner ? session.responses?.[partner.memberId] : null;

  if (session.status !== "completed") {
    if (myAnswer) return <WaitingState color={myColor} partnerName={partner?.nickname ?? "druga osoba"} round={round} />;

    return (
      <div className="px-5 pt-1">
        <GameMeta round={round} label={gameType === "choose" ? "Szybki wybór" : gameType === "who_more" ? "Wasza obserwacja" : "Odpowiedz osobno"} />
        <h2 className="meow-editorial-title mt-5 text-[31px] leading-[1.08] text-[var(--color-ink)]">{prompt.question}</h2>
        <div className="mt-8">
          {gameType === "choose" && options.length === 2 ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
              <BigChoice option={options[0]} busy={busy} onPick={answer} />
              <span className="grid place-items-center px-1 text-[10px] font-semibold uppercase tracking-[.13em] text-[var(--color-ink-faint)]">czy</span>
              <BigChoice option={options[1]} busy={busy} onPick={answer} />
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-ink)]/[0.08] border-y border-[var(--color-ink)]/[0.09]">
              {options.map((option) => (
                <button key={option.value} type="button" onClick={() => answer(option.value)} disabled={busy} className="meow-touch flex min-h-[62px] w-full items-center justify-between gap-4 py-2 text-left text-[14px] font-medium disabled:opacity-45">
                  <span>{option.label}</span><span className="h-4 w-4 shrink-0 rounded-full border border-[var(--color-ink)]/20" />
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-5 text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">Odpowiedź partnera pozostaje ukryta, dopóki oboje nie wybierzecie.</p>
        {error && <p className="mt-3 text-[12px] text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }

  const same = Boolean(myAnswer && partnerAnswer && myAnswer === partnerAnswer);
  const reflectionQuestion = gameType === "who_more"
    ? "Co sprawia, że widzisz to właśnie tak?"
    : same
      ? "Co najbardziej lubicie w tym wspólnym wyborze?"
      : "Co najbardziej przekonuje każde z Was do własnego wyboru?";

  return (
    <div className="px-5 pt-1">
      <GameMeta round={round} label="Odkryte" />
      <h2 className="meow-editorial-title mt-5 text-[28px] leading-[1.1] text-[var(--color-ink)]">{prompt.question}</h2>

      <div className="mt-7 grid grid-cols-2 gap-5 border-y border-[var(--color-ink)]/[0.09] py-5">
        <AnswerColumn name={myNickname} answer={humanize(myAnswer, me, partner, myNickname)} />
        <AnswerColumn name={partner?.nickname ?? "Druga osoba"} answer={humanize(partnerAnswer, me, partner, myNickname)} />
      </div>

      <p className="mt-5 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
        {gameType === "who_more"
          ? same ? "Wskazaliście tę samą osobę." : "Widzicie to trochę inaczej. To może być ciekawsze niż zgodna odpowiedź."
          : same ? "Tym razem wybraliście to samo." : "Dwie różne odpowiedzi. Meow nie przelicza tego na żaden wynik zgodności."}
      </p>

      {reflection ? (
        <div className="mt-6 border-l-2 border-[var(--color-sage)]/55 pl-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-[var(--color-ink-faint)]">Pogadajcie o tym</p>
          <p className="meow-editorial-title mt-2 text-[21px] leading-snug">{reflectionQuestion}</p>
        </div>
      ) : (
        <button type="button" onClick={() => setReflection(true)} className="meow-touch mt-5 min-h-11 text-[12.5px] font-semibold text-[var(--color-brown)]">Pogadajcie o tej odpowiedzi</button>
      )}

      <Button variant="secondary" onClick={next} disabled={busy} fullWidth className="mt-6">{busy ? "Chwila…" : "Następna runda"}</Button>
      {error && <p className="mt-3 text-[12px] text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}

function BigChoice({ option, busy, onPick }: { option: { label: string; value: string }; busy: boolean; onPick: (value: string) => void }) {
  return <button type="button" onClick={() => onPick(option.value)} disabled={busy} className="meow-touch min-h-[168px] rounded-[22px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)] px-4 text-center text-[18px] font-semibold leading-tight shadow-[var(--shadow-softer)] disabled:opacity-45">{option.label}</button>;
}
function GameMeta({ round, label }: { round: number; label: string }) { return <div className="flex items-center justify-between"><p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">{label}</p><p className="text-[10.5px] text-[var(--color-ink-faint)]">runda {round}</p></div>; }
function AnswerColumn({ name, answer }: { name: string; answer: string }) { return <div className="min-w-0"><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[var(--color-ink-faint)]">{name}</p><p className="mt-2 text-[14px] font-semibold leading-snug text-[var(--color-ink)]">{answer}</p></div>; }
function WaitingState({ color, partnerName, round }: { color: CatColorVariant; partnerName: string; round: number }) { return <div className="px-5 pt-9 text-center"><p className="text-[10.5px] font-semibold uppercase tracking-[.15em] text-[var(--color-ink-faint)]">Runda {round}</p><div className="mx-auto mt-7 w-fit"><CatFigure colorVariant={color} pose="sleep" size={124} animated /></div><h2 className="meow-editorial-title mt-5 text-[27px]">Odpowiedź jest schowana.</h2><p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">Czekamy na wybór: {partnerName}. Ten ekran odświeży się sam.</p></div>; }
function RetryState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="px-5 pt-6"><button type="button" onClick={onRetry} className="meow-touch w-full border-y border-[var(--color-ink)]/[0.09] py-5 text-left text-[13px] text-[var(--color-ink-soft)]">{message} <span className="font-semibold text-[var(--color-brown)]">Spróbuj ponownie</span></button></div>; }
function humanize(value: string | null | undefined, myId: string, partner: PartnerInfo | null, myName: string) { if (!value) return "—"; if (value === "both") return "Oboje"; if (value === myId) return myName; if (partner && value === partner.memberId) return partner.nickname; return value; }
