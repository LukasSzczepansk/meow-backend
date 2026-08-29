export type GamePalette = {
  background: number;
  surface: number;
  surfaceMuted: number;
  ink: number;
  inkSoft: number;
  accent: number;
  sage: number;
};

function cssHex(variable: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

export function numberFromHex(hex: string) {
  return Number.parseInt(hex.replace("#", ""), 16);
}

export function getGamePalette(): GamePalette {
  return {
    background: numberFromHex(cssHex("--color-cream", "#f7f4ee")),
    surface: numberFromHex(cssHex("--color-surface", "#fbfaf7")),
    surfaceMuted: numberFromHex(cssHex("--color-surface-muted", "#eee9e1")),
    ink: numberFromHex(cssHex("--color-ink", "#292724")),
    inkSoft: numberFromHex(cssHex("--color-ink-soft", "#716c65")),
    accent: numberFromHex(cssHex("--color-dusty-pink", "#c98276")),
    sage: numberFromHex(cssHex("--color-sage", "#8e9c88")),
  };
}
