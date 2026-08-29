"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { CALM_CHOICES, EMOTIONS, NEEDS_AFTER_FIGHT } from "@/lib/content/afterFight";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface FightEntry {
  readyState: string | null;
  calmChoice: string | null;
  emotions: string[] | null;
  difficult: string | null;
  needs: string[] | null;
  conversationMode: string | null;
  improve: string | null;
  finalThought: string | null;
}

interface SessionData {
  session: { id: string };
  myEntry: FightEntry | null;
  partnerEntry: FightEntry | null;
  myDone: boolean;
  partnerDone: boolean;
  bothDone: boolean;
  revealed: boolean;
  partnerNickname: string | null;
}

export function AfterFightFlow() {
  const [data, setData] = useState<SessionData | null>(null);
  const [step, setStep] = useState<Step>(0);
  const [readyState, setReadyState] = useState<"ready" | "pause" | null>(null);
  const [calmChoice, setCalmChoice] = useState<string | null>(null);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [difficult, setDifficult] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [conversationMode, setConversationMode] = useState<string | null>(null);
  const [improve, setImprove] = useState("");
  const [finalThought, setFinalThought] = useState("");
  const [saving, setSaving] = useState(false);

  function applyData(value: SessionData) {
    setData(value);
    if (value.myEntry) {
      setReadyState(value.myEntry.readyState === "pause" ? "pause" : value.myEntry.readyState === "ready" ? "ready" : null);
      setCalmChoice(value.myEntry.calmChoice);
      setEmotions(value.myEntry.emotions ?? []);
      setDifficult(value.myEntry.difficult ?? "");
      setNeeds(value.myEntry.needs ?? []);
      setConversationMode(value.myEntry.conversationMode);
      setImprove(value.myEntry.improve ?? "");
      setFinalThought(value.myEntry.finalThought ?? "");
    }
    if (value.myDone) setStep(7);
  }

  async function refresh() {
    const response = await fetch("/api/after-fight/current", { cache: "no-store" });
    const value = await response.json();
    applyData(value);
  }

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const id = window.setInterval(() => {
      if (data?.myDone && !data.revealed) refresh();
    }, 12_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(id);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.myDone, data?.revealed]);

  async function saveStep(field: string, value: string | string[]) {
    if (!data) return;
    setSaving(true);
    try {
      await fetch("/api/after-fight/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.session.id, field, value }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function reveal() {
    if (!data) return;
    await fetch("/api/after-fight/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: data.session.id }),
    });
    refresh();
  }

  function toggle(list: string[], value: string, setList: (next: string[]) => void) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  if (!data) return <div className="mx-5 h-64 animate-pulse bg-[var(--color-surface-muted)]/40" />;

  if (data.revealed && data.partnerEntry && data.myEntry) {
    return (
      <div className="px-5 pb-8">
        <p className="meow-editorial-title max-w-[340px] text-[29px] leading-[1.1]">Wasze odpowiedzi są obok siebie. Dalej najlepiej rozmawiać już bez ekranu.</p>
        <div className="mt-8 border-y border-[var(--color-ink)]/[0.09]">
          <Compare title="Co było trudne" mine={data.myEntry.difficult || "—"} theirs={data.partnerEntry.difficult || "—"} partner={data.partnerNickname} />
          <Compare title="Czego potrzebowaliście" mine={(data.myEntry.needs ?? []).join(", ") || "—"} theirs={(data.partnerEntry.needs ?? []).join(", ") || "—"} partner={data.partnerNickname} />
          <Compare title="Jakiej rozmowy potrzebujecie" mine={modeLabel(data.myEntry.conversationMode)} theirs={modeLabel(data.partnerEntry.conversationMode)} partner={data.partnerNickname} />
          <Compare title="Co każde może zrobić trochę lepiej" mine={data.myEntry.improve || "—"} theirs={data.partnerEntry.improve || "—"} partner={data.partnerNickname} />
          <Compare title="Jedna rzecz na koniec" mine={data.myEntry.finalThought || "—"} theirs={data.partnerEntry.finalThought || "—"} partner={data.partnerNickname} />
        </div>
        <p className="mt-6 border-l-2 border-[var(--color-sage)] pl-3 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">Nie musicie dojść do pełnej zgody od razu. Spróbujcie najpierw upewnić się, że oboje rozumiecie, co druga osoba chciała powiedzieć.</p>
      </div>
    );
  }

  if (data.myDone || step === 7) {
    return (
      <div className="px-5 pt-5 text-center">
        <p className="meow-editorial-title text-[27px] leading-tight">{data.partnerDone ? "Oboje skończyliście." : "Twoja część jest gotowa."}</p>
        <p className="mx-auto mt-3 max-w-[300px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{data.partnerDone ? "Odpowiedzi są nadal schowane. Odkryjcie je dopiero, kiedy naprawdę chcecie wrócić do rozmowy." : `Czekamy, aż ${data.partnerNickname ?? "druga osoba"} przejdzie swoją część.`}</p>
        {data.partnerDone && <Button className="mt-6" onClick={reveal}>Odkryjmy odpowiedzi</Button>}
      </div>
    );
  }

  if (readyState === "pause" && step === 0) {
    return (
      <div className="px-5 pt-4">
        <p className="meow-editorial-title max-w-[330px] text-[30px] leading-[1.1]">Nie musicie wracać do tego teraz.</p>
        <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">Przerwa nie oznacza ignorowania tematu. Możesz wrócić, kiedy emocje będą trochę niżej.</p>
        <button type="button" onClick={async () => { setReadyState("ready"); await saveStep("readyState", "ready"); setStep(1); }} className="meow-touch mt-7 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-[var(--color-brown)]"><Icon name="leaf" className="h-4 w-4" /> Jestem już gotowy/a</button>
      </div>
    );
  }

  return (
    <div className="px-5 pb-8">
      <StepLine step={step} />

      {step === 0 && (
        <Stage eyebrow="Zanim zaczniecie" title="Czy jesteś gotowy/a teraz do tego wrócić?" description="Nie chodzi o szybkie pogodzenie się. Tylko o sprawdzenie, czy masz przestrzeń na spokojniejszą rozmowę.">
          <ChoiceList options={[["ready", "Jestem gotowy/a"], ["pause", "Potrzebuję jeszcze chwili"]]} value={readyState} onPick={async (value) => { const next = value as "ready" | "pause"; setReadyState(next); await saveStep("readyState", next); if (next === "ready") setStep(1); }} />
        </Stage>
      )}

      {step === 1 && (
        <Stage eyebrow="01 · Najpierw ciało" title="Chcesz najpierw trochę zwolnić?" description="Możesz też przejść dalej od razu.">
          <ChoiceList options={CALM_CHOICES.map((item) => [item.key, item.label])} value={calmChoice} onPick={setCalmChoice} />
          {calmChoice && getCalmHref(calmChoice) && <Link href={getCalmHref(calmChoice)!} className="mt-4 inline-flex min-h-10 items-center text-[12.5px] font-semibold text-[var(--color-brown)]">Otwórz spokojną aktywność</Link>}
          <Button className="mt-5" fullWidth disabled={!calmChoice || saving} onClick={async () => { await saveStep("calmChoice", calmChoice!); setStep(2); }}>Dalej</Button>
        </Stage>
      )}

      {step === 2 && (
        <Stage eyebrow="02 · Nazwij" title="Co teraz czujesz?" description="Możesz zaznaczyć kilka rzeczy. Nie muszą idealnie opisywać wszystkiego.">
          <MultiChoice options={EMOTIONS} value={emotions} onToggle={(item) => toggle(emotions, item, setEmotions)} />
          <Button className="mt-5" fullWidth disabled={!emotions.length || saving} onClick={async () => { await saveStep("emotions", emotions); setStep(3); }}>Dalej</Button>
        </Stage>
      )}

      {step === 3 && (
        <Stage eyebrow="03 · Perspektywa" title="Co było dla Ciebie trudne?" description="Opisz swoją perspektywę bez próby zgadywania intencji drugiej osoby. Możesz też zostawić to puste.">
          <textarea value={difficult} onChange={(e) => setDifficult(e.target.value)} maxLength={800} rows={5} placeholder="Co konkretnie było trudne…" className="mt-6 w-full resize-none border-y border-[var(--color-ink)]/[0.1] bg-transparent py-4 text-[15px] leading-relaxed outline-none" />
          <Button className="mt-5" fullWidth disabled={saving} onClick={async () => { await saveStep("difficult", difficult); setStep(4); }}>Dalej</Button>
        </Stage>
      )}

      {step === 4 && (
        <Stage eyebrow="04 · Potrzeba" title="Czego najbardziej potrzebujesz?" description="Nie wybieraj tego, co druga osoba „powinna zrobić”. Pomyśl o tym, czego potrzebujesz Ty.">
          <MultiChoice options={NEEDS_AFTER_FIGHT} value={needs} onToggle={(item) => toggle(needs, item, setNeeds)} />
          <Button className="mt-5" fullWidth disabled={!needs.length || saving} onClick={async () => { await saveStep("needs", needs); setStep(5); }}>Dalej</Button>
        </Stage>
      )}

      {step === 5 && (
        <Stage eyebrow="05 · Rozmowa" title="Czego chcesz od następnej rozmowy?" description="Czasem potrzebujemy głównie zostać wysłuchani. Innym razem chcemy szukać konkretnego rozwiązania.">
          <ChoiceList options={[["listen", "Chcę przede wszystkim być wysłuchany/a"], ["solve", "Chcę poszukać rozwiązania"]]} value={conversationMode} onPick={setConversationMode} />
          <Button className="mt-5" fullWidth disabled={!conversationMode || saving} onClick={async () => { await saveStep("conversationMode", conversationMode!); setStep(6); }}>Dalej</Button>
        </Stage>
      )}

      {step === 6 && (
        <Stage eyebrow="06 · Moja część" title="Co z Twojej strony mogło wyglądać trochę inaczej?" description="Jedno konkretne zdanie wystarczy. To pytanie dotyczy tylko Twojego zachowania.">
          <textarea value={improve} onChange={(e) => setImprove(e.target.value)} maxLength={700} rows={4} placeholder="Następnym razem mogę…" className="mt-6 w-full resize-none border-y border-[var(--color-ink)]/[0.1] bg-transparent py-4 text-[15px] leading-relaxed outline-none" />
          <textarea value={finalThought} onChange={(e) => setFinalThought(e.target.value)} maxLength={300} rows={3} placeholder="Jedna rzecz, którą chcę, żebyś zrozumiał/a…" className="mt-5 w-full resize-none border-b border-[var(--color-ink)]/[0.1] bg-transparent py-4 text-[14px] leading-relaxed outline-none" />
          <Button className="mt-5" fullWidth disabled={!improve.trim() || !finalThought.trim() || saving} onClick={async () => { await saveStep("improve", improve); await saveStep("finalThought", finalThought); await refresh(); setStep(7); }}>Zakończ swoją część</Button>
        </Stage>
      )}
    </div>
  );
}

