"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PawCounter } from "@/components/ui/PawCounter";
import { RoomInterior } from "@/components/domek/RoomInterior";
import { Icon } from "@/components/ui/Icons";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PetCatSheet } from "@/components/cats/PetCatSheet";
import { SHOP_ITEMS, type RoomSlotKey, type RoomType } from "@/lib/content/shop";
import type { CatAccessory, CatColorVariant, CatFurLength } from "@/lib/content/cats";

interface RoomState {
  pawPoints: number;
  lifetimePoints: number;
  currentRoom: { level: number; type: RoomType; label: string };
  nextRoom: { label: string; unlockAt: number } | null;
  purchasedItemKeys: string[];
  equippedByRoom: Record<string, Record<string, string>>;
}

interface CatInfo {
  colorVariant: CatColorVariant;
  furLength: CatFurLength;
  accessory: CatAccessory | null;
  name: string;
  personality?: string;
}

const SLOT_LABELS: Partial<Record<RoomSlotKey, string>> = {
  wall_main: "Główna ściana",
  wall_secondary: "Druga dekoracja",
  main_furniture: "Główny mebel",
  side_left: "Lewa strona",
  side_right: "Prawa strona",
  floor_center: "Środek podłogi",
  floor_left: "Lewy kąt",
  floor_right: "Prawy kąt",
  lighting: "Światło",
  plant: "Roślina",
  cat_bed: "Miejsce do spania",
  cat_toy: "Kocia zabawka",
};

