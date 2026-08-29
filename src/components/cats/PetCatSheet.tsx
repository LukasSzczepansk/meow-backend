"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CatFigure } from "@/components/cats/CatFigure";
import type { CatAccessory, CatColorVariant, CatFurLength } from "@/lib/content/cats";

export function PetCatSheet({
  open,
  onClose,
  cat,
}: {
  open: boolean;
  onClose: () => void;
  cat: { name: string; colorVariant: CatColorVariant; furLength: CatFurLength; accessory?: CatAccessory | null };
}) {
  const [purr, setPurr] = useState(false);

  return (
    <BottomSheet open={open} onClose={() => { setPurr(false); onClose(); }} title={`Chwila z ${cat.name}`} description="Przesuń palcem po kocie. Bez punktów, bez celu.">
      <div
        className="relative flex min-h-[250px] touch-pan-y select-none items-center justify-center overflow-hidden rounded-[16px] bg-[var(--color-cream-soft)]/65"
        onPointerMove={(event) => {
          if (event.buttons === 1 || event.pointerType === "touch") setPurr(true);
        }}
        onPointerDown={() => setPurr(true)}
        onPointerUp={() => setTimeout(() => setPurr(false), 900)}
        onPointerLeave={() => setPurr(false)}
      >
        <motion.div animate={purr ? { scale: [1, 1.015, 1] } : { y: [0, -1, 0] }} transition={{ duration: purr ? 0.45 : 4.5, repeat: Infinity }}>
          <CatFigure colorVariant={cat.colorVariant} furLength={cat.furLength} accessory={cat.accessory} pose={purr ? "sleep" : "sit"} size={190} />
        </motion.div>
        <p className="absolute bottom-4 text-[12px] text-[var(--color-ink-faint)]">{purr ? "mrrau…" : "pogłaszcz delikatnie"}</p>
      </div>
    </BottomSheet>
  );
}
