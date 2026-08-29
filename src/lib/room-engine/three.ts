import type { RoomCatPose } from "@/lib/room-engine/types";
import type { RoomSlotKey, RoomType } from "@/lib/content/shop";

export type Vec3 = [number, number, number];

export type ThreeFurnitureKind =
  | "sofa"
  | "rug"
  | "lamp"
  | "shelf"
  | "plant"
  | "fireplace"
  | "gramophone"
  | "scratcher"
  | "fish_toy"
  | "yarn"
  | "tunnel"
  | "box"
  | "hammock"
  | "fountain"
  | "painting"
  | "photo_frame"
  | "candles"
  | "cushions"
  | "fairy_lights"
  | "flowers";

export interface ThreeCatSpot {
  id: string;
  position: Vec3;
  pose: RoomCatPose;
  priority?: number;
  facing?: "left" | "right";
}

export interface ThreeRoomItemDefinition {
  key: string;
  kind: ThreeFurnitureKind;
  slot: RoomSlotKey;
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
  catSpots?: ThreeCatSpot[];
}

export interface ThreeRoomPalette {
  wall: string;
  wallShade: string;
  floor: string;
  floorAlt: string;
  trim: string;
  rug: string;
  wood: string;
  woodDark: string;
  textile: string;
  textileDark: string;
  sage: string;
  coral: string;
  metal: string;
  skyDay: string;
  skySunset: string;
  skyNight: string;
  warmLight: string;
}

export const THREE_ROOM_PALETTES: Record<RoomType, ThreeRoomPalette> = {
  salon: {
    wall: "#E8DED1", wallShade: "#D8CAB9", floor: "#B98E68", floorAlt: "#C49B76", trim: "#F3ECE2",
    rug: "#C9B7A3", wood: "#8C684E", woodDark: "#604A3C", textile: "#B77E72", textileDark: "#95665D",
    sage: "#879984", coral: "#C98376", metal: "#6E655D", skyDay: "#B9D4D1", skySunset: "#E8B88F", skyNight: "#4A5365", warmLight: "#F3BD75",
  },
  kuchnia: {
    wall: "#E8E2D6", wallShade: "#D6CDBF", floor: "#B6A184", floorAlt: "#C3AE91", trim: "#F4EEE6",
    rug: "#C8BCA9", wood: "#907258", woodDark: "#665245", textile: "#A98B7E", textileDark: "#866C62",
    sage: "#879988", coral: "#C98276", metal: "#6B6965", skyDay: "#BED5D0", skySunset: "#E8B990", skyNight: "#475163", warmLight: "#F0BC75",
  },
  sypialnia: {
    wall: "#E5DADB", wallShade: "#D4C3C4", floor: "#B89A7D", floorAlt: "#C5A98E", trim: "#F2E9E7",
    rug: "#CBB6B9", wood: "#846554", woodDark: "#5D4B42", textile: "#AE8188", textileDark: "#8E6870",
    sage: "#8C9B8D", coral: "#C98578", metal: "#6B6462", skyDay: "#BECFD0", skySunset: "#E3B18C", skyNight: "#454E60", warmLight: "#F0B873",
  },
  balkon: {
    wall: "#E0DED4", wallShade: "#CAC6BA", floor: "#A99882", floorAlt: "#B7A58F", trim: "#F1ECE4",
    rug: "#C5B7A4", wood: "#836B58", woodDark: "#5B4B40", textile: "#A48175", textileDark: "#81655D",
    sage: "#879B86", coral: "#C98276", metal: "#666C68", skyDay: "#B6D5CF", skySunset: "#E8B98F", skyNight: "#435061", warmLight: "#F0BC75",
  },
  ogrod: {
    wall: "#DEE5D8", wallShade: "#C8D1C1", floor: "#9DA584", floorAlt: "#ADB692", trim: "#F0EEE4",
    rug: "#C2B9A2", wood: "#82674D", woodDark: "#5B483A", textile: "#A77F72", textileDark: "#806057",
    sage: "#80947B", coral: "#C98276", metal: "#626962", skyDay: "#B7D7CF", skySunset: "#E6B787", skyNight: "#40505C", warmLight: "#EFBA73",
  },
  pokoj_gier: {
    wall: "#E2D9D3", wallShade: "#CEC1B8", floor: "#AF927B", floorAlt: "#BEA18A", trim: "#EFE7DF",
    rug: "#BDA8AA", wood: "#79614F", woodDark: "#55443A", textile: "#A87978", textileDark: "#825E5F",
    sage: "#83968A", coral: "#C37E75", metal: "#67615E", skyDay: "#BFCFD0", skySunset: "#E5B38D", skyNight: "#424B5B", warmLight: "#EFB572",
  },
};

