"use client";

import { useEffect, useRef, useState } from "react";

type PhaserNamespace = typeof import("phaser");
type DestroyableGame = { destroy(removeCanvas?: boolean): void };

export type PhaserStageFactory = (PhaserModule: PhaserNamespace, parent: HTMLDivElement) => DestroyableGame;

export function PhaserStage({
  createGame,
  className = "",
  ariaLabel,
}: {
  createGame: PhaserStageFactory;
  className?: string;
  ariaLabel: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const factoryRef = useRef(createGame);
  const [failed, setFailed] = useState(false);

  useEffect(() => { factoryRef.current = createGame; }, [createGame]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let game: DestroyableGame | null = null;

    void import("phaser")
      .then((module) => {
        if (cancelled) return;
        game = factoryRef.current(module, host);
      })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => {
      cancelled = true;
      game?.destroy(true);
      host.replaceChildren();
    };
  }, []);

  if (failed) {
    return <div className="mx-5 rounded-[14px] border border-[var(--color-ink)]/10 px-4 py-8 text-center text-[13px] text-[var(--color-ink-soft)]">Nie udało się uruchomić silnika gry. Sprawdź, czy Phaser został zainstalowany.</div>;
  }

  return <div ref={hostRef} role="application" aria-label={ariaLabel} className={`meow-game-stage mx-auto w-full max-w-[430px] overflow-hidden ${className}`} />;
}