function Stage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="pt-5"><p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">{eyebrow}</p><h2 className="meow-editorial-title mt-3 max-w-[350px] text-[30px] leading-[1.1]">{title}</h2><p className="mt-3 max-w-[330px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{description}</p>{children}</section>;
}

function ChoiceList({ options, value, onPick }: { options: readonly (readonly [string, string])[]; value: string | null; onPick: (value: string) => void }) {
  return <div className="mt-6 border-y border-[var(--color-ink)]/[0.09]">{options.map(([key, label]) => <button key={key} type="button" onClick={() => onPick(key)} className="meow-touch flex min-h-[58px] w-full items-center justify-between border-b border-[var(--color-ink)]/[0.07] text-left text-[14px] last:border-b-0"><span>{label}</span><span className={`flex h-4 w-4 items-center justify-center rounded-full border ${value === key ? "border-[var(--color-sage)] bg-[var(--color-sage)]" : "border-[var(--color-ink)]/20"}`}>{value === key && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span></button>)}</div>;
}

function MultiChoice({ options, value, onToggle }: { options: readonly string[]; value: string[]; onToggle: (value: string) => void }) {
  return <div className="mt-6 flex flex-wrap gap-2">{options.map((option) => <button key={option} type="button" onClick={() => onToggle(option)} className={`meow-touch min-h-10 rounded-xl border px-3 text-[12.5px] ${value.includes(option) ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)]/55" : "border-[var(--color-ink)]/10"}`}>{option}</button>)}</div>;
}

function StepLine({ step }: { step: Step }) {
  return <div className="flex gap-1 pt-2">{[1,2,3,4,5,6].map((item) => <span key={item} className={`h-1 flex-1 rounded-full ${item <= step ? "bg-[var(--color-sage)]" : "bg-[var(--color-ink)]/10"}`} />)}</div>;
}

function Compare({ title, mine, theirs, partner }: { title: string; mine: string; theirs: string; partner: string | null }) {
  return <section className="border-b border-[var(--color-ink)]/[0.07] py-5 last:border-b-0"><h3 className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--color-ink-faint)]">{title}</h3><div className="mt-3 grid grid-cols-2 gap-5"><div><p className="text-[10.5px] font-semibold text-[var(--color-ink-faint)]">Ty</p><p className="mt-1 text-[13px] leading-relaxed">{mine}</p></div><div><p className="text-[10.5px] font-semibold text-[var(--color-ink-faint)]">{partner ?? "Druga osoba"}</p><p className="mt-1 text-[13px] leading-relaxed">{theirs}</p></div></div></section>;
}

function modeLabel(value: string | null) {
  if (value === "listen") return "Chcę przede wszystkim być wysłuchany/a";
  if (value === "solve") return "Chcę poszukać rozwiązania";
  return "—";
}

function getCalmHref(choice: string): string | null {
  const item = CALM_CHOICES.find((candidate) => candidate.key === choice);
  if (!item || !("href" in item)) return null;
  return item.href;
}
