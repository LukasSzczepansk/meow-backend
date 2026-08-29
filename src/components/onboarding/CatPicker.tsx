"use client";

import { CatFigure } from "@/components/cats/CatFigure";
import { Chip } from "@/components/ui/Chip";
import {
  CAT_COLOR_LABELS,
  CAT_COLOR_ORDER,
  CAT_PERSONALITY_LABELS,
  CAT_PERSONALITY_ORDER,
  type CatColorVariant,
  type CatFurLength,
  type CatPersonality,
} from "@/lib/content/cats";

export interface CatChoiceState {
  colorVariant: CatColorVariant;
  furLength: CatFurLength;
  personality: CatPersonality;
}

export function CatPicker({
  value,
  onChange,
}: {
  value: CatChoiceState;
  onChange: (next: CatChoiceState) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[var(--color-cream-soft)]">
          <CatFigure
            colorVariant={value.colorVariant}
            furLength={value.furLength}
            pose="curious"
            size={112}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--color-ink-soft)]">Umaszczenie</p>
        <div className="grid grid-cols-4 gap-2.5">
          {CAT_COLOR_ORDER.map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => onChange({ ...value, colorVariant: variant })}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-2 transition-all duration-200 active:scale-95 ${
                value.colorVariant === variant
                  ? "border-[var(--color-ink)] bg-[var(--color-cream-soft)]"
                  : "border-[var(--color-ink)]/10 bg-[var(--color-surface)]"
              }`}
              aria-label={CAT_COLOR_LABELS[variant]}
            >
              <CatFigure colorVariant={variant} animated={false} size={38} />
              <span className="text-[10px] font-medium text-[var(--color-ink-soft)]">
                {CAT_COLOR_LABELS[variant]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--color-ink-soft)]">Sierść</p>
        <div className="flex gap-2.5">
          <Chip selected={value.furLength === "short"} onClick={() => onChange({ ...value, furLength: "short" })}>
            Krótkowłosy
          </Chip>
          <Chip selected={value.furLength === "long"} onClick={() => onChange({ ...value, furLength: "long" })}>
            Długowłosy
          </Chip>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--color-ink-soft)]">Charakter</p>
        <div className="grid grid-cols-2 gap-2.5">
          {CAT_PERSONALITY_ORDER.map((personality) => (
            <Chip
              key={personality}
              selected={value.personality === personality}
              onClick={() => onChange({ ...value, personality })}
              className="text-left"
            >
              {CAT_PERSONALITY_LABELS[personality]}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
