import "server-only";

export const APP_TIME_ZONE = process.env.MEOW_TIME_ZONE?.trim() || "Europe/Warsaw";

/** Zwraca dzisiejszą datę w formacie YYYY-MM-DD w naszej wspólnej strefie. */
export function todayDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
