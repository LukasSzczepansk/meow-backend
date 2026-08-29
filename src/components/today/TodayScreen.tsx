"use client";

import { useEffect, useState } from "react";
import { RoomScene, type CatVisual } from "@/components/today/RoomScene";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DailyQuestion } from "@/components/today/DailyQuestion";
import { OnThisDay } from "@/components/today/OnThisDay";
import { Icon, type IconName } from "@/components/ui/Icons";
import { MOOD_OPTIONS, NEED_OPTIONS } from "@/lib/content/checkins";
import { MEOW_TYPES, getMeowType } from "@/lib/content/meows";
import type { RoomType } from "@/lib/content/shop";
import { useRouter } from "next/navigation";

interface TodayScreenProps {
  nickname: string;
  pawPoints: number;
  roomType: RoomType;
  me: CatVisual;
  partner: CatVisual | null;
  coupleComplete: boolean;
  inviteCode: string;
  partnerNickname: string | null;
}

interface CheckinState {
  mood: string | null;
  need: string | null;
  visibility: string;
}

interface LatestMeow {
  id: string;
  type: string;
  nickname: string;
  createdAt: string;
}

const NEED_ICONS: Record<string, IconName> = {
  closeness: "heart",
  support: "hug",
  talk: "chat",
  calm: "leaf",
  fun: "spark",
  space: "home",
};

const MEOW_ICONS: Record<string, IconName> = {
  thinking: "paw",
  love: "heart",
  miss: "heart",
  hug: "hug",
  together: "coffee",
  morning: "sun",
  night: "clock",
  here: "leaf",
  understand: "check",
  meow: "cat",
};

