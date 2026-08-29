"use client";

import { useMemo, useSyncExternalStore } from "react";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/components/providers/ThemeProvider";
import { getDayPart, getMeowReaction } from "@/lib/cats/behavior";
import type { DayPart } from "@/lib/cats/behavior";
import type { RoomSlotKey, RoomType } from "@/lib/content/shop";
import { getThreeRoomItem, THREE_FLOOR_SPOTS, THREE_ROOM_PALETTES, type ThreeCatSpot, type ThreeRoomItemDefinition, type ThreeRoomPalette } from "@/lib/room-engine/three";
import type { RoomEngineCat } from "@/lib/room-engine/types";
import { CatAgent } from "@/components/domek/three/Cat3D";
import { RoomFurniture3D } from "@/components/domek/three/RoomFurniture3D";

interface ThreeRoomSceneProps {
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

export function ThreeRoomScene({
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
}: ThreeRoomSceneProps) {
  const { resolvedTheme } = useTheme();
  const visibleItemKeys = useMemo(() => {
    if (!previewItemKey) return equippedItemKeys;
    const preview = getThreeRoomItem(previewItemKey);
    if (!preview) return equippedItemKeys;
    return [...equippedItemKeys.filter((key) => getThreeRoomItem(key)?.slot !== preview.slot), previewItemKey];
  }, [equippedItemKeys, previewItemKey]);

  const activeDefinitions = useMemo(
    () => visibleItemKeys.map((key) => getThreeRoomItem(key)).filter((item): item is ThreeRoomItemDefinition => Boolean(item)),
    [visibleItemKeys],
  );

  const clockKey = useSyncExternalStore(subscribeToRoomClock, getRoomClockSnapshot, getServerRoomClockSnapshot);
  const hour = Number(clockKey.slice(-2));
  const dayPart = getDayPart(Number.isFinite(hour) ? hour : 12);
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, getMotionPreferenceSnapshot, getServerMotionPreferenceSnapshot);
  const nowMs = clockKeyToMs(clockKey);
  const reactionMs = reactionCreatedAt ? Date.parse(reactionCreatedAt) : Number.NaN;
  const freshReaction = Number.isFinite(reactionMs) ? nowMs - reactionMs < 3 * 60 * 1000 : false;
  const reaction = freshReaction ? getMeowReaction(reactionType) : null;
  const rareSeed = `${roomType}:${clockKey}:${me.name}:${partner?.name ?? "solo"}`;
  const rareTogether = Boolean(partner && !reaction && !reducedMotion && hashUnit(rareSeed) < 0.045);
  const palette = THREE_ROOM_PALETTES[roomType];

  const spots = useMemo(() => [
    ...THREE_FLOOR_SPOTS,
    ...activeDefinitions.flatMap((item) => item.catSpots ?? []),
  ], [activeDefinitions]);

  const together = reaction && ["together", "comfort", "greet"].includes(reaction);
  const forcedMe: ThreeCatSpot | null = together || rareTogether
    ? { id: together ? "reaction-me" : "rare-me", position: [-0.28, 0, 0.75], pose: rareTogether ? "sleep" : "sit", priority: 20 }
    : null;
  const forcedPartner: ThreeCatSpot | null = partner && (together || rareTogether)
    ? { id: together ? "reaction-partner" : "rare-partner", position: [0.38, 0, 0.72], pose: rareTogether ? "sleep" : "sit", priority: 20 }
    : reaction === "sleep" && partner
      ? { id: "reaction-sleep", position: [0.7, 0, 0.75], pose: "sleep", priority: 20 }
      : null;

  const signature = `${roomType}|${visibleItemKeys.join(",")}|${previewItemKey ?? ""}|${resolvedTheme}|${dayPart}|${me.colorVariant}:${me.furLength}:${me.accessory ?? ""}|${partner ? `${partner.colorVariant}:${partner.furLength}:${partner.accessory ?? ""}` : "solo"}`;

