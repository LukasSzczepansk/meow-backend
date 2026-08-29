"use client";

import { useCallback, useMemo } from "react";
import { PixiStage } from "@/components/game-engine/PixiStage";
import { useTheme } from "@/components/providers/ThemeProvider";
import { CAT_COLOR_ORDER, CAT_COLOR_PALETTE } from "@/lib/content/cats";
import { getDayPart, getMeowReaction, type DayPart } from "@/lib/cats/behavior";
import { getRoomSceneItem } from "@/lib/room-engine/items";
import { ROOM_ENGINE_HEIGHT, ROOM_ENGINE_WIDTH, ROOM_NAV_POINTS, ROOM_VISUALS } from "@/lib/room-engine/config";
import type { RoomCatPose, RoomEngineCat, RoomPoint } from "@/lib/room-engine/types";
import type { RoomSlotKey, RoomType } from "@/lib/content/shop";

interface PixiRoomSceneProps {
  roomType: RoomType;
  equippedItemKeys: string[];
  me: RoomEngineCat;
  partner: RoomEngineCat | null;
  compact?: boolean;
  editMode?: boolean;
  previewItemKey?: string | null;
  onItemPress?: (itemKey: string, slot: RoomSlotKey) => void;
  onCatPress?: () => void;
  reactionType?: string | null;
  reactionCreatedAt?: string | null;
}

interface CatRuntime {
  container: import("pixi.js").Container;
  cat: RoomEngineCat;
  flip: boolean;
  target: RoomPoint;
  pose: RoomCatPose;
  targetPose: RoomCatPose;
  waitingUntil: number;
  currentSpotId: string | null;
  baseScale: number;
  targetLayer: number;
  texture?: import("pixi.js").Texture;
}

