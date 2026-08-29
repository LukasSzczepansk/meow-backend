"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icons";
import { useCoupleSync } from "@/lib/client/useCoupleSync";

interface EventRow {
  id: string;
  type: string;
  payload: Record<string, string | number | boolean | null> | null;
  createdAt: string;
  mine: boolean;
  actorNickname: string | null;
}

const EVENT_ICONS: Record<string, IconName> = {
  meow_sent: "paw",
  question_answered: "chat",
  question_ready: "chat",
  memory_added: "photo",
  challenge_completed: "spark",
  date_added: "calendar",
  date_selected: "calendar",
  room_item_unlocked: "home",
  room_item_equipped: "home",
  achievement_unlocked: "trophy",
  checkin_shared: "heart",
  relationship_event_added: "history",
  music_added: "music",
  music_our_song: "heart",
  music_room_started: "music",
};

export function ActivityScreen() {
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/activity", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setEvents(data.events);
      setError(false);
    } catch {
      setEvents([]);
      setError(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useCoupleSync(load, 20_000);

  const groups = useMemo(() => groupEvents(events ?? []), [events]);

  if (!events) return <div className="mx-5 mt-4 h-56 animate-pulse bg-[var(--color-surface-muted)]/40" />;

  return (
    <div className="pb-8 pt-1">
      <header className="px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">Ostatnio</p>
        <h1 className="meow-editorial-title mt-2 max-w-[350px] text-[35px] leading-[1.03] text-[var(--color-ink)]">Tylko rzeczy, które coś zmieniły w Waszym miejscu.</h1>
        <p className="mt-3 max-w-[335px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">Bez feedu i bez śledzenia każdego kliknięcia. To krótka kronika wspólnych zdarzeń.</p>
      </header>

      {error && <button onClick={load} className="mx-5 mt-5 text-[12px] font-semibold text-[var(--color-brown)]">Nie udało się odświeżyć. Spróbuj ponownie.</button>}

      {events.length === 0 ? (
        <section className="mx-5 mt-8 border-y border-[var(--color-ink)]/[0.09] py-7"><p className="text-[14px] font-semibold text-[var(--color-ink)]">Jeszcze cicho.</p><p className="mt-1.5 max-w-[330px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">Pojawią się tu Miau, wspomnienia, wspólne odpowiedzi i zmiany w Domku — nic więcej.</p></section>
      ) : (
        <div className="mt-9">
          {groups.map(([label, rows], groupIndex) => (
            <section key={label} className={groupIndex ? "mt-9" : ""}>
              <div className="px-5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-faint)]">{label}</p></div>
              <div className="mx-5 mt-2 border-y border-[var(--color-ink)]/[0.09]">
                {rows.map((event) => (
                  <div key={event.id} className="grid grid-cols-[24px_minmax(0,1fr)_auto] gap-3 border-b border-[var(--color-ink)]/[0.07] py-4 last:border-b-0">
                    <span className="grid h-6 w-6 place-items-center text-[var(--color-brown)]"><Icon name={EVENT_ICONS[event.type] ?? "spark"} className="h-4 w-4" /></span>
                    <p className="text-[12.5px] leading-[1.55] text-[var(--color-ink)]">{describeEvent(event)}</p>
                    <p className="pt-0.5 text-[10px] tabular-nums text-[var(--color-ink-faint)]">{formatTime(event.createdAt)}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupEvents(events: EventRow[]) {
  const map = new Map<string, EventRow[]>();
  for (const event of events) {
    const label = dayLabel(event.createdAt);
    map.set(label, [...(map.get(label) ?? []), event]);
  }
  return [...map.entries()];
}

function dayLabel(value: string) {
  const date = new Date(value);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startEvent = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startToday - startEvent) / 86_400_000);
  if (days === 0) return "Dzisiaj";
  if (days === 1) return "Wczoraj";
  return date.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
}

function describeEvent(event: EventRow) {
  const who = event.mine ? "Ty" : event.actorNickname ?? "Druga osoba";
  const payload = event.payload ?? {};
  switch (event.type) {
    case "meow_sent": return event.mine ? `Wysłałeś/aś Miau: „${payload.label ?? "Miau"}”.` : `${who} wysłał/a Ci Miau: „${payload.label ?? "Miau"}”.`;
    case "question_answered": return `${who} odpowiedział/a na wspólne pytanie.`;
    case "question_ready": return "Wasze odpowiedzi są gotowe do odkrycia.";
    case "memory_added": return `${who} dodał/a nowe wspomnienie${payload.title ? `: „${payload.title}”` : ""}.`;
    case "challenge_completed": return "Ukończyliście wspólną małą rzecz.";
    case "date_added": return `${who} wrzucił/a pomysł do Słoika${payload.title ? `: „${payload.title}”` : ""}.`;
    case "date_selected": return `Wybraliście pomysł${payload.title ? `: „${payload.title}”` : ""}.`;
    case "room_item_equipped": return `${who} zmienił/a coś w Kocim Domku.`;
    case "achievement_unlocked": return "W Waszej kolekcji pojawiła się nowa pamiątka.";
    case "checkin_shared": return `${who} udostępnił/a, czego dziś potrzebuje.`;
    case "relationship_event_added": return `${who} dopisał/a coś do Waszej historii.`;
    case "music_added": return `${who} dodał/a do Waszej muzyki${payload.title ? `: „${payload.title}”` : ""}.`;
    case "music_our_song": return `${who} oznaczył/a${payload.title ? ` „${payload.title}”` : " utwór"} jako Waszą piosenkę.`;
    case "music_room_started": return `${who} włączył/a wspólne słuchanie${payload.title ? `: „${payload.title}”` : ""}.`;
    default: return "Coś zmieniło się w Waszym Meow.";
  }
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}
