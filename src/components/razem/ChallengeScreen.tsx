"use client";

import { useEffect, useState } from "react";
import { CatFigure } from "@/components/cats/CatFigure";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Challenge } from "@/lib/content/challenges";

interface ChallengeData {
  challenge: Challenge;
  completed: boolean;
  completedByNickname: string | null;
}

export function ChallengeScreen() {
  const [data, setData] = useState<ChallengeData | null>(null);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  function load() {
    fetch("/api/challenges/today")
      .then((r) => r.json())
      .then(setData);
  }

  useEffect(load, []);

  async function complete() {
    setBusy(true);
    try {
      await fetch("/api/challenges/today", { method: "POST" });
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return <div className="mx-5 h-64 animate-pulse rounded-[22px] bg-[var(--color-surface-muted)]" />;
  }

  if (dismissed && !data.completed) {
    return (
      <div className="px-5">
        <Card className="items-center text-center">
          <p className="text-sm text-[var(--color-ink-soft)]">
            Bez presji — wróćcie do wyzwania, kiedy będziecie mieć ochotę.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-5">
      <Card className="items-center text-center">
        <CatFigure colorVariant="tortoiseshell" pose="curious" size={100} />
        <p className="mt-4 text-lg font-semibold leading-snug text-[var(--color-ink)]">{data.challenge.text}</p>

        {data.completed ? (
          <p className="mt-5 text-sm font-medium text-[var(--color-sage)]">
            Zaliczone{data.completedByNickname ? ` przez ${data.completedByNickname}` : ""} 🐾
          </p>
        ) : (
          <div className="mt-5 flex w-full flex-col gap-2.5">
            <Button onClick={complete} disabled={busy} fullWidth>
              {busy ? "Zapisujemy..." : "Podejmujemy wyzwanie!"}
            </Button>
            <Button variant="ghost" onClick={() => setDismissed(true)}>
              Pomiń wyzwanie
            </Button>
          </div>
        )}
        <p className="mt-3 text-xs font-semibold text-[var(--color-ink-faint)]">+{data.challenge.rewardPaws} 🐾</p>
      </Card>
    </div>
  );
}
