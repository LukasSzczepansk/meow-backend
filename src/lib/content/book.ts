export type BookCategoryKey =
  | "wspieranie"
  | "nie_pomaga"
  | "lubie"
  | "nie_lubie"
  | "uspokaja"
  | "stresuje"
  | "marzenia"
  | "plany"
  | "wazne"
  | "male_rzeczy";

export const BOOK_CATEGORIES: { key: BookCategoryKey; label: string }[] = [
  { key: "wspieranie", label: "Pomaga mi" },
  { key: "nie_pomaga", label: "Nie pomaga mi" },
  { key: "lubie", label: "Lubię" },
  { key: "nie_lubie", label: "Nie lubię" },
  { key: "uspokaja", label: "Uspokaja mnie" },
  { key: "stresuje", label: "Stresuje mnie" },
  { key: "marzenia", label: "Marzę o" },
  { key: "plany", label: "Chciałbym kiedyś" },
  { key: "wazne", label: "Ważne dla mnie" },
  { key: "male_rzeczy", label: "Małe rzeczy o mnie" },
];

export function bookCategoryLabel(key: string): string {
  return BOOK_CATEGORIES.find((category) => category.key === key)?.label ?? key;
}

export function isBookCategoryKey(value: string): value is BookCategoryKey {
  return BOOK_CATEGORIES.some((category) => category.key === value);
}
