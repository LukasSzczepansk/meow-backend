"use client";

import { useEffect, useRef, useState } from "react";

type PixiModule = typeof import("pixi.js");

type Cleanup = void | (() => void);

export function PixiStage({
  setup,
  ariaLabel,
  className = "",
  width = 390,
  height = 500,
}: {
  setup: (PIXI: PixiModule, app: import("pixi.js").Application) => Cleanup | Promise<Cleanup>;
  ariaLabel: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const setupRef = useRef(setup);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setupRef.current = setup;
  }, [setup]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let cleanup: Cleanup;
    let app: import("pixi.js").Application | null = null;

    void import("pixi.js")
      .then(async (PIXI) => {
        if (cancelled) return;
        app = new PIXI.Application();
        await app.init({
          width,
          height,
          antialias: true,
          backgroundAlpha: 0,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        });
        if (cancelled) {
          app.destroy(true);
          return;
        }
        app.canvas.style.width = "100%";
        app.canvas.style.height = "auto";
        app.canvas.style.touchAction = "manipulation";
        host.appendChild(app.canvas);
        cleanup = await setupRef.current(PIXI, app);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (typeof cleanup === "function") cleanup();
      app?.destroy(true, { children: true });
      host.replaceChildren();
    };
  }, [width, height]);

  if (failed) {
    return <div className="px-5 py-8 text-center text-[13px] text-[var(--color-ink-soft)]">Nie udało się uruchomić animacji.</div>;
  }

  return <div ref={hostRef} role="application" aria-label={ariaLabel} className={`w-full ${className}`} />;
}
