export const MEOW_TYPES = [
  { key: "thinking", label: "Myślę o Tobie", reaction: "greet" },
  { key: "love", label: "Kocham Cię", reaction: "together" },
  { key: "miss", label: "Tęsknię", reaction: "greet" },
  { key: "hug", label: "Przytulas?", reaction: "together" },
  { key: "together", label: "Chodź coś zrobimy", reaction: "greet" },
  { key: "morning", label: "Dzień dobry", reaction: "stretch" },
  { key: "night", label: "Dobranoc", reaction: "sleep" },
  { key: "here", label: "Jestem obok", reaction: "comfort" },
  { key: "understand", label: "Rozumiem", reaction: "comfort" },
  { key: "meow", label: "Miau", reaction: "curious" },
] as const;

export type MeowType = (typeof MEOW_TYPES)[number]["key"];

export function getMeowType(key: string) {
  return MEOW_TYPES.find((item) => item.key === key) ?? null;
}
