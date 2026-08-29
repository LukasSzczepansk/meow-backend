export const DATE_IDEA_CATEGORIES = [
  { key: "dom", label: "W domu" },
  { key: "wyjscie", label: "Wyjście" },
  { key: "jedzenie", label: "Jedzenie" },
  { key: "spacer", label: "Spacer" },
  { key: "weekend", label: "Weekend" },
  { key: "spontaniczne", label: "Spontaniczne" },
  { key: "za_darmo", label: "Bez wydawania" },
] as const;

export type DateIdeaCategory = (typeof DATE_IDEA_CATEGORIES)[number]["key"];

export function isDateIdeaCategory(value: string): value is DateIdeaCategory {
  return DATE_IDEA_CATEGORIES.some((category) => category.key === value);
}
