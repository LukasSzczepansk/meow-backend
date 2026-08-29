export interface MoodOption {
  key: string;
  emoji: string;
  label: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { key: "great", emoji: "😄", label: "świetnie" },
  { key: "good", emoji: "🙂", label: "dobrze" },
  { key: "neutral", emoji: "😐", label: "neutralnie" },
  { key: "low", emoji: "😔", label: "słabo" },
  { key: "upset", emoji: "😡", label: "jestem zdenerwowany" },
  { key: "tired", emoji: "😴", label: "jestem zmęczony" },
];

export const NEED_OPTIONS: MoodOption[] = [
  { key: "closeness", emoji: "❤️", label: "bliskości" },
  { key: "support", emoji: "🫂", label: "wsparcia" },
  { key: "talk", emoji: "💬", label: "rozmowy" },
  { key: "calm", emoji: "🌿", label: "spokoju" },
  { key: "fun", emoji: "😂", label: "zabawy" },
  { key: "space", emoji: "🛋", label: "chwili dla siebie" },
];

export function moodLabel(key: string | null): string | null {
  return MOOD_OPTIONS.find((m) => m.key === key)?.label ?? null;
}

export function needLabel(key: string | null): string | null {
  return NEED_OPTIONS.find((n) => n.key === key)?.label ?? null;
}
