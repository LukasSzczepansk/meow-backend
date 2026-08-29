"use client";

import { useCallback, useState } from "react";
import { RoomInterior } from "@/components/domek/RoomInterior";
import { useCoupleSync } from "@/lib/client/useCoupleSync";
import type { CatAccessory, CatColorVariant, CatFurLength } from "@/lib/content/cats";
import type { RoomType } from "@/lib/content/shop";

export interface CatVisual {
  colorVariant: CatColorVariant;
  furLength: CatFurLength;
  accessory?: CatAccessory | null;
  name: string;
  personality?: string;
}

export function RoomScene({
  roomType,
  me,
  partner,
  reactionType,
  reactionCreatedAt,
}: {
  roomType: RoomType;
  me: CatVisual;
  partner: CatVisual | null;
  reactionType?: string | null;
  reactionCreatedAt?: string | null;
}) {
  const [items, setItems] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/room", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const map = data?.equippedByRoom?.[roomType];
      setItems(map && typeof map === "object" ? Object.values(map) as string[] : []);
    } catch {}
  }, [roomType]);

  useCoupleSync(load, 20_000, Boolean(partner), true);

  return <RoomInterior roomType={roomType} equippedItemKeys={items} me={me} partner={partner} compact reactionType={reactionType} reactionCreatedAt={reactionCreatedAt} />;
}
