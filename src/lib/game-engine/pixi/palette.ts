export type PixiPalette = {
  background: number;
  surface: number;
  ink: number;
  inkSoft: number;
  accent: number;
  sage: number;
};

const FALLBACKS: Record<string, string> = {
  "--color-cream": "#f7f4ee",
  "--color-surface": "#fbfaf7",
  "--color-ink": "#292724",
  "--color-ink-soft": "#716c65",
  "--color-dusty-pink": "#c98276",
  "--color-sage": "#8e9c88",
};

export function pixiColor(variable: keyof typeof FALLBACKS) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  const hex = /^#[0-9a-f]{6}$/i.test(raw) ? raw : FALLBACKS[variable];
  return Number.parseInt(hex.slice(1), 16);
}

export function getPixiPalette(): PixiPalette {
  return {
    background: pixiColor("--color-cream"),
    surface: pixiColor("--color-surface"),
    ink: pixiColor("--color-ink"),
    inkSoft: pixiColor("--color-ink-soft"),
    accent: pixiColor("--color-dusty-pink"),
    sage: pixiColor("--color-sage"),
  };
}
