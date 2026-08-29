import type { RoomType } from "@/lib/content/shop";

export const ROOM_BACKGROUND: Record<RoomType, string> = {
  salon: "linear-gradient(180deg, #f6e9d8 0%, #eddcc3 100%)",
  kuchnia: "linear-gradient(180deg, #f3e3d2 0%, #e8d3b8 100%)",
  sypialnia: "linear-gradient(180deg, #ece0e0 0%, #ddc9cf 100%)",
  balkon: "linear-gradient(180deg, #e7ecdd 0%, #d3ddc4 100%)",
  ogrod: "linear-gradient(180deg, #e2e9d4 0%, #cdd9b8 100%)",
  pokoj_gier: "linear-gradient(180deg, #ead9e6 0%, #d9c1d6 100%)",
};
