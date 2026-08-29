"use client";

import { useCallback, useRef, useState } from "react";
import { PixiStage } from "@/components/game-engine/PixiStage";
import { getPixiPalette } from "@/lib/game-engine/pixi/palette";
import { logCalmActivity } from "@/lib/client/calm";

export function PixiRaindropExperience() {
  const [cleared, setCleared] = useState(0);
  const [seed, setSeed] = useState(0);
  const loggedRef = useRef(false);

  const setup = useCallback(async (PIXI: typeof import("pixi.js"), app: import("pixi.js").Application) => {
    const palette = getPixiPalette();
    const bg = new PIXI.Graphics().rect(0, 0, 390, 500).fill({ color: 0x6c7b80, alpha: .96 });
    const windowPane = new PIXI.Graphics().roundRect(34, 38, 322, 326, 14).fill({ color: 0x82949a, alpha: .72 }).stroke({ color: palette.ink, alpha: .20, width: 5 });
    const sill = new PIXI.Graphics().roundRect(22, 352, 346, 88, 16).fill({ color: 0x6a5b50, alpha: .95 });
    app.stage.addChild(bg, windowPane, sill);

    const drops: { g: import("pixi.js").Graphics; speed: number }[] = [];
    let count = 0;
    const total = 26;

    for (let i=0;i<total;i+=1) {
      const g = new PIXI.Graphics().ellipse(0,0,5+(i%4),11+(i%5)*2).fill({color:0xffffff,alpha:.13}).stroke({color:0xffffff,alpha:.34,width:1});
      g.x = 48 + ((i*83 + seed*29) % 294);
      g.y = 54 + ((i*61 + seed*11) % 282);
      g.eventMode="static"; g.cursor="pointer";
      g.on("pointertap",()=>{
        if(g.destroyed)return; count+=1; setCleared(count);
        const mark = new PIXI.Graphics().moveTo(g.x-12,g.y+7).quadraticCurveTo(g.x,g.y+13,g.x+12,g.y+7).stroke({color:0xffffff,alpha:.16,width:2});
        app.stage.addChild(mark); g.destroy();
        let life=0; const fade=(ticker:import("pixi.js").Ticker)=>{life+=ticker.deltaMS;mark.alpha=Math.max(0,1-life/700);if(life>720){app.ticker.remove(fade);mark.destroy();}}; app.ticker.add(fade);
        if(count===total&&!loggedRef.current){loggedRef.current=true;void logCalmActivity("raindrops");}
      });
      app.stage.addChild(g); drops.push({g,speed:.010+(i%6)*.003});
    }

    const tick=(ticker:import("pixi.js").Ticker)=>{for(const d of drops){if(d.g.destroyed)continue;d.g.y+=d.speed*ticker.deltaMS;if(d.g.y>345)d.g.y=48;}};
    app.ticker.add(tick);
    return()=>app.ticker.remove(tick);
  },[seed]);

  return <div>
    <div className="px-5 pb-3 flex items-center justify-between text-[11px] text-[var(--color-ink-faint)]"><span>{cleared >= 26 ? "Szyba jest spokojna." : "Dotykaj kropli w swoim tempie."}</span><button type="button" onClick={()=>{loggedRef.current=false;setCleared(0);setSeed(v=>v+1)}} className="meow-touch min-h-10 px-2 font-semibold text-[var(--color-ink-soft)]">Nowy deszcz</button></div>
    <PixiStage key={seed} setup={setup} ariaLabel="Deszcz na szybie" className="mx-auto max-w-[430px] overflow-hidden rounded-[22px] border border-[var(--color-ink)]/10" />
  </div>;
}