  return (
    <div className={`relative overflow-hidden rounded-[20px] border border-[var(--color-ink)]/[0.08] bg-[var(--color-surface-muted)] shadow-[0_18px_55px_rgba(52,43,36,0.08)] ${compact ? "h-[315px]" : "h-[430px]"}`}>
      <Canvas
        key={signature}
        orthographic
        shadows
        dpr={[1, 1.45]}
        camera={{ position: compact ? [7.5, 6.4, 8.7] : [7.2, 6.2, 8.3], zoom: compact ? 48 : 52, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.85, -0.25);
          camera.updateProjectionMatrix();
        }}
        aria-label="Interaktywny trójwymiarowy Koci Domek"
      >
        <RoomWorld
          palette={palette}
          dayPart={dayPart}
          dark={resolvedTheme === "dark"}
          items={activeDefinitions}
          previewItemKey={previewItemKey}
          editMode={editMode}
          onItemPress={onItemPress}
          me={me}
          partner={partner}
          spots={spots}
          reducedMotion={reducedMotion}
          forcedMe={forcedMe}
          forcedPartner={forcedPartner}
          onCatPress={onCatPress}
        />
      </Canvas>
      {!compact && (
        <div className="pointer-events-none absolute bottom-2.5 left-3 flex items-center gap-1.5 rounded-full bg-[var(--color-surface)]/86 px-2.5 py-1 text-[10px] font-medium text-[var(--color-ink-faint)] shadow-sm backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-sage)]" />
          żywy pokój · 3D
        </div>
      )}
      {editMode && !compact && (
        <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-[var(--color-ink)]/[0.07] bg-[var(--color-surface)]/88 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-ink-soft)] shadow-sm backdrop-blur-md">
          dotknij mebla
        </div>
      )}
    </div>
  );
}

function RoomWorld({
  palette,
  dayPart,
  dark,
  items,
  previewItemKey,
  editMode,
  onItemPress,
  me,
  partner,
  spots,
  reducedMotion,
  forcedMe,
  forcedPartner,
  onCatPress,
}: {
  palette: ThreeRoomPalette;
  dayPart: DayPart;
  dark: boolean;
  items: ThreeRoomItemDefinition[];
  previewItemKey: string | null;
  editMode: boolean;
  onItemPress?: (itemKey: string, slot: RoomSlotKey) => void;
  me: RoomEngineCat;
  partner: RoomEngineCat | null;
  spots: ThreeCatSpot[];
  reducedMotion: boolean;
  forcedMe: ThreeCatSpot | null;
  forcedPartner: ThreeCatSpot | null;
  onCatPress?: () => void;
}) {
  const sceneBackground = dark ? "#181715" : "#F2ECE4";
  const ambient = dayPart === "night" ? 0.72 : dayPart === "sunset" ? 0.92 : 1.08;
  const keyLight = dayPart === "night" ? 1.25 : 2.15;
  const keyColor = dayPart === "sunset" ? "#FFD3A5" : dayPart === "night" ? "#AAB7D2" : "#FFF1D9";

  return (
    <>
      <color attach="background" args={[sceneBackground]} />
      <ambientLight intensity={ambient} color={dark ? "#D6D0C8" : "#FFF9F0"} />
      <hemisphereLight args={[dayPart === "night" ? "#74839F" : "#E5F1EF", "#8F735D", dayPart === "night" ? 0.7 : 1.1]} />
      <directionalLight
        position={[4.5, 7.5, 5.5]}
        intensity={keyLight}
        color={keyColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={25}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.00025}
      />
      <RoomArchitecture palette={palette} dayPart={dayPart} />

      {items.map((item) => (
        <RoomFurniture3D
          key={item.key}
          definition={item}
          palette={palette}
          preview={previewItemKey === item.key}
          editMode={editMode}
          onPress={onItemPress ? (itemKey) => onItemPress(itemKey, item.slot) : undefined}
        />
      ))}

      <CatAgent
        cat={me}
        initialPosition={partner ? [-0.75, 0, 1.15] : [0, 0, 1.05]}
        spots={spots}
        index={0}
        reducedMotion={reducedMotion}
        forcedSpot={forcedMe}
        onPress={onCatPress}
      />
      {partner ? (
        <CatAgent
          cat={partner}
          initialPosition={[0.85, 0, 0.85]}
          spots={spots}
          index={1}
          reducedMotion={reducedMotion}
          forcedSpot={forcedPartner}
        />
      ) : (
        <EmptyPartnerSpot palette={palette} />
      )}

      <ContactShadows position={[0, 0.045, 0]} scale={8.4} opacity={dark ? 0.24 : 0.32} blur={2.6} far={5.5} color="#493A31" />
    </>
  );
}

