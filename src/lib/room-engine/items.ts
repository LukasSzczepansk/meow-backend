import type { RoomSceneItemDefinition } from "@/lib/room-engine/types";

export const ROOM_SCENE_ITEMS: Record<string, RoomSceneItemDefinition> = {
  sofa: {
    key: "sofa", slot: "main_furniture", x: 195, y: 205, scale: 2.75, layer: 38,
    catSpots: [
      { id: "sofa-left", x: 166, y: 217, pose: "sleep", facing: "right", priority: 4, layer: 45 },
      { id: "sofa-right", x: 224, y: 217, pose: "sit", facing: "left", priority: 4, layer: 45 },
    ],
  },
  rug: { key: "rug", slot: "floor_center", x: 195, y: 302, scale: 1, layer: 10 },
  lamp: { key: "lamp", slot: "lighting", x: 327, y: 210, scale: 0.9, layer: 42 },
  shelf: { key: "shelf", slot: "side_right", x: 316, y: 167, scale: 2.15, layer: 30 },
  plant: { key: "plant", slot: "plant", x: 61, y: 214, scale: 0.95, layer: 44 },
  fireplace: {
    key: "fireplace", slot: "side_left", x: 65, y: 174, scale: 0.9, layer: 34,
    catSpots: [{ id: "fireplace", x: 102, y: 232, pose: "sit", facing: "left", priority: 2, layer: 47 }],
  },
  gramophone: { key: "gramophone", slot: "side_right", x: 319, y: 255, scale: 2.05, layer: 41 },
  scratcher: {
    key: "scratcher", slot: "side_right", x: 315, y: 286, scale: 0.88, layer: 46,
    catSpots: [{ id: "scratcher", x: 280, y: 305, pose: "stand", facing: "right", priority: 4, layer: 49 }],
  },
  fish_toy: {
    key: "fish_toy", slot: "cat_toy", x: 265, y: 350, scale: 0.68, layer: 60,
    catSpots: [{ id: "fish-toy", x: 252, y: 328, pose: "play", facing: "right", priority: 5, layer: 58 }],
  },
  yarn: {
    key: "yarn", slot: "cat_toy", x: 248, y: 352, scale: 0.62, layer: 60,
    catSpots: [{ id: "yarn", x: 239, y: 326, pose: "play", facing: "right", priority: 5, layer: 58 }],
  },
  tunnel: {
    key: "tunnel", slot: "floor_left", x: 84, y: 345, scale: 0.82, layer: 52,
    catSpots: [{ id: "tunnel", x: 110, y: 322, pose: "play", facing: "left", priority: 3, layer: 49 }],
  },
  box: {
    key: "box", slot: "floor_right", x: 315, y: 344, scale: 0.75, layer: 52,
    catSpots: [{ id: "box", x: 307, y: 320, pose: "sit", facing: "left", priority: 6, layer: 56 }],
  },
  hammock: {
    key: "hammock", slot: "cat_bed", x: 270, y: 237, scale: 0.86, layer: 40,
    catSpots: [{ id: "hammock", x: 270, y: 232, pose: "sleep", facing: "left", priority: 5, layer: 45 }],
  },
  fountain: { key: "fountain", slot: "side_left", x: 82, y: 285, scale: 0.82, layer: 43 },
  painting: { key: "painting", slot: "wall_main", x: 195, y: 70, scale: 0.8, layer: 21 },
  photo_frame: { key: "photo_frame", slot: "wall_secondary", x: 287, y: 73, scale: 0.72, layer: 22 },
  candles: { key: "candles", slot: "lighting", x: 300, y: 223, scale: 0.72, layer: 45 },
  cushions: { key: "cushions", slot: "main_furniture", x: 195, y: 207, scale: 0.74, layer: 48 },
  fairy_lights: { key: "fairy_lights", slot: "lighting", x: 195, y: 37, scale: 1, layer: 24 },
  flowers: { key: "flowers", slot: "plant", x: 68, y: 222, scale: 0.8, layer: 44 },
};

export function getRoomSceneItem(key: string): RoomSceneItemDefinition | undefined {
  return ROOM_SCENE_ITEMS[key];
}
