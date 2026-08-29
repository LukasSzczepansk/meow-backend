import "server-only";
import { CAT_COLOR_ORDER, CAT_PERSONALITY_ORDER, type CatAccessory, type CatFurLength } from "@/lib/content/cats";
import { MOOD_OPTIONS, NEED_OPTIONS } from "@/lib/content/checkins";
import type { CatChoice } from "@/lib/server/onboarding";

const FUR_LENGTHS = new Set<CatFurLength>(["short", "long"]);
const ACCESSORIES = new Set<CatAccessory>(["bow", "collar", "bandana", "hat", "sweater"]);
const COLORS = new Set<string>(CAT_COLOR_ORDER);
const PERSONALITIES = new Set<string>(CAT_PERSONALITY_ORDER);
const MOODS = new Set(MOOD_OPTIONS.map((item) => item.key));
const NEEDS = new Set(NEED_OPTIONS.map((item) => item.key));

export function normalizeCatChoice(value: unknown): CatChoice | null {
  if (!value || typeof value !== "object") return null;
  const cat = value as Record<string, unknown>;
  if (typeof cat.colorVariant !== "string" || !COLORS.has(cat.colorVariant)) return null;
  if (typeof cat.furLength !== "string" || !FUR_LENGTHS.has(cat.furLength as CatFurLength)) return null;
  if (typeof cat.personality !== "string" || !PERSONALITIES.has(cat.personality)) return null;

  const accessory = cat.accessory;
  if (accessory != null && (typeof accessory !== "string" || !ACCESSORIES.has(accessory as CatAccessory))) return null;

  return {
    colorVariant: cat.colorVariant,
    furLength: cat.furLength,
    personality: cat.personality,
    accessory: typeof accessory === "string" ? accessory : null,
  };
}

export function isValidMood(value: unknown): value is string | null | undefined {
  return value == null || (typeof value === "string" && MOODS.has(value));
}

export function isValidNeed(value: unknown): value is string | null | undefined {
  return value == null || (typeof value === "string" && NEEDS.has(value));
}

export function isValidVisibility(value: unknown): value is "private" | "shared" | undefined {
  return value === undefined || value === "private" || value === "shared";
}
