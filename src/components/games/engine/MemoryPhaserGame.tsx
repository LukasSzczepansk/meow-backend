"use client";

import { useCallback, useState } from "react";
import { PhaserStage, type PhaserStageFactory } from "@/components/game-engine/PhaserStage";
import { createMeowPhaserConfig } from "@/lib/game-engine/phaser/config";
import { getGamePalette } from "@/lib/game-engine/phaser/theme";

const LABELS = ["ŁAPKA","KŁĘBEK","OKNO","KUBEK","ROŚLINA","KOC","LAMPA","ALBUM"];

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let i=copy.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}

export function MemoryPhaserGame() {
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [seed, setSeed] = useState(0);

  const createGame = useCallback<PhaserStageFactory>((PhaserModule,parent) => {
    const palette = getGamePalette();
    const SceneBase = PhaserModule.Scene as typeof Phaser.Scene;
    const values = shuffled([...LABELS,...LABELS]);
    const onMove = () => setMoves((v)=>v+1);
    const onDone = () => setDone(true);

    class MemoryScene extends SceneBase {
      private open: { container: Phaser.GameObjects.Container; value: string; cover: Phaser.GameObjects.Rectangle; mark: Phaser.GameObjects.Text }[] = [];
      private locked = false;
      private matched = 0;

      create() {
        this.add.text(195, 22, "Znajdź osiem par. Bez timera.", { fontFamily:"Manrope, sans-serif", fontSize:"12px", color:`#${palette.inkSoft.toString(16).padStart(6,"0")}` }).setOrigin(.5,0);
        const w=78,h=92,gap=12,startX=54,startY=92;
        values.forEach((value,index) => {
          const col=index%4,row=Math.floor(index/4); const x=startX+col*(w+gap), y=startY+row*(h+gap);
          const back=this.add.rectangle(0,0,w,h,palette.surface,1).setStrokeStyle(1,palette.ink,.10);
          const label=this.add.text(0,0,value,{fontFamily:"Manrope, sans-serif",fontSize:"10px",fontStyle:"bold",color:`#${palette.ink.toString(16).padStart(6,"0")}`,align:"center",wordWrap:{width:w-12}}).setOrigin(.5);
          const cover=this.add.rectangle(0,0,w,h,palette.surfaceMuted,1).setStrokeStyle(1,palette.ink,.12);
          const mark=this.add.text(0,0,"meow",{fontFamily:"Newsreader, Georgia, serif",fontSize:"17px",color:`#${palette.inkSoft.toString(16).padStart(6,"0")}`}).setOrigin(.5);
          const container=this.add.container(x,y,[back,label,cover,mark]).setSize(w,h).setInteractive({useHandCursor:true});
          container.on("pointerdown",()=>this.flip({container,value,cover,mark}));
        });
      }

      private flip(card:{container:Phaser.GameObjects.Container;value:string;cover:Phaser.GameObjects.Rectangle;mark:Phaser.GameObjects.Text}) {
        if (this.locked || card.cover.alpha===0 || this.open.some(o=>o.container===card.container)) return;
        card.cover.setAlpha(0); card.mark.setAlpha(0); this.open.push(card);
        if (this.open.length<2) return;
        onMove(); this.locked=true;
        const [a,b]=this.open;
        if (a.value===b.value) {
          this.matched+=2; this.open=[]; this.locked=false;
          this.tweens.add({targets:[a.container,b.container],scale:1.035,duration:120,yoyo:true});
          if (this.matched===values.length) { this.time.delayedCall(240,onDone); }
        } else {
          this.time.delayedCall(650,()=>{ a.cover.setAlpha(1); b.cover.setAlpha(1); a.mark.setAlpha(1); b.mark.setAlpha(1); this.open=[]; this.locked=false; });
        }
      }
    }
    return new PhaserModule.Game(createMeowPhaserConfig(PhaserModule,parent,MemoryScene));
  },[]);

  return <div>
    <div className="px-5 pb-3 flex items-center justify-between text-[11px] text-[var(--color-ink-faint)]"><span>{done?"Wszystkie pary odkryte.":`Ruchy: ${moves}`}</span><button type="button" onClick={()=>{setMoves(0);setDone(false);setSeed(v=>v+1)}} className="meow-touch min-h-10 px-2 font-semibold text-[var(--color-ink-soft)]">Nowy układ</button></div>
    <PhaserStage key={seed} createGame={createGame} ariaLabel="Kocie Memory" className="h-[500px]" />
    {done && <p className="mx-5 mt-3 text-[12px] text-[var(--color-ink-soft)]">Gotowe. Karty mogą już odpocząć.</p>}
  </div>;
}
