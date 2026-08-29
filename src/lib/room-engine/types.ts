import type { CatAccessory, CatColorVariant, CatFurLength } from "@/lib/content/cats";
import type { RoomSlotKey, RoomType } from "@/lib/content/shop";

export interface RoomEngineCat {
  name: string;
  colorVariant: CatColorVariant;
  furLength: CatFurLength;
  accessory?: CatAccessory | null;
  personality?: string;
}

export type RoomCatPose = "sit" | "sleep" | "stand" | "play" | "window";

export interface RoomPoint {
  x: number;
  y: number;
}

export interface RoomCatSpot extends RoomPoint {
  id: string;
  pose: RoomCatPose;
  facing?: "left" | "right";
  priority?: number;
  layer?: number;
}

export interface RoomSceneItemDefinition {
  key: string;
  slot: RoomSlotKey;
  x: number;
  y: number;
  scale: number;
  layer: number;
  catSpots?: RoomCatSpot[];
}

export interface RoomSceneConfig {
  roomType: RoomType;
  width: number;
  height: number;
}
