import "server-only";

/** Zwraca dzisiejszą datę w formacie YYYY-MM-DD (czas serwera). */
export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}
