import type { MeowType } from "@/lib/content/meows";

export type CatBehavior = "idle" | "sleep" | "curious" | "stretch" | "play" | "window" | "together" | "greet" | "comfort";
export type DayPart = "morning" | "day" | "sunset" | "night";

const WEIGHTS: Record<string, CatBehavior[]> = {
  ciekawski: ["curious", "window", "curious", "idle", "play", "stretch"],
  psotny: ["play", "play", "curious", "stretch", "idle", "play"],
  "przytulaśny": ["together", "together", "idle", "sleep", "curious", "together"],
  spokojny: ["idle", "window", "sleep", "idle", "curious", "window"],
};

const MEOW_REACTIONS: Partial<Record<MeowType, CatBehavior>> = {
  thinking: "greet",
  love: "together",
  miss: "greet",
  hug: "together",
  together: "greet",
  morning: "stretch",
  night: "sleep",
  here: "comfort",
  understand: "comfort",
  meow: "curious",
};

export function getDayPart(hour: number): DayPart {
  if (hour >= 6 && hour < 10) return "morning";
  if (hour >= 10 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "sunset";
  return "night";
}

export function getMeowReaction(type: string | null | undefined): CatBehavior | null {
  if (!type) return null;
  return MEOW_REACTIONS[type as MeowType] ?? null;
}

export function pickBehavior({ personality, itemKeys, dayPart }: { personality?: string; itemKeys: string[]; dayPart: DayPart }): CatBehavior {
  const base = [...(WEIGHTS[personality ?? "ciekawski"] ?? WEIGHTS.ciekawski)];
  if (dayPart === "night") base.push("sleep", "sleep");
  if (dayPart === "morning") base.push("stretch");
  const hasToy = itemKeys.some((key) => ["yarn", "fish_toy", "box", "scratcher", "tunnel"].includes(key));
  const allowed = base.filter((state) => state !== "play" || hasToy);
  return allowed[Math.floor(Math.random() * allowed.length)] ?? "idle";
}
