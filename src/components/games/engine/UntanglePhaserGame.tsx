"use client";

import { useCallback, useState } from "react";
import { PhaserStage, type PhaserStageFactory } from "@/components/game-engine/PhaserStage";
import { createMeowPhaserConfig } from "@/lib/game-engine/phaser/config";
import { getGamePalette } from "@/lib/game-engine/phaser/theme";

const START = [
  [70, 86], [320, 92], [84, 250], [312, 244], [105, 410], [292, 405],
] as const;
const EDGES = [[0,3],[3,4],[4,1],[1,2],[2,5],[5,0],[0,1],[2,3],[4,5]] as const;

function orientation(a: readonly number[], b: readonly number[], c: readonly number[]) {
  return (b[1]-a[1])*(c[0]-b[0]) - (b[0]-a[0])*(c[1]-b[1]);
}

function intersects(a: readonly number[], b: readonly number[], c: readonly number[], d: readonly number[]) {
  return orientation(a,b,c) * orientation(a,b,d) < 0 && orientation(c,d,a) * orientation(c,d,b) < 0;
}

function countCrossings(points: readonly (readonly number[])[]) {
  let total = 0;
  for (let i=0;i<EDGES.length;i++) {
    const [a,b] = EDGES[i];
    for (let j=i+1;j<EDGES.length;j++) {
      const [c,d] = EDGES[j];
      if (a===c || a===d || b===c || b===d) continue;
      if (intersects(points[a], points[b], points[c], points[d])) total++;
    }
  }
  return total;
}

export function UntanglePhaserGame() {
  const [crossings, setCrossings] = useState(() => countCrossings(START));
  const [solved, setSolved] = useState(false);
  const [seed, setSeed] = useState(0);

  const createGame = useCallback<PhaserStageFactory>((PhaserModule, parent) => {
    const palette = getGamePalette();
    const SceneBase = PhaserModule.Scene as typeof Phaser.Scene;
    const onCrossings = (value: number) => {
      setCrossings(value);
      if (value === 0) setSolved(true);
    };

    class UntangleScene extends SceneBase {
      private lineGraphics!: Phaser.GameObjects.Graphics;
      private nodes: Phaser.GameObjects.Arc[] = [];
      private dots: Phaser.GameObjects.Arc[] = [];

      create() {
        this.lineGraphics = this.add.graphics();
        this.add.text(195, 24, "Przesuwaj węzły, aż nici przestaną się przecinać.", {
          fontFamily: "Manrope, sans-serif", fontSize: "12px", color: `#${palette.inkSoft.toString(16).padStart(6,"0")}`,
        }).setOrigin(0.5,0);

        START.forEach(([x,y], index) => {
          const node = this.add.circle(x, y, 18, palette.surface, 1).setStrokeStyle(3, index % 2 ? palette.sage : palette.accent, .82);
          node.setInteractive({ draggable: true, useHandCursor: true });
          this.input.setDraggable(node);
          const dot = this.add.circle(x, y, 4.5, index % 2 ? palette.sage : palette.accent, 1);
          this.nodes.push(node);
          this.dots.push(dot);
        });

        this.input.on("drag", (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Arc, dragX: number, dragY: number) => {
          gameObject.x = PhaserModule.Math.Clamp(dragX, 30, 360);
          gameObject.y = PhaserModule.Math.Clamp(dragY, 64, 466);
          const index = this.nodes.indexOf(gameObject);
          if (index >= 0) this.dots[index].setPosition(gameObject.x, gameObject.y);
          this.drawLines();
        });
        this.input.on("dragend", () => onCrossings(this.currentCrossings()));
        this.drawLines();
      }

      private currentPoints() {
        return this.nodes.map((n) => [n.x,n.y] as const);
      }

      private currentCrossings() { return countCrossings(this.currentPoints()); }

      private drawLines() {
        this.lineGraphics.clear();
        const bad = this.currentCrossings() > 0;
        this.lineGraphics.lineStyle(5, bad ? palette.accent : palette.sage, .35);
        for (const [a,b] of EDGES) this.lineGraphics.lineBetween(this.nodes[a].x, this.nodes[a].y, this.nodes[b].x, this.nodes[b].y);
      }
    }

    return new PhaserModule.Game(createMeowPhaserConfig(PhaserModule, parent, UntangleScene));
  }, []);

  return (
    <div>
      <div className="px-5 pb-3 flex items-center justify-between text-[11px] text-[var(--color-ink-faint)]">
        <span>{solved ? "Kłębek jest rozplątany." : `Przecięcia: ${crossings}`}</span>
        <button type="button" onClick={() => { setSolved(false); setCrossings(countCrossings(START)); setSeed((v)=>v+1); }} className="meow-touch min-h-10 px-2 font-semibold text-[var(--color-ink-soft)]">Nowy kłębek</button>
      </div>
      <PhaserStage key={seed} createGame={createGame} ariaLabel="Interaktywna gra Rozplącz kłębek" className="h-[500px]" />
      {solved && <p className="mx-5 mt-3 border-l-2 border-[var(--color-sage)]/60 pl-3 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">Gotowe. Nic więcej nie trzeba robić.</p>}
    </div>
  );
}