export function PixiRoomScene({
  roomType,
  equippedItemKeys,
  me,
  partner,
  compact = false,
  editMode = false,
  previewItemKey = null,
  onItemPress,
  onCatPress,
  reactionType = null,
  reactionCreatedAt = null,
}: PixiRoomSceneProps) {
  const { resolvedTheme } = useTheme();
  const visibleItemKeys = useMemo(() => {
    if (!previewItemKey) return equippedItemKeys;
    const preview = getRoomSceneItem(previewItemKey);
    if (!preview) return equippedItemKeys;
    return [...equippedItemKeys.filter((key) => getRoomSceneItem(key)?.slot !== preview.slot), previewItemKey];
  }, [equippedItemKeys, previewItemKey]);

  const setup = useCallback(async (PIXI: typeof import("pixi.js"), app: import("pixi.js").Application) => {
    app.stage.sortableChildren = true;
    if (compact) {
      app.stage.scale.set(0.72);
      app.stage.position.set(55, 1);
    }
    const dayPart = getDayPart(new Date().getHours());
    const palette = ROOM_VISUALS[roomType];
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || localStorage.getItem("meow:motion") === "off";

    const art = await loadRoomArt(PIXI);
    drawRoomShell(PIXI, app.stage, palette, dayPart, roomType, resolvedTheme, art.floorTexture);

    const activeDefinitions = visibleItemKeys
      .map((key) => getRoomSceneItem(key))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    for (const item of activeDefinitions) {
      const object = drawRoomItem(PIXI, item.key, item.x, item.y, item.scale, art.itemTextures.get(item.key));
      object.zIndex = item.layer;
      if (previewItemKey === item.key) {
        object.alpha = 0.82;
        const halo = new PIXI.Graphics()
          .ellipse(item.x, item.y - 22, 56 * item.scale, 33 * item.scale)
          .stroke({ color: cssHex("--color-dusty-pink", 0xc98276), width: 2, alpha: 0.52 });
        halo.zIndex = item.layer - 1;
        app.stage.addChild(halo);
      }
      if (editMode && onItemPress) {
        object.eventMode = "static";
        object.cursor = "pointer";
        object.on("pointertap", () => onItemPress(item.key, item.slot));
        const hit = new PIXI.Graphics().roundRect(-46, -55, 92, 82, 14).fill({ color: 0xffffff, alpha: 0.001 });
        object.addChild(hit);
      }
      app.stage.addChild(object);
    }

    if (editMode) {
      const editHint = new PIXI.Graphics()
        .roundRect(12, 12, 104, 28, 10)
        .fill({ color: cssHex("--color-surface", 0xf7f4ee), alpha: 0.92 })
        .stroke({ color: cssHex("--color-border", 0x756f68), width: 1, alpha: 0.14 });
      editHint.zIndex = 110;
      app.stage.addChild(editHint);
      const text = new PIXI.Text({ text: "dotknij mebla", style: { fill: cssHex("--color-ink-soft", 0x6f6962), fontSize: 10, fontFamily: "system-ui" } });
      text.position.set(24, 20);
      text.zIndex = 111;
      app.stage.addChild(text);
    }

    const meActor = createCatRuntime(PIXI, me, false, 0.82, { x: partner ? 165 : 195, y: 335 }, onCatPress, chooseCatTexture(art.catTextures, me.colorVariant));
    meActor.container.zIndex = 55;
    app.stage.addChild(meActor.container);

    const partnerActor = partner ? createCatRuntime(PIXI, partner, true, 0.82, { x: 225, y: 335 }, undefined, chooseCatTexture(art.catTextures, partner.colorVariant)) : null;
    if (partnerActor) {
      partnerActor.container.zIndex = 55;
      app.stage.addChild(partnerActor.container);
    } else {
      const empty = new PIXI.Graphics().circle(228, 335, compact ? 25 : 30).stroke({ color: cssHex("--color-ink-faint", 0x8f8881), width: 1, alpha: 0.28 });
      empty.zIndex = 52;
      app.stage.addChild(empty);
    }

    const spots = activeDefinitions.flatMap((item) => item.catSpots ?? []);
    spots.push({ id: "floor-left", ...ROOM_NAV_POINTS.floorLeft, pose: "sit", facing: "right", priority: 1, layer: 55 });
    spots.push({ id: "floor-right", ...ROOM_NAV_POINTS.floorRight, pose: "sit", facing: "left", priority: 1, layer: 55 });
    spots.push({ id: "window", ...ROOM_NAV_POINTS.window, pose: "window", facing: "right", priority: 2, layer: 30 });

    const freshReaction = reactionCreatedAt ? Date.now() - new Date(reactionCreatedAt).getTime() < 3 * 60 * 1000 : false;
    const reaction = freshReaction ? getMeowReaction(reactionType) : null;
    if (reaction && partnerActor) {
      if (["together", "comfort", "greet"].includes(reaction)) {
        setTarget(meActor, { x: 181, y: 336 }, "sit", "reaction-me", 55);
        setTarget(partnerActor, { x: 210, y: 336 }, "sit", "reaction-partner", 55);
      } else if (reaction === "sleep") {
        partnerActor.pose = "sleep";
        redrawCat(PIXI, partnerActor);
      }
    }

    const rare = !reduceMotion && Math.random() < 0.045;
    if (rare && partnerActor && !reaction) {
      setTarget(meActor, { x: 183, y: 337 }, "sleep", "rare-together-me", 55);
      setTarget(partnerActor, { x: 212, y: 337 }, "sleep", "rare-together-partner", 55);
      meActor.waitingUntil = Date.now() + 18_000;
      partnerActor.waitingUntil = Date.now() + 18_000;
    }

    let lastDecision = performance.now();
    const tick = (ticker: import("pixi.js").Ticker) => {
      const dt = Math.min(32, ticker.deltaMS) / 1000;
      updateCatMotion(PIXI, meActor, dt, reduceMotion);
      if (partnerActor) updateCatMotion(PIXI, partnerActor, dt, reduceMotion);

      if (!reduceMotion && performance.now() - lastDecision > 5_500) {
        lastDecision = performance.now();
        maybeChooseNextSpot(PIXI, meActor, spots, activeDefinitions.map((item) => item.key), dayPart);
        if (partnerActor) maybeChooseNextSpot(PIXI, partnerActor, spots, activeDefinitions.map((item) => item.key), dayPart, meActor.currentSpotId);
      }
    };
    app.ticker.add(tick);

    return () => app.ticker.remove(tick);
  }, [compact, editMode, me, onCatPress, onItemPress, partner, previewItemKey, reactionCreatedAt, reactionType, resolvedTheme, roomType, visibleItemKeys]);

  const catSignature = `${me.colorVariant}:${me.furLength}:${me.accessory ?? ""}:${me.personality ?? ""}|${partner ? `${partner.colorVariant}:${partner.furLength}:${partner.accessory ?? ""}:${partner.personality ?? ""}` : "solo"}`;
  const signature = `${roomType}|${visibleItemKeys.join(",")}|${previewItemKey ?? ""}|${editMode ? 1 : 0}|${reactionType ?? ""}|${reactionCreatedAt ?? ""}|${compact ? 1 : 0}|${catSignature}|${resolvedTheme}`;

  return (
    <div className={`relative overflow-hidden rounded-[18px] border border-[var(--color-ink)]/[0.08] bg-[var(--color-surface-muted)] ${compact ? "min-h-[315px]" : "min-h-[365px]"}`}>
      <PixiStage
        key={signature}
        setup={setup}
        ariaLabel="Interaktywny Koci Domek"
        width={ROOM_ENGINE_WIDTH}
        height={compact ? 315 : ROOM_ENGINE_HEIGHT}
        className={compact ? "h-[315px] overflow-hidden" : ""}
      />
      {!compact && <div className="pointer-events-none absolute bottom-2 left-3 rounded-full bg-[var(--color-surface)]/80 px-2 py-1 text-[10px] text-[var(--color-ink-faint)] backdrop-blur-sm">żywy pokój · MEOW room engine</div>}
    </div>
  );
}