export function DomekScreen({ me, partner }: { me: CatInfo; partner: CatInfo | null }) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [slotOpen, setSlotOpen] = useState<RoomSlotKey | null>(null);
  const [petOpen, setPetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewItemKey, setPreviewItemKey] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    fetch("/api/room")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Nie udało się wczytać domku.");
        return data as RoomState;
      })
      .then(setRoom)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Nie udało się wczytać domku."));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const ownedForRoom = useMemo(() => {
    if (!room) return [];
    return SHOP_ITEMS.filter((item) => item.room === room.currentRoom.type && room.purchasedItemKeys.includes(item.key));
  }, [room]);

  if (!room && !error) return <div className="mx-5 mt-5 h-[365px] animate-pulse rounded-[18px] bg-[var(--color-surface-muted)]" />;
  if (!room) return <div className="mx-5 mt-6 border-y border-[var(--color-ink)]/10 py-5 text-center"><p className="text-sm text-[var(--color-ink-soft)]">{error}</p><button onClick={load} className="mt-3 text-sm font-semibold text-[var(--color-brown)]">Spróbuj ponownie</button></div>;

  const equippedMap = room.equippedByRoom[room.currentRoom.type] ?? {};
  const equippedKeys = Object.values(equippedMap).filter((key): key is string => typeof key === "string");
  const progress = room.nextRoom ? Math.min(100, (room.lifetimePoints / room.nextRoom.unlockAt) * 100) : 100;
  const availableSlots: RoomSlotKey[] = Array.from(new Set<RoomSlotKey>(ownedForRoom.map((item) => item.slot)));

  async function equip(itemKey: string) {
    setSaving(true);
    try {
      const response = await fetch("/api/room/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemKey }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Nie udało się ustawić przedmiotu.");
      setSlotOpen(null);
      setPreviewItemKey(null);
      await Promise.resolve(load());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-6">
      <header className="flex items-end justify-between px-5 pb-4 pt-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">Poziom {room.currentRoom.level}</p>
          <h1 className="mt-1 text-[25px] font-semibold text-[var(--color-ink)]">{room.currentRoom.label}</h1>
        </div>
        <PawCounter value={room.pawPoints} />
      </header>

      <div className="px-5">
        <RoomInterior
          roomType={room.currentRoom.type}
          equippedItemKeys={equippedKeys}
          me={me}
          partner={partner}
          editMode={editOpen}
          previewItemKey={previewItemKey}
          onItemPress={(_, slot) => { setPreviewItemKey(null); setSlotOpen(slot); }}
          onCatPress={() => setPetOpen(true)}
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="max-w-[240px] text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">Dotknij swojego kota, żeby pobyć z nim chwilę.</p>
          <button type="button" onClick={() => { setPreviewItemKey(null); setSlotOpen(null); setEditOpen((value) => !value); }} className="meow-touch min-h-10 text-[12.5px] font-semibold text-[var(--color-brown)]">
            {editOpen ? "Zakończ" : "Urządź"}
          </button>
        </div>
      </div>

      {editOpen && (
        <section className="mt-5 px-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">Aktywne wyposażenie</p>
          {availableSlots.length === 0 ? (
            <p className="border-y border-[var(--color-ink)]/[0.09] py-5 text-[13px] text-[var(--color-ink-soft)]">Najpierw odblokujcie coś w sklepie.</p>
          ) : (
            <div className="border-y border-[var(--color-ink)]/[0.09]">
              {availableSlots.map((slot) => {
                const activeKey = equippedMap[slot];
                const active = SHOP_ITEMS.find((item) => item.key === activeKey);
                return (
                  <button key={slot} type="button" onClick={() => setSlotOpen(slot)} className="meow-touch flex min-h-[62px] w-full items-center gap-3 border-b border-[var(--color-ink)]/[0.07] text-left last:border-b-0">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold text-[var(--color-ink)]">{SLOT_LABELS[slot] ?? slot}</span>
                      <span className="mt-0.5 block text-[12px] text-[var(--color-ink-faint)]">{active?.name ?? "Nic jeszcze nie wybrano"}</span>
                    </span>
                    <Icon name="chevron" className="h-4 w-4 text-[var(--color-ink-faint)]" />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {room.nextRoom && (
        <section className="px-5 pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <div><p className="text-[12px] font-semibold text-[var(--color-ink)]">Następny pokój: {room.nextRoom.label}</p><p className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">Odblokowuje się przez wspólne rzeczy, nie serię dni.</p></div>
            <span className="shrink-0 text-[11px] tabular-nums text-[var(--color-ink-faint)]">{room.lifetimePoints}/{room.nextRoom.unlockAt}</span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)]"><div className="h-full rounded-full bg-[var(--color-sage)]" style={{ width: `${progress}%` }} /></div>
        </section>
      )}

      <section className="mt-7 px-5">
        <Link href="/domek/sklep" className="meow-touch flex items-center gap-4 border-y border-[var(--color-ink)]/[0.09] py-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-muted)]"><Icon name="home" className="h-5 w-5 text-[var(--color-brown)]" /></span>
          <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">Wasze rzeczy</span><span className="mt-0.5 block text-[13px] text-[var(--color-ink-soft)]">Odblokujcie kolejne przedmioty do wspólnej przestrzeni.</span></span>
          <Icon name="chevron" className="h-4 w-4 text-[var(--color-ink-faint)]" />
        </Link>
      </section>

      <BottomSheet open={Boolean(slotOpen)} onClose={() => { setSlotOpen(null); setPreviewItemKey(null); }} title={slotOpen ? SLOT_LABELS[slotOpen] ?? "Wyposażenie" : "Wyposażenie"} description="Wybierz jedną z rzeczy, które już macie.">
        <div className="border-y border-[var(--color-ink)]/[0.09]">
          {slotOpen && ownedForRoom.filter((item) => item.slot === slotOpen).map((item) => {
            const active = equippedMap[slotOpen] === item.key;
            const previewing = previewItemKey === item.key;
            return (
              <button key={item.key} type="button" disabled={saving} onClick={() => setPreviewItemKey(item.key)} className={`meow-touch flex min-h-[64px] w-full items-center justify-between border-b border-[var(--color-ink)]/[0.07] text-left last:border-b-0 disabled:opacity-50 ${previewing ? "bg-[var(--color-surface-muted)]/70" : ""}`}>
                <span className="min-w-0 pr-3">
                  <span className="block text-[13.5px] font-semibold">{item.name}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">{active ? "Obecnie ustawione" : previewing ? "Podgląd w pokoju powyżej" : item.description}</span>
                </span>
                {active ? <Icon name="check" className="h-5 w-5 shrink-0 text-[var(--color-sage)]" /> : <span className="shrink-0 text-[11px] font-semibold text-[var(--color-brown)]">Podgląd</span>}
              </button>
            );
          })}
        </div>
        {slotOpen && previewItemKey && equippedMap[slotOpen] !== previewItemKey && (
          <div className="mt-4 border-t border-[var(--color-ink)]/[0.08] pt-4">
            <button type="button" disabled={saving} onClick={() => equip(previewItemKey)} className="meow-touch min-h-12 w-full rounded-[12px] bg-[var(--color-ink)] px-4 text-[13px] font-semibold text-[var(--color-surface)] disabled:opacity-50">
              {saving ? "Ustawiamy..." : "Ustaw w pokoju"}
            </button>
            <p className="mt-2 text-center text-[10.5px] leading-relaxed text-[var(--color-ink-faint)]">Podgląd nie zmienia wspólnego pokoju, dopóki nie potwierdzisz.</p>
          </div>
        )}
      </BottomSheet>

      <PetCatSheet open={petOpen} onClose={() => setPetOpen(false)} cat={me} />
    </div>
  );
}