export function TodayScreen({ nickname, pawPoints, roomType, me, partner, coupleComplete, inviteCode, partnerNickname }: TodayScreenProps) {
  const router = useRouter();
  const [checkin, setCheckin] = useState<CheckinState>({ mood: null, need: null, visibility: "private" });
  const [partnerShared, setPartnerShared] = useState<{ mood: string | null; need: string | null; nickname: string } | null>(null);
  const [latestMeow, setLatestMeow] = useState<LatestMeow | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [meowStatus, setMeowStatus] = useState<string | null>(null);
  const [sendingMeow, setSendingMeow] = useState(false);
  const [meowOpen, setMeowOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState(true);
  const [currentHour, setCurrentHour] = useState(12);

  useEffect(() => {
    let active = true;

    async function loadCheckin(initial = false) {
      try {
        const res = await fetch("/api/checkins/today", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        if (initial && data.mine) {
          setCheckin({ mood: data.mine.mood, need: data.mine.need, visibility: data.mine.visibility });
          if (data.mine.mood || data.mine.need) setEditingCheckin(false);
        }
        setPartnerShared(data.partnerShared ?? null);
      } catch {}
    }

    async function loadMeow() {
      if (!coupleComplete) return;
      try {
        const res = await fetch("/api/meows", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (active) setLatestMeow(data.latest ?? null);
      } catch {}
    }

    const hourTimer = window.setTimeout(() => setCurrentHour(new Date().getHours()), 0);
    void loadCheckin(true);
    void loadMeow();
    const interval = window.setInterval(() => {
      void loadCheckin(false);
      void loadMeow();
    }, 15_000);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.clearTimeout(hourTimer);
    };
  }, [coupleComplete]);

  async function updateCheckin(patch: Partial<CheckinState>) {
    const previous = checkin;
    const next = { ...checkin, ...patch };
    setCheckin(next);
    setSaving(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/checkins/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Nie udało się zapisać check-inu.");
    } catch (error) {
      setCheckin(previous);
      setSyncError(error instanceof Error ? error.message : "Nie udało się zapisać. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  }

  async function sendMeow(type: string) {
    if (sendingMeow) return;
    setSendingMeow(true);
    setMeowStatus(null);
    try {
      const res = await fetch("/api/meows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Miau nie dotarło.");
      const selected = getMeowType(type);
      setMeowOpen(false);
      setMeowStatus(`${selected?.label ?? "Miau"} — wysłane do ${partnerNickname ?? "partnera"}.`);
      window.setTimeout(() => setMeowStatus(null), 2600);
    } catch (error) {
      setMeowStatus(error instanceof Error ? error.message : "Nie udało się wysłać Miau.");
    } finally {
      setSendingMeow(false);
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(inviteCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const latestMeowType = latestMeow ? getMeowType(latestMeow.type) : null;

  return (
    <div className="pb-8 pt-4">
      <header className="meow-hero mx-4 flex items-start justify-between gap-5 p-5">
        <div>
          <p className="meow-eyebrow">Dzisiaj</p>
          <h1 className="meow-editorial-title mt-1.5 max-w-[330px] text-[34px] leading-[1.02] text-[var(--color-ink)]">{greetingForHour(currentHour)}, {nickname}</h1>
          <p className="mt-2 max-w-[300px] text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">{catMoment(me.name, me.personality, currentHour)}</p>
        </div>
        <span className="mt-1 shrink-0 rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-[10.5px] font-bold text-[var(--color-primary-strong)] shadow-[var(--shadow-softer)]">{pawPoints.toLocaleString("pl-PL")} łapek</span>
      </header>

      {!coupleComplete && (
        <section className="mx-5 mb-5 border-y border-[var(--color-ink)]/[0.09] py-4">
          <p className="text-[14px] font-semibold text-[var(--color-ink)]">Zaproś drugą osobę do Waszej przestrzeni</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">Kod jest jednorazowym wejściem do wspólnego Meow.</p>
          <button onClick={copyCode} className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold tracking-[0.08em] text-[var(--color-brown)]">
            {copied ? "Skopiowano" : inviteCode}<Icon name="share" className="h-4 w-4" />
          </button>
        </section>
      )}

      <section className="mx-4 mt-4 rounded-[24px] bg-[var(--color-surface)] p-2.5 shadow-[var(--shadow-softer)]">
        <RoomScene roomType={roomType} me={me} partner={partner} reactionType={latestMeow?.type ?? null} reactionCreatedAt={latestMeow?.createdAt ?? null} />

        {(partnerShared || (latestMeow && latestMeowType)) && (
          <div className="meow-status-banner mt-3">
            {partnerShared && (
              <>
                <p className="text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]"><span className="font-semibold text-[var(--color-ink)]">{partnerShared.nickname}</span> {describePartnerStatus(partnerShared.mood, partnerShared.need)}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  <button type="button" onClick={() => sendMeow("here")} className="rounded-xl bg-[var(--color-surface)] px-3 py-2 text-[11.5px] font-bold text-[var(--color-sage)] shadow-sm">Jestem obok</button>
                  <button type="button" onClick={() => sendMeow("understand")} className="rounded-xl bg-[var(--color-surface)] px-3 py-2 text-[11.5px] font-bold text-[var(--color-sage)] shadow-sm">Rozumiem</button>
                  <button type="button" onClick={() => sendMeow("hug")} className="rounded-xl bg-[var(--color-surface)] px-3 py-2 text-[11.5px] font-bold text-[var(--color-primary-strong)] shadow-sm">Przytulas?</button>
                </div>
              </>
            )}
            {latestMeow && latestMeowType && <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-faint)]">Ostatnie Miau od {latestMeow.nickname}: <span className="text-[var(--color-ink-soft)]">{latestMeowType.label.toLowerCase()}</span></p>}
          </div>
        )}

        {coupleComplete && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[12px] text-[var(--color-ink-faint)]">Mały sygnał bez zaczynania rozmowy.</p>
            <Button variant="meow" onClick={() => setMeowOpen(true)} className="min-h-[44px] shrink-0 px-4 py-2 text-[12.5px]">
              <Icon name="paw" className="h-4 w-4" /> Wyślij Miau
            </Button>
          </div>
        )}
        {meowStatus && <p className="mt-2 text-right text-[11.5px] text-[var(--color-sage)]">{meowStatus}</p>}
      </section>

      {(editingCheckin || (!checkin.mood && !checkin.need)) ? (
        <>
      <section className="meow-section-surface mx-4 mt-6 p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[16px] font-semibold text-[var(--color-ink)]">Jak się dziś czujesz?</h2>
          <span className="text-[11px] text-[var(--color-ink-faint)]">tylko dla Ciebie</span>
        </div>
        <div className="no-scrollbar mt-4 flex justify-between gap-2 overflow-x-auto pb-1">
          {MOOD_OPTIONS.map((mood) => {
            const active = checkin.mood === mood.key;
            return (
              <button key={mood.key} onClick={() => updateCheckin({ mood: mood.key })} disabled={saving} className="meow-touch flex min-w-[48px] flex-col items-center gap-2 disabled:opacity-50">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full border ${active ? "border-[var(--color-dusty-pink)] bg-[var(--color-dusty-pink-soft)]/55 text-[var(--color-ink)]" : "border-[var(--color-ink)]/10 bg-transparent text-[var(--color-ink-soft)]"}`}>
                  <MoodFace mood={mood.key} className="h-6 w-6" />
                </span>
                <span className={`max-w-[60px] text-center text-[9.5px] leading-tight ${active ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}`}>{shortMoodLabel(mood.key)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-[16px] font-semibold text-[var(--color-ink)]">Czego dziś potrzebujesz?</h2>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {NEED_OPTIONS.map((need) => {
            const active = checkin.need === need.key;
            return (
              <button
                key={need.key}
                onClick={() => updateCheckin({ need: need.key })}
                disabled={saving}
                className={`meow-touch inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-[12px] font-medium disabled:opacity-50 ${active ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)]/55 text-[var(--color-ink)]" : "border-[var(--color-ink)]/10 text-[var(--color-ink-soft)]"}`}
              >
                <Icon name={NEED_ICONS[need.key] ?? "heart"} className="h-4 w-4" />
                {need.label}
              </button>
            );
          })}
        </div>

        {(checkin.mood || checkin.need) && (
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-ink)]/[0.08] pt-3">
            <div className="flex items-center gap-2 text-[11.5px] text-[var(--color-ink-faint)]">
              <Icon name={checkin.visibility === "shared" ? "share" : "lock"} className="h-3.5 w-3.5" />
              {checkin.visibility === "shared" ? `Widoczne dla ${partnerNickname ?? "partnera"}` : "Domyślnie prywatne"}
            </div>
            {checkin.visibility !== "shared" && coupleComplete && (
              <button onClick={() => updateCheckin({ visibility: "shared" })} disabled={saving} className="text-[11.5px] font-semibold text-[var(--color-brown)] disabled:opacity-50">Udostępnij</button>
            )}
          </div>
        )}
        {syncError && <p className="mt-3 text-[11.5px] font-medium text-[var(--color-danger)]">{syncError}</p>}
        {(checkin.mood || checkin.need) && <button type="button" onClick={() => setEditingCheckin(false)} className="mt-3 text-[11.5px] font-semibold text-[var(--color-brown)]">Gotowe</button>}
      </section>
        </>
      ) : (
        <section className="meow-section-surface mx-4 mt-6 p-5">
          <div className="py-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">Twój dzisiejszy check-in</p>
                <p className="mt-1.5 text-[14px] font-semibold text-[var(--color-ink)]">{checkinSummary(checkin.mood, checkin.need)}</p>
                <p className="mt-1 text-[11.5px] text-[var(--color-ink-faint)]">{checkin.visibility === "shared" ? `Udostępnione ${partnerNickname ?? "partnerowi"}` : "Tylko dla Ciebie"}</p>
              </div>
              <button type="button" onClick={() => setEditingCheckin(true)} className="min-h-10 shrink-0 text-[11.5px] font-semibold text-[var(--color-brown)]">Zmień</button>
            </div>
            {checkin.visibility !== "shared" && coupleComplete && <button type="button" onClick={() => updateCheckin({ visibility: "shared" })} disabled={saving} className="mt-3 text-[11.5px] font-semibold text-[var(--color-brown)] disabled:opacity-50">Udostępnij partnerowi</button>}
          </div>
          {syncError && <p className="mt-3 text-[11.5px] font-medium text-[var(--color-danger)]">{syncError}</p>}
        </section>
      )}

      {coupleComplete && <div className="px-5"><DailyQuestion /><OnThisDay /></div>}

      <section className="mx-4 mt-6">
        <button onClick={() => router.push("/razem")} className="meow-touch flex w-full items-center justify-between rounded-[20px] bg-[var(--color-ink)] px-5 py-4 text-left text-[var(--color-cream)] shadow-[var(--shadow-softer)]">
          <span><span className="block text-[14px] font-bold text-[var(--color-cream)]">Co możecie dziś zrobić razem?</span><span className="mt-0.5 block text-[12px] text-[var(--color-cream)]/70">Jedno pytanie, małe wyzwanie albo spokojna chwila.</span></span>
          <Icon name="chevron" className="h-4 w-4 text-[var(--color-ink-faint)]" />
        </button>
      </section>

      <BottomSheet open={meowOpen} onClose={() => setMeowOpen(false)} title="Wyślij Miau" description="Mały sygnał bez czatu i bez oczekiwania na odpowiedź.">
        <div className="border-y border-[var(--color-ink)]/[0.09]">
          {MEOW_TYPES.map((item) => (
            <button key={item.key} onClick={() => sendMeow(item.key)} disabled={sendingMeow} className="meow-touch flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--color-ink)]/[0.07] text-left last:border-b-0 disabled:opacity-45">
              <Icon name={MEOW_ICONS[item.key] ?? "paw"} className="h-5 w-5 text-[var(--color-dusty-pink)]" />
              <span className="flex-1 text-[13.5px] font-medium text-[var(--color-ink)]">{item.label}</span>
              <Icon name="chevron" className="h-4 w-4 text-[var(--color-ink-faint)]" />
            </button>
          ))}
        </div>
        <Button variant="ghost" fullWidth className="mt-3" onClick={() => setMeowOpen(false)}>Anuluj</Button>
      </BottomSheet>
    </div>
  );
}

function greetingForHour(hour: number) {
  if (hour >= 6 && hour < 11) return "Dzień dobry";
  if (hour >= 11 && hour < 17) return "Jak mija dzień";
  if (hour >= 17 && hour < 22) return "Dobrego wieczoru";
  return "Jeszcze nie śpisz";
}

function catMoment(name: string, personality: string | undefined, hour: number) {
  if (hour >= 22 || hour < 6) return `${name} zwolnił tempo i szuka spokojnego miejsca.`;
  if (hour < 10) return personality === "spokojny" ? `${name} jeszcze spokojnie zaczyna dzień.` : `${name} właśnie się przeciąga.`;
  if (personality === "ciekawski") return `${name} obserwuje, co dzieje się w Waszym domu.`;
  if (personality === "przytulaśny") return `${name} kręci się blisko drugiego kota.`;
  if (personality === "psotny") return `${name} wygląda, jakby zaraz miał coś zbroić.`;
  return `${name} ma dziś spokojny dzień.`;
}

function checkinSummary(mood: string | null, need: string | null) {
  const moodLabel = mood ? shortMoodLabel(mood) : null;
  const needLabel = NEED_OPTIONS.find((item) => item.key === need)?.label ?? null;
  if (moodLabel && needLabel) return `${moodLabel} · potrzebuję ${needLabel}`;
  if (moodLabel) return moodLabel;
  if (needLabel) return `potrzebuję ${needLabel}`;
  return "Bez odpowiedzi";
}

function describePartnerStatus(mood: string | null, need: string | null): string {
  const needText = NEED_OPTIONS.find((n) => n.key === need)?.label;
  const moodText = MOOD_OPTIONS.find((m) => m.key === mood)?.label;
  if (needText) return `potrzebuje dziś ${needText}.`;
  if (moodText) return `czuje się dziś ${moodText}.`;
  return "podzielił(a) się dziś swoim samopoczuciem.";
}

function shortMoodLabel(key: string) {
  const labels: Record<string, string> = { great: "świetnie", good: "dobrze", neutral: "okej", low: "słabo", upset: "złość", tired: "zmęczenie" };
  return labels[key] ?? key;
}

function MoodFace({ mood, className }: { mood: string; className?: string }) {
  const mouth = mood === "great" ? "M8 14c2.2 3 5.8 3 8 0" : mood === "good" ? "M8.5 14.5c2 1.8 5 1.8 7 0" : mood === "neutral" ? "M9 15h6" : mood === "low" ? "M8.5 16c2-2 5-2 7 0" : mood === "upset" ? "M8.5 16c2-2 5-2 7 0" : "M9 15h6";
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 10h.01M15 10h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {mood === "upset" && <path d="m7.7 8.5 2-1M16.3 8.5l-2-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />}
      {mood === "tired" && <path d="M7.8 10h2.4M13.8 10h2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
      <path d={mouth} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