interface RoomArtBundle {
  floorTexture?: import("pixi.js").Texture;
  itemTextures: Map<string, import("pixi.js").Texture>;
  catTextures: import("pixi.js").Texture[];
}

const ROOM_ART_FILES: Partial<Record<string, string>> = {
  sofa: "/assets/room-pack/furniture/sofa_up_1.png",
  shelf: "/assets/room-pack/furniture/desk1.png",
  gramophone: "/assets/room-pack/furniture/hifi.png",
};

async function loadRoomArt(PIXI: typeof import("pixi.js")): Promise<RoomArtBundle> {
  const itemTextures = new Map<string, import("pixi.js").Texture>();
  const floorTexture = await tryLoadTexture(PIXI, "/assets/room-pack/textures/wood-floor.png");

  await Promise.all(
    Object.entries(ROOM_ART_FILES).map(async ([key, url]) => {
      if (!url) return;
      const texture = await tryLoadTexture(PIXI, url);
      if (texture) itemTextures.set(key, texture);
    }),
  );

  const catTextures: import("pixi.js").Texture[] = [];
  for (const file of Array.from({ length: 8 }, (_, index) => `/assets/room-pack/cats/cat-${index + 1}.png`)) {
    const texture = await tryLoadTexture(PIXI, file);
    if (texture) catTextures.push(texture);
  }

  return { floorTexture, itemTextures, catTextures };
}

function chooseCatTexture(textures: import("pixi.js").Texture[], colorVariant: RoomEngineCat["colorVariant"]) {
  if (textures.length === 0) return undefined;
  const colorIndex = Math.max(0, CAT_COLOR_ORDER.indexOf(colorVariant));
  return textures[colorIndex % textures.length];
}

async function tryLoadTexture(
  PIXI: typeof import("pixi.js"),
  url: string,
): Promise<import("pixi.js").Texture | undefined> {
  try {
    return await PIXI.Assets.load<import("pixi.js").Texture>(url);
  } catch {
    return undefined;
  }
}

