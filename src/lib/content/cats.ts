export type CatColorVariant =
  | "white"
  | "black"
  | "ginger"
  | "gray"
  | "tabby"
  | "blackwhite"
  | "tortoiseshell";

export type CatFurLength = "short" | "long";

export type CatPersonality = "spokojny" | "psotny" | "przytulaśny" | "ciekawski";

export type CatAccessory = "bow" | "collar" | "bandana" | "hat" | "sweater";

export const CAT_COLOR_LABELS: Record<CatColorVariant, string> = {
  white: "Biały",
  black: "Czarny",
  ginger: "Rudy",
  gray: "Szary",
  tabby: "Bury",
  blackwhite: "Biało-czarny",
  tortoiseshell: "Szylkretowy",
};

export const CAT_COLOR_PALETTE: Record<CatColorVariant, { base: string; shade: string; belly: string }> = {
  white: { base: "#F7F1E7", shade: "#E4D9C6", belly: "#FFFBF3" },
  black: { base: "#4A423E", shade: "#332C29", belly: "#7C6F68" },
  ginger: { base: "#DE9A61", shade: "#C97D3F", belly: "#F3D4AC" },
  gray: { base: "#A9A6A0", shade: "#8B8781", belly: "#D8D4CB" },
  tabby: { base: "#B08A63", shade: "#8C6A48", belly: "#E6CBA8" },
  blackwhite: { base: "#413934", shade: "#2B2624", belly: "#F6EFE3" },
  tortoiseshell: { base: "#8C5A3C", shade: "#41332A", belly: "#E3B98A" },
};

export const CAT_PERSONALITY_LABELS: Record<CatPersonality, string> = {
  spokojny: "Spokojny odkrywca",
  psotny: "Psotny łobuz",
  przytulaśny: "Przytulaśny maruder",
  ciekawski: "Ciekawski włóczykij",
};

export const CAT_ACCESSORY_LABELS: Record<CatAccessory, string> = {
  bow: "Kokardka",
  collar: "Obroża",
  bandana: "Bandana",
  hat: "Czapeczka",
  sweater: "Sweterek",
};

export const CAT_COLOR_ORDER: CatColorVariant[] = [
  "white",
  "black",
  "ginger",
  "gray",
  "tabby",
  "blackwhite",
  "tortoiseshell",
];

export const CAT_PERSONALITY_ORDER: CatPersonality[] = [
  "spokojny",
  "psotny",
  "przytulaśny",
  "ciekawski",
];