function RoomArchitecture({ palette, dayPart }: { palette: ThreeRoomPalette; dayPart: DayPart }) {
  const sky = dayPart === "night" ? palette.skyNight : dayPart === "sunset" ? palette.skySunset : palette.skyDay;
  const wall = dayPart === "night" ? mixColor(palette.wall, "#30323A", 0.22) : palette.wall;
  const wallShade = dayPart === "night" ? mixColor(palette.wallShade, "#292C34", 0.2) : palette.wallShade;
  const floor = dayPart === "night" ? mixColor(palette.floor, "#3F3A39", 0.28) : palette.floor;
  const floorAlt = dayPart === "night" ? mixColor(palette.floorAlt, "#393536", 0.28) : palette.floorAlt;

  return (
    <group>
      <Floor palette={{ ...palette, floor, floorAlt }} />

      <mesh position={[0, 2.05, -3.55]} receiveShadow>
        <boxGeometry args={[8.2, 4.15, 0.18]} />
        <meshStandardMaterial color={wall} roughness={0.98} />
      </mesh>
      <mesh position={[-4.05, 2.05, 0]} receiveShadow>
        <boxGeometry args={[0.18, 4.15, 7.25]} />
        <meshStandardMaterial color={wallShade} roughness={0.98} />
      </mesh>

      <mesh position={[0, 0.18, -3.42]} castShadow>
        <boxGeometry args={[8.05, 0.2, 0.16]} />
        <meshStandardMaterial color={palette.trim} roughness={0.9} />
      </mesh>
      <mesh position={[-3.92, 0.18, 0]} castShadow>
        <boxGeometry args={[0.16, 0.2, 7.0]} />
        <meshStandardMaterial color={palette.trim} roughness={0.9} />
      </mesh>

      <Window palette={palette} sky={sky} dayPart={dayPart} />
      <WallPaneling palette={palette} />
      <DoorNiche palette={palette} />
    </group>
  );
}

function Floor({ palette }: { palette: ThreeRoomPalette }) {
  const rows = Array.from({ length: 9 }, (_, index) => ({
    z: -2.95 + index * 0.75,
    color: index % 2 ? palette.floorAlt : palette.floor,
  }));
  return (
    <group>
      <mesh position={[0, -0.075, 0]} receiveShadow><boxGeometry args={[8.15, 0.14, 7.15]} /><meshStandardMaterial color={palette.woodDark} roughness={0.95} /></mesh>
      {rows.map((row, rowIndex) => (
        <group key={rowIndex}>
          <mesh position={[0, 0, row.z]} receiveShadow><boxGeometry args={[8, 0.075, 0.71]} /><meshStandardMaterial color={row.color} roughness={0.94} /></mesh>
          {[-2.6, 0, 2.6].map((x, seamIndex) => {
            const offset = rowIndex % 2 ? 1.3 : 0;
            let seamX = x + offset;
            if (seamX > 3.9) seamX -= 5.2;
            return <mesh key={`${rowIndex}-${seamIndex}`} position={[seamX, 0.041, row.z]} receiveShadow><boxGeometry args={[0.025, 0.012, 0.68]} /><meshStandardMaterial color={palette.woodDark} transparent opacity={0.28} roughness={1} /></mesh>;
          })}
        </group>
      ))}
    </group>
  );
}

function Window({ palette, sky, dayPart }: { palette: ThreeRoomPalette; sky: string; dayPart: DayPart }) {
  const night = dayPart === "night";
  return (
    <group position={[0.65, 2.35, -3.43]}>
      <RoundedBox args={[2.7, 1.78, 0.14]} radius={0.08} smoothness={4} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color={palette.trim} roughness={0.86} />
      </RoundedBox>
      <mesh position={[0, 0, 0.082]}><planeGeometry args={[2.35, 1.43]} /><meshStandardMaterial color={sky} roughness={0.65} /></mesh>
      <mesh position={[0, 0, 0.095]}><boxGeometry args={[0.075, 1.43, 0.03]} /><meshStandardMaterial color={palette.trim} roughness={0.86} /></mesh>
      <mesh position={[0, 0, 0.095]}><boxGeometry args={[2.35, 0.075, 0.03]} /><meshStandardMaterial color={palette.trim} roughness={0.86} /></mesh>
      <mesh position={[0, -1.02, 0.08]} castShadow><boxGeometry args={[2.9, 0.16, 0.38]} /><meshStandardMaterial color={palette.trim} roughness={0.9} /></mesh>
      <mesh position={[-0.73, 0.36, 0.12]}><circleGeometry args={[night ? 0.15 : 0.17, 32]} /><meshBasicMaterial color={night ? "#E6E0D5" : "#E2B56F"} /></mesh>
      {!night && <Cloud position={[0.48, 0.25, 0.13]} />}
      {!night && dayPart !== "sunset" && <Cloud position={[-0.38, -0.2, 0.13]} scale={0.72} />}
      {night && <Stars />}
      <pointLight position={[0, 0, 1.4]} intensity={dayPart === "sunset" ? 0.85 : night ? 0.28 : 0.55} distance={5} color={dayPart === "sunset" ? "#FFD1A3" : night ? "#AAB8D6" : "#E5F2EF"} />
    </group>
  );
}

function Cloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[-0.18, 0, 0]}><circleGeometry args={[0.2, 20]} /><meshBasicMaterial color="#F0EEE8" transparent opacity={0.72} /></mesh>
      <mesh position={[0.05, 0.07, 0]}><circleGeometry args={[0.25, 20]} /><meshBasicMaterial color="#F0EEE8" transparent opacity={0.72} /></mesh>
      <mesh position={[0.29, -0.01, 0]}><circleGeometry args={[0.18, 20]} /><meshBasicMaterial color="#F0EEE8" transparent opacity={0.72} /></mesh>
    </group>
  );
}

function Stars() {
  return <group>{[[-0.85, 0.42], [0.78, 0.36], [0.35, -0.25], [-0.2, 0.13], [0.9, -0.32]].map(([x, y], index) => <mesh key={index} position={[x, y, 0.13]}><circleGeometry args={[0.025 + (index % 2) * 0.01, 10]} /><meshBasicMaterial color="#E9E3D8" transparent opacity={0.82} /></mesh>)}</group>;
}

function WallPaneling({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group position={[0, 1.0, -3.43]}>
      {[-3.0, -2.1, 2.2, 3.0].map((x) => <mesh key={x} position={[x, 0, 0]}><boxGeometry args={[0.035, 1.65, 0.045]} /><meshStandardMaterial color={palette.wallShade} transparent opacity={0.46} roughness={1} /></mesh>)}
      <mesh position={[0, -0.82, 0]}><boxGeometry args={[7.4, 0.035, 0.045]} /><meshStandardMaterial color={palette.wallShade} transparent opacity={0.38} roughness={1} /></mesh>
    </group>
  );
}

function DoorNiche({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group position={[-3.94, 1.45, 1.4]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[1.45, 2.75, 0.08]} radius={0.07} smoothness={3} castShadow><meshStandardMaterial color={palette.wood} roughness={0.94} /></RoundedBox>
      <RoundedBox args={[1.15, 2.48, 0.05]} radius={0.05} smoothness={3} position={[0, 0, 0.055]}><meshStandardMaterial color={mixColor(palette.wall, palette.wood, 0.2)} roughness={0.96} /></RoundedBox>
      <mesh position={[0.45, 0, 0.1]}><sphereGeometry args={[0.055, 14, 10]} /><meshStandardMaterial color="#8A7664" metalness={0.3} roughness={0.45} /></mesh>
    </group>
  );
}

function EmptyPartnerSpot({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group position={[0.85, 0.02, 0.82]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.34, 0.37, 36]} /><meshBasicMaterial color={palette.wallShade} transparent opacity={0.45} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function subscribeToRoomClock(callback: () => void): () => void {
  const id = window.setInterval(callback, 60_000);
  return () => window.clearInterval(id);
}

function getRoomClockSnapshot(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}`;
}

function getServerRoomClockSnapshot(): string {
  return "2000-01-01T12";
}

function clockKeyToMs(clockKey: string): number {
  const parsed = Date.parse(`${clockKey}:00:00`);
  return Number.isFinite(parsed) ? parsed : 0;
}

function subscribeToMotionPreference(callback: () => void): () => void {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener?.("change", callback);
  window.addEventListener("storage", callback);
  return () => {
    media.removeEventListener?.("change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getMotionPreferenceSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.localStorage.getItem("meow:motion") === "off";
}

function getServerMotionPreferenceSnapshot(): boolean {
  return false;
}

function hashUnit(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function mixColor(a: string, b: string, amount: number): string {
  const colorA = new THREE.Color(a);
  const colorB = new THREE.Color(b);
  return `#${colorA.lerp(colorB, amount).getHexString()}`;
}