function cssHex(name: string, fallback: number): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!value.startsWith("#")) return fallback;
  const parsed = Number.parseInt(value.slice(1, 7), 16);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function drawRoomShell(
  PIXI: typeof import("pixi.js"),
  stage: import("pixi.js").Container,
  palette: (typeof ROOM_VISUALS)[RoomType],
  dayPart: DayPart,
  roomType: RoomType,
  resolvedTheme: "light" | "dark",
  floorTexture?: import("pixi.js").Texture,
) {
  // MEOW 3.8: flatter, game-like top-down room. Sprites and cats share one navigable floor.
  const wall = new PIXI.Graphics().rect(0, 0, ROOM_ENGINE_WIDTH, 112).fill(palette.wall);
  wall.zIndex = 0;
  stage.addChild(wall);

  const upperShade = new PIXI.Graphics().rect(0, 0, ROOM_ENGINE_WIDTH, 13).fill({ color: palette.wallDark, alpha: 0.52 });
  upperShade.zIndex = 1;
  stage.addChild(upperShade);

  const skirting = new PIXI.Graphics()
    .rect(0, 103, ROOM_ENGINE_WIDTH, 9)
    .fill(palette.trim)
    .rect(0, 110, ROOM_ENGINE_WIDTH, 3)
    .fill({ color: palette.wallDark, alpha: 0.35 });
  skirting.zIndex = 5;
  stage.addChild(skirting);

  if (floorTexture) {
    const floor = new PIXI.Sprite(floorTexture);
    floor.position.set(0, 112);
    floor.width = ROOM_ENGINE_WIDTH;
    floor.height = ROOM_ENGINE_HEIGHT - 112;
    floor.alpha = resolvedTheme === "dark" ? 0.82 : 0.92;
    floor.zIndex = 2;
    stage.addChild(floor);
    const floorTint = new PIXI.Graphics().rect(0, 112, ROOM_ENGINE_WIDTH, ROOM_ENGINE_HEIGHT - 112).fill({
      color: palette.floor,
      alpha: resolvedTheme === "dark" ? 0.28 : 0.16,
    });
    floorTint.zIndex = 3;
    stage.addChild(floorTint);
  } else {
    const floor = new PIXI.Graphics().rect(0, 112, ROOM_ENGINE_WIDTH, ROOM_ENGINE_HEIGHT - 112).fill(palette.floor);
    floor.zIndex = 2;
    stage.addChild(floor);
    for (let y = 122; y < ROOM_ENGINE_HEIGHT; y += 24) {
      const line = new PIXI.Graphics().moveTo(0, y).lineTo(ROOM_ENGINE_WIDTH, y).stroke({ color: palette.floorAlt, width: 1, alpha: 0.18 });
      line.zIndex = 3;
      stage.addChild(line);
    }
    for (let x = 20; x < ROOM_ENGINE_WIDTH; x += 48) {
      const line = new PIXI.Graphics().moveTo(x, 112).lineTo(x, ROOM_ENGINE_HEIGHT).stroke({ color: palette.floorAlt, width: 1, alpha: 0.09 });
      line.zIndex = 3;
      stage.addChild(line);
    }
  }

  const sky = dayPart === "night" ? palette.skyNight : palette.skyDay;
  const frame = new PIXI.Graphics()
    .roundRect(145, 20, 100, 70, 5)
    .fill(palette.trim)
    .roundRect(151, 26, 88, 56, 2)
    .fill(sky);
  frame.zIndex = 8;
  stage.addChild(frame);
  const mullions = new PIXI.Graphics()
    .moveTo(195, 26).lineTo(195, 82)
    .moveTo(151, 54).lineTo(239, 54)
    .stroke({ color: 0xffffff, width: 2, alpha: 0.36 });
  mullions.zIndex = 9;
  stage.addChild(mullions);
  const sill = new PIXI.Graphics().roundRect(137, 86, 116, 7, 3).fill({ color: palette.wallDark, alpha: 0.74 });
  sill.zIndex = 10;
  stage.addChild(sill);

  if (dayPart === "night") {
    const moon = new PIXI.Graphics().circle(218, 39, 7).fill({ color: 0xf1e8d2, alpha: 0.88 });
    moon.zIndex = 9;
    stage.addChild(moon);
  } else {
    const sun = new PIXI.Graphics().circle(219, 39, 6).fill({ color: 0xe1b56c, alpha: 0.82 });
    sun.zIndex = 9;
    stage.addChild(sun);
  }

  const leftPost = new PIXI.Graphics().rect(15, 18, 7, 82).fill({ color: palette.wallDark, alpha: 0.26 });
  const rightPost = new PIXI.Graphics().rect(368, 18, 7, 82).fill({ color: palette.wallDark, alpha: 0.26 });
  leftPost.zIndex = rightPost.zIndex = 4;
  stage.addChild(leftPost, rightPost);

  if (roomType === "ogrod" || roomType === "balkon") {
    const greenery = new PIXI.Graphics()
      .ellipse(38, 119, 45, 18).fill({ color: 0x718b6d, alpha: 0.48 })
      .ellipse(350, 120, 50, 20).fill({ color: 0x6d896b, alpha: 0.45 });
    greenery.zIndex = 16;
    stage.addChild(greenery);
  }

  if (dayPart === "morning" || dayPart === "day") {
    const lightPatch = new PIXI.Graphics().poly([150, 112, 242, 112, 286, 282, 105, 282]).fill({ color: 0xfff3d9, alpha: 0.055 });
    lightPatch.zIndex = 7;
    stage.addChild(lightPatch);
  }
  if (dayPart === "sunset") {
    const glow = new PIXI.Graphics().rect(0, 0, 390, 430).fill({ color: 0xd99a72, alpha: 0.07 });
    glow.zIndex = 90;
    stage.addChild(glow);
  }
  if (dayPart === "night") {
    const shade = new PIXI.Graphics().rect(0, 0, 390, 430).fill({ color: 0x263044, alpha: 0.18 });
    shade.zIndex = 90;
    stage.addChild(shade);
  }
  if (resolvedTheme === "dark" && dayPart !== "night") {
    const uiShade = new PIXI.Graphics().rect(0, 0, 390, 430).fill({ color: 0x171614, alpha: 0.035 });
    uiShade.zIndex = 91;
    stage.addChild(uiShade);
  }
}
function drawRoomItem(
  PIXI: typeof import("pixi.js"),
  key: string,
  x: number,
  y: number,
  scale: number,
  texture?: import("pixi.js").Texture,
) {
  const c = new PIXI.Container();
  c.position.set(x, y);
  c.scale.set(scale);

  const shadow = new PIXI.Graphics().ellipse(0, 10, texture ? 30 : 42, texture ? 7 : 10).fill({ color: 0x4f453e, alpha: 0.12 });
  c.addChild(shadow);

  if (texture) {
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5, 0.72);
    c.addChild(sprite);
    return c;
  }

  switch (key) {
    case "sofa": {
      const back = new PIXI.Graphics().roundRect(-60, -48, 120, 58, 15).fill(0xb67d70).stroke({ color: 0x755b52, width: 1, alpha: 0.22 });
      const seat = new PIXI.Graphics().roundRect(-66, -10, 132, 36, 11).fill(0xa97065);
      const left = new PIXI.Graphics().roundRect(-76, -25, 22, 49, 9).fill(0x96665e);
      const right = new PIXI.Graphics().roundRect(54, -25, 22, 49, 9).fill(0x96665e);
      c.addChild(back, seat, left, right);
      break;
    }
    case "rug": c.addChild(new PIXI.Graphics().ellipse(0, 3, 82, 27).fill(0xc5ae95).stroke({ color: 0x9e8974, width: 2, alpha: 0.5 })); break;
    case "lamp": {
      c.addChild(new PIXI.Graphics().moveTo(0, -49).lineTo(0, 14).stroke({ color: 0x665b50, width: 4 }), new PIXI.Graphics().poly([-21, -50, 21, -50, 14, -78, -14, -78]).fill(0xd4b38a), new PIXI.Graphics().roundRect(-18, 13, 36, 7, 3).fill(0x665b50));
      break;
    }
    case "plant": {
      const pot = new PIXI.Graphics().poly([-20, -4, 20, -4, 14, 30, -14, 30]).fill(0x9b7157);
      const leaves = new PIXI.Graphics().ellipse(-9, -31, 16, 29).fill(0x829377).ellipse(13, -37, 17, 31).fill(0x8b9d80).ellipse(1, -56, 13, 27).fill(0x748a70);
      c.addChild(leaves, pot); break;
    }
    case "fireplace": {
      const body = new PIXI.Graphics().roundRect(-47, -57, 94, 81, 5).fill(0xaf9680).stroke({ color: 0x796654, width: 1, alpha: 0.25 });
      const opening = new PIXI.Graphics().roundRect(-26, -31, 52, 55, 21).fill(0x4d4038);
      const fire = new PIXI.Graphics().poly([-8, 17, 0, -13, 10, 17]).fill(0xcf8b61).poly([-3, 17, 3, -2, 8, 17]).fill(0xe2b067);
      c.addChild(body, opening, fire); break;
    }
    case "shelf": {
      const g = new PIXI.Graphics().roundRect(-46, -44, 92, 7, 3).fill(0x806754).roundRect(-46, -8, 92, 7, 3).fill(0x806754).rect(-42, -66, 11, 20).fill(0xa98a70).rect(-26, -62, 8, 16).fill(0x89987f).rect(13, -31, 14, 22).fill(0xc17d72);
      c.addChild(g); break;
    }
    case "gramophone": {
      const base = new PIXI.Graphics().roundRect(-32, -10, 60, 34, 5).fill(0x89684f);
      const horn = new PIXI.Graphics().poly([3, -21, 33, -70, 46, -64, 30, -19]).fill(0xc99d75);
      const record = new PIXI.Graphics().circle(-7, 2, 15).fill(0x3d3935).circle(-7, 2, 3).fill(0xb98173);
      c.addChild(horn, base, record); break;
    }
    case "scratcher": {
      const g = new PIXI.Graphics().roundRect(-29, 18, 58, 8, 4).fill(0x97785f).roundRect(-5, -45, 10, 66, 5).fill(0xb69773).poly([-22, -46, 22, -46, 13, -67, -13, -67]).fill(0x88977f);
      c.addChild(g); break;
    }
    case "yarn": {
      const ball = new PIXI.Graphics().circle(0, 0, 22).fill(0xc98276).moveTo(-15, -10).bezierCurveTo(0, -20, 15, -10, 18, 6).moveTo(-18, 7).bezierCurveTo(-4, -3, 10, -3, 19, 10).stroke({ color: 0xe6c5c0, width: 2.2, alpha: 0.8 });
      c.addChild(ball); break;
    }
    case "fish_toy": {
      const fish = new PIXI.Graphics().ellipse(-4, 0, 25, 14).fill(0x839a96).poly([19, 0, 40, -14, 40, 14]).fill(0x718a85).circle(-12, -3, 2).fill(0x292724);
      c.addChild(fish); break;
    }
    case "tunnel": {
      const g = new PIXI.Graphics().roundRect(-50, -27, 100, 50, 22).fill(0x87977f).ellipse(-31, 5, 17, 20).fill(0x556252).ellipse(31, 5, 17, 20).fill(0x556252);
      c.addChild(g); break;
    }
    case "box": {
      const g = new PIXI.Graphics().rect(-34, -23, 68, 48).fill(0xb99169).poly([-34, -23, -18, -39, 39, -39, 34, -23]).fill(0xcaa47d).moveTo(0, -23).lineTo(0, 25).stroke({ color: 0x96724f, width: 2 });
      c.addChild(g); break;
    }
    case "hammock": {
      const g = new PIXI.Graphics().moveTo(-44, -43).lineTo(-44, 26).moveTo(44, -43).lineTo(44, 26).stroke({ color: 0x715f51, width: 4 }).moveTo(-39, -20).bezierCurveTo(-18, 22, 18, 22, 39, -20).stroke({ color: 0xcaaa8d, width: 16 });
      c.addChild(g); break;
    }
    case "fountain": {
      const g = new PIXI.Graphics().ellipse(0, 14, 43, 16).fill(0x8fa5a0).ellipse(0, 5, 28, 9).fill(0xa8bbb7).moveTo(0, 3).lineTo(0, -42).stroke({ color: 0xa7bfba, width: 4 }).bezierCurveTo(-13, -31, -14, -17, 0, -7).moveTo(0, -42).bezierCurveTo(13, -31, 14, -17, 0, -7).stroke({ color: 0xb9d0cb, width: 3 });
      c.addChild(g); break;
    }
    case "painting": {
      c.addChild(new PIXI.Graphics().roundRect(-40, -30, 80, 60, 3).fill(0x795f4e).roundRect(-34, -24, 68, 48, 2).fill(0xdcd1c2).circle(-13, -7, 8).fill(0xd0a37f).poly([-28, 17, -5, -5, 10, 7, 20, -2, 31, 17]).fill(0x829278));
      break;
    }
    case "photo_frame": {
      c.addChild(new PIXI.Graphics().roundRect(-31, -28, 62, 55, 3).fill(0x94745d).roundRect(-25, -22, 50, 43, 2).fill(0xece4d9).circle(-8, -4, 8).fill({ color: 0xc98276, alpha: 0.66 }).circle(8, -4, 8).fill({ color: 0x8e9c88, alpha: 0.66 }));
      break;
    }
    case "candles": {
      const g = new PIXI.Graphics().roundRect(-25, -2, 14, 34, 3).fill(0xe3d5c2).roundRect(2, -14, 16, 46, 3).fill(0xd4c2aa).poly([-18, -5, -13, -18, -8, -5]).fill(0xd49a63).poly([5, -17, 10, -30, 15, -17]).fill(0xd49a63);
      c.addChild(g); break;
    }
    case "cushions": {
      c.addChild(new PIXI.Graphics().roundRect(-42, -24, 48, 39, 13).fill(0xc27d72).roundRect(-4, -30, 48, 43, 13).fill(0x89987f));
      break;
    }
    case "fairy_lights": {
      const g = new PIXI.Graphics().moveTo(-62, -28).bezierCurveTo(-25, 12, 25, 12, 62, -28).stroke({ color: 0x746a60, width: 2 });
      for (const [lx, ly] of [[-42,-8],[-19,3],[7,5],[34,-4]] as Array<[number, number]>) g.circle(lx, ly, 4).fill(0xd6ad76);
      c.addChild(g); break;
    }
    case "flowers": {
      const g = new PIXI.Graphics().moveTo(-14, 24).lineTo(-6, -20).moveTo(4, 24).lineTo(5, -24).moveTo(18, 24).lineTo(12, -14).stroke({ color: 0x77886f, width: 3 }).circle(-7, -25, 10).fill(0xc98276).circle(6, -30, 9).fill(0xd4a07c).circle(14, -19, 10).fill(0xc98276);
      c.addChild(g); break;
    }
    default: c.addChild(new PIXI.Graphics().roundRect(-25, -25, 50, 50, 12).fill(0xded3c7));
  }
  return c;
}