export const THREE_ROOM_ITEMS: Record<string, ThreeRoomItemDefinition> = {
  sofa: {
    key: "sofa", kind: "sofa", slot: "main_furniture", position: [-1.05, 0, -2.05],
    catSpots: [
      { id: "sofa-left", position: [-1.55, 0.75, -1.88], pose: "sleep", facing: "right", priority: 5 },
      { id: "sofa-right", position: [-0.55, 0.75, -1.88], pose: "sit", facing: "left", priority: 5 },
    ],
  },
  rug: { key: "rug", kind: "rug", slot: "floor_center", position: [0.2, 0.025, 0.25], scale: 1.15 },
  lamp: { key: "lamp", kind: "lamp", slot: "lighting", position: [2.85, 0, -2.35], scale: 0.95 },
  shelf: { key: "shelf", kind: "shelf", slot: "side_right", position: [2.65, 0, -2.65], scale: 0.92 },
  plant: { key: "plant", kind: "plant", slot: "plant", position: [-3.0, 0, -2.3], scale: 0.96 },
  fireplace: {
    key: "fireplace", kind: "fireplace", slot: "side_left", position: [-2.85, 0, -2.6], scale: 0.9,
    catSpots: [{ id: "fireplace", position: [-2.1, 0, -1.85], pose: "sit", facing: "left", priority: 3 }],
  },
  gramophone: { key: "gramophone", kind: "gramophone", slot: "side_right", position: [2.65, 0, -2.25], scale: 0.9 },
  scratcher: {
    key: "scratcher", kind: "scratcher", slot: "side_right", position: [2.65, 0, 1.25], scale: 0.95,
    catSpots: [{ id: "scratcher", position: [2.05, 0, 1.1], pose: "stand", facing: "right", priority: 5 }],
  },
  fish_toy: {
    key: "fish_toy", kind: "fish_toy", slot: "cat_toy", position: [1.15, 0.08, 1.65], scale: 0.95,
    catSpots: [{ id: "fish-toy", position: [0.65, 0, 1.35], pose: "play", facing: "right", priority: 6 }],
  },
  yarn: {
    key: "yarn", kind: "yarn", slot: "cat_toy", position: [0.8, 0.14, 1.72], scale: 0.95,
    catSpots: [{ id: "yarn", position: [0.35, 0, 1.35], pose: "play", facing: "right", priority: 6 }],
  },
  tunnel: {
    key: "tunnel", kind: "tunnel", slot: "floor_left", position: [-2.35, 0.42, 1.4], rotation: [0, 0.15, 0], scale: 0.92,
    catSpots: [{ id: "tunnel", position: [-1.7, 0, 1.25], pose: "play", facing: "left", priority: 4 }],
  },
  box: {
    key: "box", kind: "box", slot: "floor_right", position: [2.35, 0, 1.6], rotation: [0, -0.15, 0], scale: 0.9,
    catSpots: [{ id: "box", position: [2.3, 0.5, 1.55], pose: "sit", facing: "left", priority: 7 }],
  },
  hammock: {
    key: "hammock", kind: "hammock", slot: "cat_bed", position: [1.9, 0, -1.5], scale: 0.92,
    catSpots: [{ id: "hammock", position: [1.9, 0.68, -1.5], pose: "sleep", facing: "left", priority: 6 }],
  },
  fountain: { key: "fountain", kind: "fountain", slot: "side_left", position: [-2.55, 0, 0.7], scale: 0.9 },
  painting: { key: "painting", kind: "painting", slot: "wall_main", position: [-0.95, 2.55, -3.39], scale: 1 },
  photo_frame: { key: "photo_frame", kind: "photo_frame", slot: "wall_secondary", position: [2.3, 2.45, -3.39], scale: 0.9 },
  candles: { key: "candles", kind: "candles", slot: "lighting", position: [1.8, 0.03, -1.6], scale: 0.9 },
  cushions: { key: "cushions", kind: "cushions", slot: "main_furniture", position: [-1.05, 0.78, -1.85], scale: 1 },
  fairy_lights: { key: "fairy_lights", kind: "fairy_lights", slot: "lighting", position: [0, 3.25, -3.36], scale: 1 },
  flowers: { key: "flowers", kind: "flowers", slot: "plant", position: [-2.75, 0, -2.0], scale: 0.9 },
};

export const THREE_FLOOR_SPOTS: ThreeCatSpot[] = [
  { id: "floor-left", position: [-1.8, 0, 0.75], pose: "sit", facing: "right", priority: 1 },
  { id: "floor-center", position: [0, 0, 0.9], pose: "sit", facing: "right", priority: 1 },
  { id: "floor-right", position: [1.65, 0, 0.65], pose: "sit", facing: "left", priority: 1 },
  { id: "window", position: [0.55, 0, -2.2], pose: "window", facing: "right", priority: 3 },
];

export function getThreeRoomItem(key: string): ThreeRoomItemDefinition | undefined {
  return THREE_ROOM_ITEMS[key];
}
