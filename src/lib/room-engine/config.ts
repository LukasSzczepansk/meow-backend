import type { RoomPoint } from "@/lib/room-engine/types";
import type { RoomType } from "@/lib/content/shop";

export const ROOM_ENGINE_WIDTH = 390;
export const ROOM_ENGINE_HEIGHT = 430;

export interface RoomVisualPalette {
  wall: number;
  wallDark: number;
  floor: number;
  floorAlt: number;
  trim: number;
  skyDay: number;
  skyNight: number;
  shadow: number;
  warmLight: number;
}

export const ROOM_VISUALS: Record<RoomType, RoomVisualPalette> = {
  salon: { wall: 0xe7ddd0, wallDark: 0xd2c4b4, floor: 0xc9a47f, floorAlt: 0xb88f69, trim: 0xf2eadf, skyDay: 0xb9d2cf, skyNight: 0x455063, shadow: 0x4d4039, warmLight: 0xf0bc79 },
  kuchnia: { wall: 0xe6e1d5, wallDark: 0xcec6b7, floor: 0xbca78c, floorAlt: 0xa88f72, trim: 0xf3ede4, skyDay: 0xc2d7d1, skyNight: 0x465164, shadow: 0x4d4039, warmLight: 0xefbd7b },
  sypialnia: { wall: 0xe3d8d7, wallDark: 0xcdbfbe, floor: 0xc2a386, floorAlt: 0xad8d72, trim: 0xf1e8e5, skyDay: 0xc1d1ce, skyNight: 0x454f61, shadow: 0x4d4039, warmLight: 0xefb779 },
  balkon: { wall: 0xdfddd3, wallDark: 0xc7c4b8, floor: 0xb7a78f, floorAlt: 0x9f8e77, trim: 0xf0ebe2, skyDay: 0xb8d3cd, skyNight: 0x435063, shadow: 0x48504a, warmLight: 0xefbc78 },
  ogrod: { wall: 0xdce4d6, wallDark: 0xc6d0c0, floor: 0xaeb790, floorAlt: 0x98a27d, trim: 0xf0ede2, skyDay: 0xb9d7cf, skyNight: 0x40505c, shadow: 0x475046, warmLight: 0xefba76 },
  pokoj_gier: { wall: 0xdfd8d2, wallDark: 0xc7bdb6, floor: 0xbca087, floorAlt: 0xa3846d, trim: 0xeee7df, skyDay: 0xc1d0ce, skyNight: 0x424b5b, shadow: 0x4d4039, warmLight: 0xefb878 },
};

export const ROOM_NAV_POINTS: Record<string, RoomPoint> = {
  floorLeft: { x: 104, y: 326 },
  floorCenter: { x: 195, y: 330 },
  floorRight: { x: 286, y: 326 },
  sofaLeft: { x: 164, y: 221 },
  sofaRight: { x: 222, y: 221 },
  window: { x: 195, y: 150 },
  leftCorner: { x: 78, y: 286 },
  rightCorner: { x: 312, y: 286 },
};
