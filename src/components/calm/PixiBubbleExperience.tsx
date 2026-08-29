"use client";

import { useCallback, useRef, useState } from "react";
import { PixiStage } from "@/components/game-engine/PixiStage";
import { getPixiPalette } from "@/lib/game-engine/pixi/palette";
import { logCalmActivity } from "@/lib/client/calm";

export function PixiBubbleExperience() {
  const [left, setLeft] = useState(20);
  const [seed, setSeed] = useState(0);
  const loggedRef = useRef(false);

  const setup = useCallback(async (PIXI: typeof import("pixi.js"), app: import("pixi.js").Application) => {
    const palette = getPixiPalette();
    const bubbleObjects: { g: import("pixi.js").Graphics; speed: number; phase: number }[] = [];
    let active = 20;

    const floor = new PIXI.Graphics().rect(0, 410, 390, 90).fill({ color: palette.surface, alpha: .55 });
    app.stage.addChild(floor);

    for (let i = 0; i < 20; i += 1) {
      const radius = 15 + ((i * 7 + seed * 3) % 14);
      const g = new PIXI.Graphics()
        .circle(0, 0, radius)
        .fill({ color: i % 3 === 0 ? palette.accent : palette.sage, alpha: .12 })
        .stroke({ color: palette.ink, alpha: .13, width: 1 });
      const shine = new PIXI.Graphics().ellipse(-radius * .28, -radius * .3, radius * .18, radius * .28).fill({ color: 0xffffff, alpha: .28 });
      g.addChild(shine);
      g.x = 28 + ((i * 71 + seed * 31) % 334);
      g.y = 55 + ((i * 97 + seed * 17) % 320);
      g.eventMode = "static";
      g.cursor = "pointer";
      g.on("pointertap", () => {
        if (g.destroyed) return;
        active -= 1;
        setLeft(active);
        const ring = new PIXI.Graphics().circle(g.x, g.y, radius).stroke({ color: palette.sage, alpha: .28, width: 2 });
        app.stage.addChild(ring);
        let life = 0;
        const ringTick = (ticker: import("pixi.js").Ticker) => {
          life += ticker.deltaMS;
          ring.scale.set(1 + life / 650);
          ring.alpha = Math.max(0, 1 - life / 360);
          if (life >= 380) { app.ticker.remove(ringTick); ring.destroy(); }
        };
        app.ticker.add(ringTick);
        g.destroy({ children: true });
        if (active === 0 && !loggedRef.current) {
          loggedRef.current = true;
          void logCalmActivity("bubbles");
        }
      });
      app.stage.addChild(g);
      bubbleObjects.push({ g, speed: .018 + (i % 5) * .003, phase: i * .7 });
    }

    let elapsed = 0;
    const tick = (ticker: import("pixi.js").Ticker) => {
      elapsed += ticker.deltaMS;
      for (const item of bubbleObjects) {
        if (item.g.destroyed) continue;
        item.g.y -= item.speed * ticker.deltaMS;
        item.g.x += Math.sin(elapsed / 900 + item.phase) * .035 * ticker.deltaMS;
        if (item.g.y < 30) item.g.y = 405;
      }
    };
    app.ticker.add(tick);
    return () => app.ticker.remove(tick);
  }, [seed]);

  return <div>
    <div className="px-5 pb-3 flex items-center justify-between text-[11px] text-[var(--color-ink-faint)]"><span>{left === 0 ? "Cicho." : `${left} baniek jeszcze pływa`}</span><button type="button" onClick={() => { loggedRef.current = false; setLeft(20); setSeed(v => v + 1); }} className="meow-touch min-h-10 px-2 font-semibold text-[var(--color-ink-soft)]">Nowe bańki</button></div>
    <PixiStage key={seed} setup={setup} ariaLabel="Spokojna scena z bańkami" className="mx-auto max-w-[430px] overflow-hidden rounded-[22px] border border-[var(--color-ink)]/10 bg-[var(--color-surface)]" />
  </div>;
}
