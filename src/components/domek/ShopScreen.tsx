"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PawCounter } from "@/components/ui/PawCounter";
import { RoomObject } from "@/components/domek/RoomObject";
import { RoomItemPreview } from "@/components/domek/RoomItemPreview";
import { SHOP_CATEGORY_LABELS, type ShopCategory, type ShopItem } from "@/lib/content/shop";

interface ShopItemRow extends ShopItem {
  owned: boolean;
  roomUnlocked: boolean;
}

const CATEGORIES: ShopCategory[] = ["meble", "koci_sprzet", "dekoracje"];

export function ShopScreen() {
  const [items, setItems] = useState<ShopItemRow[] | null>(null);
  const [pawPoints, setPawPoints] = useState(0);
  const [category, setCategory] = useState<ShopCategory>("meble");
  const [selected, setSelected] = useState<ShopItemRow | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setPawPoints(data.pawPoints);
      });
  }

  useEffect(load, []);

  async function buy() {
    if (!selected) return;
    setBuying(true);
    setError(null);
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemKey: selected.key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelected(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coś poszło nie tak.");
    } finally {
      setBuying(false);
    }
  }

  if (!items) return <div className="mx-5 mt-5 h-72 animate-pulse rounded-[18px] bg-[var(--color-surface-muted)]" />;

  const visibleItems = items.filter((i) => i.category === category);

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between px-5 pt-1">
        <p className="text-[12px] text-[var(--color-ink-soft)]">Na wspólne drobiazgi</p>
        <PawCounter value={pawPoints} />
      </div>

      <div className="no-scrollbar mt-5 flex gap-5 overflow-x-auto border-b border-[var(--color-ink)]/[0.09] px-5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`relative shrink-0 pb-3 text-[13px] font-semibold ${category === c ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}`}
          >
            {SHOP_CATEGORY_LABELS[c]}
            {category === c && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[var(--color-dusty-pink)]" />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-5 pt-5">
        {visibleItems.map((item) => (
          <button
            key={item.key}
            onClick={() => !item.owned && item.roomUnlocked && setSelected(item)}
            disabled={item.owned || !item.roomUnlocked}
            className="meow-touch min-w-0 text-left disabled:opacity-45"
          >
            <span className="flex aspect-[1.18] items-center justify-center overflow-hidden rounded-[14px] bg-[var(--color-surface-muted)] px-4 py-3">
              <span className="block h-full w-full max-w-[112px]"><RoomObject itemKey={item.key} /></span>
            </span>
            <span className="mt-2.5 block text-[14px] font-semibold text-[var(--color-ink)]">{item.name}</span>
            {item.owned ? (
              <span className="mt-0.5 block text-[11px] text-[var(--color-sage)]">Już w Waszym domu</span>
            ) : !item.roomUnlocked ? (
              <span className="mt-0.5 block text-[11px] text-[var(--color-ink-faint)]">Jeszcze nieodblokowane</span>
            ) : (
              <span className="mt-0.5 block text-[11px] text-[var(--color-ink-soft)]">{item.cost} łapek</span>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 px-3 pb-[max(env(safe-area-inset-bottom),12px)]" onClick={() => setSelected(null)}>
          <div className="w-full max-w-[454px] rounded-[18px] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-1 w-10 rounded-full bg-[var(--color-ink)]/10" />
            <div className="mt-4 overflow-hidden">
              <RoomItemPreview item={selected} />
            </div>
            <div className="mt-5">
              <h3 className="text-[19px] font-semibold text-[var(--color-ink)]">{selected.name}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{selected.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--color-ink)]/[0.08] pt-4">
                <span className="text-[13px] text-[var(--color-ink-soft)]">Cena</span>
                <span className="text-[14px] font-semibold text-[var(--color-ink)]">{selected.cost} łapek</span>
              </div>
            </div>
            {error && <p className="mt-3 text-[12px] font-medium text-[var(--color-danger)]">{error}</p>}
            <Button className="mt-5" fullWidth onClick={buy} disabled={buying}>
              {buying ? "Dodajemy..." : "Dodaj do domu"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
