"use client";

import dynamic from "next/dynamic";
import type { CatAccessory, CatColorVariant, CatFurLength } from "@/lib/content/cats";
import type { RoomSlotKey, RoomType } from "@/lib/content/shop";

const ThreeRoomScene = dynamic(
  () => import("@/components/domek/ThreeRoomScene").then((module) => module.ThreeRoomScene),
  { ssr: false, loading: () => null },
);

export interface RoomCat {
  colorVariant: CatColorVariant;
  furLength: CatFurLength;
  accessory?: CatAccessory | null;
  name: string;
  personality?: string;
}

export function RoomInterior({
  roomType,
  equippedItemKeys,
  me,
  partner,
  compact = false,
  editMode = false,
  previewItemKey = null,
  onItemPress,
  onCatPress,
  reactionType = null,
  reactionCreatedAt = null,
}: {
  roomType: RoomType;
  equippedItemKeys: string[];
  me: RoomCat;
  partner: RoomCat | null;
  compact?: boolean;
  editMode?: boolean;
  previewItemKey?: string | null;
  onItemPress?: (itemKey: string, slot: RoomSlotKey) => void;
  onCatPress?: () => void;
  reactionType?: string | null;
  reactionCreatedAt?: string | null;
}) {
  return (
    <div className={`${compact ? "min-h-[315px]" : "min-h-[430px]"} rounded-[20px] bg-[var(--color-surface-muted)]`}>
      <ThreeRoomScene
        roomType={roomType}
        equippedItemKeys={equippedItemKeys}
        me={me}
        partner={partner}
        compact={compact}
        editMode={editMode}
        previewItemKey={previewItemKey}
        onItemPress={onItemPress}
        onCatPress={onCatPress}
        reactionType={reactionType}
        reactionCreatedAt={reactionCreatedAt}
      />
    </div>
  );
}
