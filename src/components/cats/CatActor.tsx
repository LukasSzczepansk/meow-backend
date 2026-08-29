"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CatFigure } from "@/components/cats/CatFigure";
import { pickBehavior, type CatBehavior, type DayPart } from "@/lib/cats/behavior";
import type { CatAccessory, CatColorVariant, CatFurLength } from "@/lib/content/cats";

export function CatActor({
  cat,
  flip,
  size,
  availableItemKeys,
  forceTogether = false,
  reaction = null,
  dayPart = "day",
}: {
  cat: {
    colorVariant: CatColorVariant;
    furLength: CatFurLength;
    accessory?: CatAccessory | null;
    personality?: string;
  };
  flip?: boolean;
  size: number;
  availableItemKeys: string[];
  forceTogether?: boolean;
  reaction?: CatBehavior | null;
  dayPart?: DayPart;
}) {
  const [behavior, setBehavior] = useState<CatBehavior>(forceTogether ? "together" : "idle");
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    const systemReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const appMotionOff = localStorage.getItem("meow:motion") === "off";
    return Boolean(systemReduced || appMotionOff);
  }, []);

  useEffect(() => {
    if (reaction) {
      const timer = window.setTimeout(() => setBehavior(reaction), 0);
      return () => window.clearTimeout(timer);
    }
    if (forceTogether) {
      const timer = window.setTimeout(() => setBehavior("together"), 0);
      return () => window.clearTimeout(timer);
    }
    if (reducedMotion) return;

    let timeout: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setBehavior(pickBehavior({ personality: cat.personality, itemKeys: availableItemKeys, dayPart }));
      timeout = setTimeout(cycle, 18_000 + Math.random() * 18_000);
    };
    timeout = setTimeout(cycle, 8_000 + Math.random() * 10_000);
    return () => clearTimeout(timeout);
  }, [availableItemKeys, cat.personality, dayPart, forceTogether, reaction, reducedMotion]);

  const pose = behavior === "sleep" ? "sleep" : ["curious", "window", "play", "greet", "comfort"].includes(behavior) ? "curious" : "sit";

  const movement = (() => {
    if (behavior === "stretch") return { scaleY: [1, 0.95, 1], scaleX: [1, 1.035, 1], y: [0, 2, 0] };
    if (behavior === "play") return { x: [0, flip ? -7 : 7, 0], y: [0, -3, 0], rotate: [0, flip ? -2 : 2, 0] };
    if (behavior === "greet") return { x: [0, flip ? 8 : -8, 0], y: [0, -1, 0] };
    if (behavior === "together" || behavior === "comfort") return { x: [0, flip ? 5 : -5], y: [0, -1, 0] };
    if (behavior === "sleep") return { y: [0, 1, 0], scale: [1, 0.995, 1] };
    return { y: [0, -1.5, 0] };
  })();

  return (
    <motion.div
      animate={reducedMotion ? undefined : movement}
      transition={{ duration: behavior === "play" ? 1.6 : behavior === "greet" ? 1.9 : 4.8, repeat: behavior === "together" || behavior === "comfort" ? 0 : Infinity, ease: "easeInOut" }}
      data-behavior={behavior}
    >
      <CatFigure
        colorVariant={cat.colorVariant}
        furLength={cat.furLength}
        accessory={cat.accessory}
        pose={pose}
        flip={flip}
        size={size}
        animated={!reducedMotion}
      />
    </motion.div>
  );
}
