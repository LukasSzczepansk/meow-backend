"use client";

import { useCallback, useState } from "react";
import { PhaserStage, type PhaserStageFactory } from "@/components/game-engine/PhaserStage";
import { createMeowPhaserConfig } from "@/lib/game-engine/phaser/config";
import { getGamePalette } from "@/lib/game-engine/phaser/theme";

const POINTS = [
  {n:1,x:70,y:105},{n:2,x:300,y:95},{n:3,x:88,y:250},{n:4,x:302,y:260},
  {n:1,x:312,y:418},{n:2,x:78,y:405},{n:3,x:270,y:335},{n:4,x:122,y:330},
];

export function ConnectPawsPhaserGame() {
  const [connected,setConnected]=useState(0); const [message,setMessage]=useState("Dotknij dwóch łapek z tym samym numerem."); const [seed,setSeed]=useState(0);
  const createGame=useCallback<PhaserStageFactory>((PhaserModule,parent)=>{
    const palette=getGamePalette();
    const SceneBase = PhaserModule.Scene as typeof Phaser.Scene;
    class Scene extends SceneBase {
      private chosen:number|null=null; private lines:{a:number;b:number}[]=[]; private graphics!:Phaser.GameObjects.Graphics;
      create(){
        this.graphics=this.add.graphics();
        this.add.text(195,22,"Połącz łapki z tym samym numerem.",{fontFamily:"Manrope, sans-serif",fontSize:"12px",color:`#${palette.inkSoft.toString(16).padStart(6,"0")}`}).setOrigin(.5,0);
        POINTS.forEach((p,i)=>{
          const c=this.add.circle(p.x,p.y,22,palette.surface,1).setStrokeStyle(3,i%2?palette.sage:palette.accent,.75).setInteractive({useHandCursor:true});
          this.add.text(p.x,p.y,String(p.n),{fontFamily:"Manrope, sans-serif",fontSize:"14px",fontStyle:"bold",color:`#${palette.ink.toString(16).padStart(6,"0")}`}).setOrigin(.5);
          c.on("pointerdown",()=>this.choose(i));
        }); this.draw();
      }
      private choose(index:number){
        if(this.lines.some(l=>l.a===index||l.b===index)) return;
        if(this.chosen===null){this.chosen=index;setMessage(`Wybrana łapka ${POINTS[index].n}. Znajdź jej parę.`);return;}
        const first=this.chosen; this.chosen=null;
        if(POINTS[first].n!==POINTS[index].n){setMessage("Te łapki mają różne numery.");return;}
        const candidate={a:first,b:index};
        this.lines.push(candidate); this.draw(); setConnected(this.lines.length);
        setMessage(this.lines.length===4?"Wszystkie łapki są połączone.":"Połączona para. Zostało jeszcze kilka.");
      }
      private draw(){this.graphics.clear(); this.graphics.lineStyle(7,palette.sage,.38); for(const l of this.lines)this.graphics.lineBetween(POINTS[l.a].x,POINTS[l.a].y,POINTS[l.b].x,POINTS[l.b].y);}
    }
    return new PhaserModule.Game(createMeowPhaserConfig(PhaserModule,parent,Scene));
  },[]);
  return <div><div className="px-5 pb-3 flex items-center justify-between gap-3 text-[11px] text-[var(--color-ink-faint)]"><span>{message}</span><button type="button" onClick={()=>{setConnected(0);setMessage("Dotknij dwóch łapek z tym samym numerem.");setSeed(v=>v+1)}} className="meow-touch min-h-10 shrink-0 px-2 font-semibold text-[var(--color-ink-soft)]">Reset</button></div><PhaserStage key={seed} createGame={createGame} ariaLabel="Gra Łącz łapki" className="h-[500px]" />{connected===4&&<p className="mx-5 mt-3 text-[12px] text-[var(--color-ink-soft)]">Gotowe. Cztery spokojne ścieżki.</p>}</div>;
}
