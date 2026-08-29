export type RoomType =
  | "salon"
  | "kuchnia"
  | "sypialnia"
  | "balkon"
  | "ogrod"
  | "pokoj_gier";

export type RoomSlotKey =
  | "wall_main"
  | "wall_secondary"
  | "main_furniture"
  | "side_left"
  | "side_right"
  | "floor_center"
  | "floor_left"
  | "floor_right"
  | "lighting"
  | "plant"
  | "cat_bed"
  | "cat_toy";

export interface RoomDefinition {
  level: number;
  type: RoomType;
  label: string;
  unlockAt: number;
  description: string;
}

export const ROOMS: RoomDefinition[] = [
  { level: 1, type: "salon", label: "Salon", unlockAt: 0, description: "Wasz pierwszy wspólny kąt." },
  { level: 2, type: "kuchnia", label: "Kuchnia", unlockAt: 250, description: "Miejsce na wspólne śniadania." },
  { level: 3, type: "sypialnia", label: "Sypialnia", unlockAt: 600, description: "Spokojny kąt na odpoczynek." },
  { level: 4, type: "balkon", label: "Balkon", unlockAt: 1100, description: "Trochę świeżego powietrza." },
  { level: 5, type: "ogrod", label: "Ogród", unlockAt: 1800, description: "Przestrzeń do zabawy na dworze." },
  { level: 6, type: "pokoj_gier", label: "Pokój gier", unlockAt: 2700, description: "Dla waszych wspólnych szaleństw." },
];

export type ShopCategory = "meble" | "koci_sprzet" | "dekoracje";

export interface ShopItem {
  key: string;
  name: string;
  category: ShopCategory;
  room: RoomType;
  slot: RoomSlotKey;
  cost: number;
  description: string;
}

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  meble: "Meble",
  koci_sprzet: "Kocie",
  dekoracje: "Dekoracje",
};

export const SHOP_ITEMS: ShopItem[] = [
  { key: "sofa", name: "Miękka sofa", category: "meble", room: "salon", slot: "main_furniture", cost: 180, description: "Ciepłe miejsce, na którym koty czasem przysną." },
  { key: "rug", name: "Owalny dywan", category: "meble", room: "salon", slot: "floor_center", cost: 120, description: "Spokojny wzór pod wspólny kąt." },
  { key: "lamp", name: "Lampa stojąca", category: "meble", room: "salon", slot: "lighting", cost: 90, description: "Wieczorem daje miękkie, ciepłe światło." },
  { key: "shelf", name: "Dębowa półka", category: "meble", room: "salon", slot: "side_right", cost: 110, description: "Miejsce na drobne rzeczy i późniejsze kolekcje." },
  { key: "plant", name: "Duża roślina", category: "meble", room: "salon", slot: "plant", cost: 80, description: "Trochę zieleni przy oknie." },
  { key: "fireplace", name: "Mały kominek", category: "meble", room: "salon", slot: "side_left", cost: 260, description: "Najlepszy na spokojne wieczory." },
  { key: "gramophone", name: "Gramofon", category: "meble", room: "salon", slot: "side_right", cost: 220, description: "Drobny ukłon w stronę wspólnej muzyki." },

  { key: "scratcher", name: "Drapak", category: "koci_sprzet", room: "salon", slot: "side_right", cost: 100, description: "Kot może czasem podejść i z niego skorzystać." },
  { key: "fish_toy", name: "Rybka", category: "koci_sprzet", room: "salon", slot: "cat_toy", cost: 55, description: "Mała zabawka pozostawiona na podłodze." },
  { key: "yarn", name: "Kłębek", category: "koci_sprzet", room: "salon", slot: "cat_toy", cost: 45, description: "Klasyk. Czasem wywołuje kocie zamieszanie." },
  { key: "tunnel", name: "Tunel", category: "koci_sprzet", room: "salon", slot: "floor_left", cost: 130, description: "Do chowania się i krótkich gonitw." },
  { key: "box", name: "Karton", category: "koci_sprzet", room: "salon", slot: "floor_right", cost: 35, description: "Najprostsza rzecz i oczywiście jedna z najlepszych." },
  { key: "hammock", name: "Hamak", category: "koci_sprzet", room: "sypialnia", slot: "cat_bed", cost: 150, description: "Do spokojnych drzemek." },
  { key: "fountain", name: "Fontanna", category: "koci_sprzet", room: "kuchnia", slot: "side_left", cost: 160, description: "Subtelny element kociej części kuchni." },

  { key: "painting", name: "Pejzaż", category: "dekoracje", room: "salon", slot: "wall_main", cost: 95, description: "Spokojna ilustracja na głównej ścianie." },
  { key: "photo_frame", name: "Ramka na wspomnienie", category: "dekoracje", room: "salon", slot: "wall_secondary", cost: 90, description: "Miejsce na wizualny ślad Waszej historii." },
  { key: "candles", name: "Świece", category: "dekoracje", room: "sypialnia", slot: "lighting", cost: 70, description: "Ciepłe światło bez przesady." },
  { key: "cushions", name: "Poduszki", category: "dekoracje", room: "salon", slot: "main_furniture", cost: 75, description: "Dodatek do wspólnego kąta." },
  { key: "fairy_lights", name: "Lampki", category: "dekoracje", room: "balkon", slot: "lighting", cost: 100, description: "Delikatne światło na wieczór." },
  { key: "flowers", name: "Kwiaty", category: "dekoracje", room: "ogrod", slot: "plant", cost: 80, description: "Odrobina koloru w ogrodzie." },
];

export function getRoomForLevel(level: number): RoomDefinition {
  return ROOMS.find((room) => room.level === level) ?? ROOMS[0];
}

export function getUnlockedRooms(lifetimePoints: number): RoomDefinition[] {
  return ROOMS.filter((room) => lifetimePoints >= room.unlockAt);
}

export function getNextRoom(lifetimePoints: number): RoomDefinition | null {
  return ROOMS.find((room) => lifetimePoints < room.unlockAt) ?? null;
}

export function getShopItem(key: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.key === key);
}