function createCatRuntime(
  PIXI: typeof import("pixi.js"),
  cat: RoomEngineCat,
  flip: boolean,
  baseScale: number,
  point: RoomPoint,
  onPress?: () => void,
  texture?: import("pixi.js").Texture,
): CatRuntime {
  const container = new PIXI.Container();
  container.position.set(point.x, point.y);
  container.scale.set(baseScale * (flip ? -1 : 1), baseScale);
  const runtime: CatRuntime = { container, cat, flip, target: point, pose: "sit", targetPose: "sit", waitingUntil: Date.now() + 4_000, currentSpotId: null, baseScale, targetLayer: 55, texture };
  redrawCat(PIXI, runtime);
  if (onPress) {
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("pointertap", onPress);
  }
  return runtime;
}

function redrawCat(PIXI: typeof import("pixi.js"), runtime: CatRuntime) {
  runtime.container.removeChildren();
  const p = CAT_COLOR_PALETTE[runtime.cat.colorVariant];
  const bodyColor = Number.parseInt(p.base.slice(1), 16);
  const shadeColor = Number.parseInt(p.shade.slice(1), 16);
  const bellyColor = Number.parseInt(p.belly.slice(1), 16);
  const pose = runtime.pose;

  const shadow = new PIXI.Graphics().ellipse(0, 2, pose === "sleep" ? 34 : 27, 7).fill({ color: 0x302a27, alpha: 0.11 });
  runtime.container.addChild(shadow);

  if (runtime.texture) {
    const sprite = new PIXI.Sprite(runtime.texture);
    sprite.anchor.set(0.5, 0.86);
    sprite.tint = runtime.cat.colorVariant === "white" ? 0xffffff : bodyColor;
    const targetSize = pose === "sleep" ? 56 : 62;
    const sourceW = Math.max(1, runtime.texture.width);
    const sourceH = Math.max(1, runtime.texture.height);
    const scale = Math.min(targetSize / sourceW, targetSize / sourceH);
    sprite.scale.set(scale);
    if (pose === "sleep") {
      sprite.rotation = -0.22;
      sprite.scale.y *= 0.88;
    } else if (pose === "play") {
      sprite.rotation = -0.08;
    }
    runtime.container.addChild(sprite);
  } else if (pose === "sleep") {
    const body = new PIXI.Graphics().ellipse(0, -22, 48, 28).fill(bodyColor).stroke({ color: shadeColor, width: 1, alpha: 0.18 });
    const head = new PIXI.Graphics().circle(-25, -33, 22).fill(bodyColor).poly([-43,-48,-35,-67,-26,-49]).fill(bodyColor).poly([-13,-48,-4,-65,2,-44]).fill(bodyColor);
    const face = new PIXI.Graphics().moveTo(-36,-34).bezierCurveTo(-32,-30,-27,-30,-23,-34).moveTo(-16,-34).bezierCurveTo(-12,-30,-7,-30,-3,-34).stroke({ color: shadeColor, width: 2 });
    const tail = new PIXI.Graphics().moveTo(31,-17).bezierCurveTo(57,-11,55,9,28,7).stroke({ color: shadeColor, width: runtime.cat.furLength === "long" ? 13 : 9 });
    runtime.container.addChild(tail, body, head, face);
  } else {
    const body = new PIXI.Graphics().ellipse(0, -29, 29, 40).fill(bodyColor).stroke({ color: shadeColor, width: 1, alpha: 0.16 });
    const belly = new PIXI.Graphics().ellipse(0, -23, 15, 24).fill({ color: bellyColor, alpha: 0.42 });
    const head = new PIXI.Graphics().circle(0, -72, 28).fill(bodyColor).poly([-24,-88,-18,-111,-7,-91]).fill(bodyColor).poly([11,-91,23,-109,24,-84]).fill(bodyColor);
    const eyes = new PIXI.Graphics().moveTo(-13,-74).lineTo(-7,-74).moveTo(7,-74).lineTo(13,-74).stroke({ color: shadeColor, width: 2.4 });
    const nose = new PIXI.Graphics().poly([-3,-66,3,-66,0,-62]).fill(0xb9796a);
    const tail = new PIXI.Graphics().moveTo(20,-24).bezierCurveTo(52,-24,53,-53,36,-62).stroke({ color: shadeColor, width: runtime.cat.furLength === "long" ? 13 : 9 });
    runtime.container.addChild(tail, body, belly, head, eyes, nose);
    if (pose === "play") runtime.container.rotation = -0.06;
    else runtime.container.rotation = 0;
  }

  if (runtime.cat.accessory === "collar") runtime.container.addChild(new PIXI.Graphics().moveTo(-18,-54).bezierCurveTo(-6,-48,7,-48,18,-54).stroke({ color: 0xc98276, width: 4 }));
  if (runtime.cat.accessory === "bow") runtime.container.addChild(new PIXI.Graphics().poly([-12,-54,0,-61,0,-48]).fill(0xc98276).poly([12,-54,0,-61,0,-48]).fill(0xc98276).circle(0,-54,3).fill(0xa96f65));
  if (runtime.cat.accessory === "bandana") runtime.container.addChild(new PIXI.Graphics().poly([-18,-54,18,-54,0,-37]).fill(0x8e9c88));

  if (runtime.container.eventMode === "static") {
    const hit = new PIXI.Graphics().circle(0, -50, 44).fill({ color: 0xffffff, alpha: 0.001 });
    runtime.container.addChild(hit);
  }
}

