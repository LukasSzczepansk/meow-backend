"use client";

import dynamic from "next/dynamic";
import type { ShopItem } from "@/lib/content/shop";

const ThreeRoomScene = dynamic(
  () => import("@/components/domek/ThreeRoomScene").then((module) => module.ThreeRoomScene),
  { ssr: false, loading: () => <div className="h-[315px] animate-pulse rounded-[18px] bg-[var(--color-surface-muted)]" /> },
);

const PREVIEW_CAT = {
  name: "Milo",
  colorVariant: "gray" as const,
  furLength: "short" as const,
  accessory: null,
  personality: "ciekawski",
};

export function RoomItemPreview({ item }: { item: ShopItem }) {
  return (
    <div>
      <ThreeRoomScene
        roomType={item.room}
        equippedItemKeys={[]}
        previewItemKey={item.key}
        me={PREVIEW_CAT}
        partner={null}
        compact
      />
      <p className="mt-2 text-center text-[10.5px] text-[var(--color-ink-faint)]">Podgląd w prawdziwej scenie pokoju — finalne ustawienie zależy od Waszego wyposażenia.</p>
    </div>
  );
}