function setTarget(runtime: CatRuntime, target: RoomPoint, pose: RoomCatPose, spotId: string, targetLayer = 55) {
  runtime.target = target;
  runtime.targetPose = pose;
  runtime.currentSpotId = spotId;
  runtime.targetLayer = targetLayer;
  runtime.waitingUntil = Date.now() + 9_000 + Math.random() * 9_000;
}

function updateCatMotion(PIXI: typeof import("pixi.js"), runtime: CatRuntime, dt: number, reduceMotion: boolean) {
  const dx = runtime.target.x - runtime.container.x;
  const dy = runtime.target.y - runtime.container.y;
  const distance = Math.hypot(dx, dy);
  if (distance > 2 && !reduceMotion) {
    const speed = 32;
    runtime.container.x += (dx / distance) * speed * dt;
    runtime.container.y += (dy / distance) * speed * dt;
    const facingLeft = dx < 0;
    runtime.container.scale.x = runtime.baseScale * (facingLeft ? -1 : 1);
    if (runtime.pose !== "stand") {
      runtime.pose = "stand";
      redrawCat(PIXI, runtime);
    }
  } else if (distance <= 2) {
    runtime.container.position.set(runtime.target.x, runtime.target.y);
    runtime.container.zIndex = runtime.targetLayer;
    runtime.container.scale.x = runtime.baseScale * (runtime.flip ? -1 : 1);
    if (runtime.pose !== runtime.targetPose) {
      runtime.pose = runtime.targetPose;
      redrawCat(PIXI, runtime);
    }
  }
}

function maybeChooseNextSpot(
  PIXI: typeof import("pixi.js"),
  runtime: CatRuntime,
  spots: Array<{ id: string; x: number; y: number; pose: RoomCatPose; priority?: number; layer?: number }>,
  itemKeys: string[],
  dayPart: DayPart,
  occupiedSpotId?: string | null,
) {
  if (Date.now() < runtime.waitingUntil) return;
  const personality = runtime.cat.personality ?? "ciekawski";
  let weighted = spots.filter((spot) => spot.id !== occupiedSpotId);
  if (personality === "przytulaśny") weighted = [...weighted, ...weighted.filter((spot) => spot.pose === "sit")];
  if (personality === "psotny") weighted = [...weighted, ...weighted.filter((spot) => spot.pose === "play")];
  if (personality === "ciekawski") weighted = [...weighted, ...weighted.filter((spot) => spot.pose === "window")];
  if (personality === "spokojny" || dayPart === "night") weighted = [...weighted, ...weighted.filter((spot) => spot.pose === "sleep" || spot.pose === "window")];
  if (!itemKeys.some((key) => ["yarn", "fish_toy", "tunnel", "scratcher"].includes(key))) weighted = weighted.filter((spot) => spot.pose !== "play");
  if (weighted.length === 0) return;
  const next = weighted[Math.floor(Math.random() * weighted.length)];
  if (!next) return;
  setTarget(runtime, next, next.pose, next.id, next.layer ?? 55);
  redrawCat(PIXI, runtime);
}
