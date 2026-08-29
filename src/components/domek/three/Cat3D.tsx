"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { CAT_COLOR_PALETTE } from "@/lib/content/cats";
import type { RoomCatPose, RoomEngineCat } from "@/lib/room-engine/types";
import type { ThreeCatSpot, Vec3 } from "@/lib/room-engine/three";

interface CatAgentProps {
  cat: RoomEngineCat;
  initialPosition: Vec3;
  spots: ThreeCatSpot[];
  index: number;
  reducedMotion: boolean;
  forcedSpot?: ThreeCatSpot | null;
  onPress?: () => void;
}

export function CatAgent({ cat, initialPosition, spots, index, reducedMotion, forcedSpot = null, onPress }: CatAgentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef(new THREE.Vector3(...initialPosition));
  const targetPoseRef = useRef<RoomCatPose>("sit");
  const nextDecisionRef = useRef(2.8 + index * 1.2);
  const forcedIdRef = useRef<string | null>(null);
  const [pose, setPose] = useState<RoomCatPose>("sit");
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    if (!forcedSpot) {
      forcedIdRef.current = null;
      return;
    }
    if (forcedIdRef.current === forcedSpot.id) return;
    forcedIdRef.current = forcedSpot.id;
    targetRef.current.set(...forcedSpot.position);
    targetPoseRef.current = forcedSpot.pose;
  }, [forcedSpot]);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const target = targetRef.current;
    const current = group.position;
    const dx = target.x - current.x;
    const dz = target.z - current.z;
    const horizontalDistance = Math.hypot(dx, dz);
    const verticalDistance = Math.abs(target.y - current.y);
    const distance = Math.hypot(horizontalDistance, verticalDistance);

    if (distance > 0.055) {
      if (!walking) setWalking(true);
      if (pose !== "stand") setPose("stand");
      const speed = reducedMotion ? 5.5 : 1.35;
      const amount = Math.min(1, delta * speed);
      current.lerp(target, amount);
      if (horizontalDistance > 0.03) {
        const desiredRotation = Math.atan2(dx, dz);
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, desiredRotation, Math.min(1, delta * 7));
      }
      return;
    }

    if (walking) setWalking(false);
    if (pose !== targetPoseRef.current) setPose(targetPoseRef.current);

    if (forcedSpot || reducedMotion) return;
    if (clock.elapsedTime < nextDecisionRef.current) return;

    const next = chooseSpot(spots, cat.personality, index);
    targetRef.current.set(...next.position);
    targetPoseRef.current = next.pose;
    nextDecisionRef.current = clock.elapsedTime + 7.5 + Math.random() * 7.5;
  });

  function handlePress(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    onPress?.();
  }

  return (
    <group
      ref={groupRef}
      position={initialPosition}
      onPointerDown={handlePress}
      onPointerOver={(event) => {
        if (!onPress) return;
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (onPress) document.body.style.cursor = "auto";
      }}
    >
      <LowPolyCat cat={cat} pose={pose} walking={walking} reducedMotion={reducedMotion} />
    </group>
  );
}

function chooseSpot(spots: ThreeCatSpot[], personality: string | undefined, index: number): ThreeCatSpot {
  if (spots.length === 0) return { id: "fallback", position: [index ? 0.65 : -0.65, 0, 0.7], pose: "sit" };

  const weighted = spots.map((spot) => {
    let weight = Math.max(1, spot.priority ?? 1);
    const p = personality?.toLowerCase() ?? "";
    if (p.includes("ciekaw") && spot.pose === "window") weight *= 3.2;
    if ((p.includes("psot") || p.includes("łobuz") || p.includes("lobuz")) && spot.pose === "play") weight *= 3.6;
    if (p.includes("przyt") && (spot.id.includes("sofa") || spot.id.includes("floor-center"))) weight *= 2.5;
    if ((p.includes("spokoj") || p.includes("spioch") || p.includes("śpioch")) && ["sit", "sleep", "window"].includes(spot.pose)) weight *= 2.25;
    if (index === 1 && spot.id === "floor-left") weight *= 0.55;
    if (index === 0 && spot.id === "floor-right") weight *= 0.55;
    return { spot, weight };
  });

  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.spot;
  }
  return weighted[weighted.length - 1].spot;
}

function LowPolyCat({ cat, pose, walking, reducedMotion }: { cat: RoomEngineCat; pose: RoomCatPose; walking: boolean; reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const palette = CAT_COLOR_PALETTE[cat.colorVariant];
  const longFur = cat.furLength === "long";
  const sleep = pose === "sleep";
  const play = pose === "play";
  const stand = pose === "stand" || walking;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (root.current) {
      const breathe = reducedMotion ? 1 : 1 + Math.sin(t * (sleep ? 1.4 : 2.1)) * (sleep ? 0.018 : 0.008);
      root.current.scale.y = breathe;
      root.current.position.y = stand && !reducedMotion ? Math.abs(Math.sin(t * 7.5)) * 0.035 : 0;
    }
    if (head.current && !reducedMotion) {
      head.current.rotation.z = Math.sin(t * (play ? 2.8 : 1.25)) * (play ? 0.055 : 0.018);
    }
    if (tail.current && !reducedMotion) {
      tail.current.rotation.y = Math.sin(t * (play ? 5.5 : 2.1)) * (play ? 0.5 : 0.22);
      tail.current.rotation.z = Math.sin(t * 1.7) * 0.08;
    }
  });

  const tailCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.32, 0.15, -0.02),
    new THREE.Vector3(0.46, 0.5, 0.06),
    new THREE.Vector3(0.3, 0.76, 0.13),
    new THREE.Vector3(0.1, 0.82, 0.12),
  ]), []);

  const bodyY = sleep ? 0.3 : stand ? 0.54 : 0.46;
  const bodyScale: [number, number, number] = sleep ? [0.62, 0.35, 0.48] : longFur ? [0.5, 0.67, 0.46] : [0.46, 0.61, 0.42];
  const headY = sleep ? 0.51 : 1.0;
  const headZ = sleep ? 0.25 : 0.08;

  return (
    <group ref={root} scale={longFur ? 1.04 : 1}>
      <mesh position={[0, bodyY, 0]} scale={bodyScale} castShadow receiveShadow>
        <sphereGeometry args={[0.72, 20, 14]} />
        <meshStandardMaterial color={palette.base} roughness={0.9} />
      </mesh>
      <mesh position={[0, bodyY + (sleep ? 0.02 : 0.02), 0.38]} scale={[0.29, sleep ? 0.22 : 0.38, 0.16]}>
        <sphereGeometry args={[0.72, 18, 12]} />
        <meshStandardMaterial color={palette.belly} roughness={0.95} />
      </mesh>

      {!sleep && <>
        <Paw position={[-0.24, 0.16, 0.2]} color={palette.shade} longFur={longFur} />
        <Paw position={[0.24, 0.16, 0.2]} color={palette.shade} longFur={longFur} />
      </>}

      <group ref={head} position={[0, headY, headZ]} rotation={[sleep ? 0.08 : 0, 0, sleep ? -0.22 : 0]}>
        <mesh scale={[0.42, 0.38, 0.39]} castShadow>
          <sphereGeometry args={[0.78, 20, 14]} />
          <meshStandardMaterial color={palette.base} roughness={0.9} />
        </mesh>
        <Ear position={[-0.24, 0.29, -0.01]} color={palette.shade} rotationZ={0.14} />
        <Ear position={[0.24, 0.29, -0.01]} color={palette.shade} rotationZ={-0.14} />
        <mesh position={[0, -0.06, 0.3]} scale={[0.26, 0.16, 0.11]}>
          <sphereGeometry args={[0.68, 16, 10]} />
          <meshStandardMaterial color={palette.belly} roughness={0.94} />
        </mesh>
        <mesh position={[0, -0.02, 0.395]} scale={[0.055, 0.038, 0.025]}>
          <sphereGeometry args={[0.72, 12, 8]} />
          <meshStandardMaterial color="#6B4D49" roughness={0.8} />
        </mesh>
        <Eye x={-0.13} closed={sleep} />
        <Eye x={0.13} closed={sleep} />
        <Whiskers side={-1} />
        <Whiskers side={1} />
      </group>

      <group ref={tail} position={[0.31, sleep ? 0.24 : 0.42, -0.22]} rotation={[sleep ? 0.45 : 0.15, 0.15, -0.3]}>
        <mesh castShadow>
          <tubeGeometry args={[tailCurve, 26, longFur ? 0.085 : 0.065, 8, false]} />
          <meshStandardMaterial color={palette.shade} roughness={0.92} />
        </mesh>
      </group>

      {longFur && <mesh position={[0, 0.72, 0.34]} scale={[0.35, 0.28, 0.17]}><sphereGeometry args={[0.75, 18, 12]} /><meshStandardMaterial color={palette.belly} roughness={0.98} /></mesh>}
      <CatAccessory accessory={cat.accessory ?? null} palette={palette} sleep={sleep} />
    </group>
  );
}

function Paw({ position, color, longFur }: { position: [number, number, number]; color: string; longFur: boolean }) {
  return <mesh position={position} scale={[longFur ? 0.17 : 0.15, 0.2, 0.19]} castShadow><sphereGeometry args={[0.75, 14, 10]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>;
}

function Ear({ position, color, rotationZ }: { position: [number, number, number]; color: string; rotationZ: number }) {
  return <mesh position={position} rotation={[0, 0, rotationZ]} castShadow><coneGeometry args={[0.18, 0.42, 3]} /><meshStandardMaterial color={color} roughness={0.92} /></mesh>;
}

function Eye({ x, closed }: { x: number; closed: boolean }) {
  return closed ? (
    <mesh position={[x, 0.04, 0.367]} scale={[0.08, 0.014, 0.01]}><sphereGeometry args={[0.75, 10, 6]} /><meshBasicMaterial color="#302A28" /></mesh>
  ) : (
    <group position={[x, 0.05, 0.36]}>
      <mesh scale={[0.065, 0.085, 0.035]}><sphereGeometry args={[0.75, 12, 8]} /><meshStandardMaterial color="#2E2A28" roughness={0.55} /></mesh>
      <mesh position={[0.012, 0.025, 0.035]} scale={[0.014, 0.018, 0.012]}><sphereGeometry args={[0.75, 8, 6]} /><meshBasicMaterial color="#F7F0E7" /></mesh>
    </group>
  );
}

function Whiskers({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * 0.2, -0.05, 0.39]} rotation={[0, 0, side * 0.05]}>
      {[-0.08, 0, 0.08].map((y) => <mesh key={y} position={[side * 0.13, y, 0]} rotation={[0, 0, side * y * 2]}><boxGeometry args={[0.28, 0.008, 0.008]} /><meshBasicMaterial color="#6B625D" transparent opacity={0.5} /></mesh>)}
    </group>
  );
}

function CatAccessory({ accessory, palette, sleep }: { accessory: RoomEngineCat["accessory"]; palette: { base: string; shade: string; belly: string }; sleep: boolean }) {
  if (!accessory) return null;
  if (accessory === "collar" || accessory === "bandana") {
    return (
      <mesh position={[0, sleep ? 0.46 : 0.78, sleep ? 0.18 : 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.29, accessory === "bandana" ? 0.055 : 0.035, 8, 24]} />
        <meshStandardMaterial color={accessory === "bandana" ? "#C98276" : "#9B765B"} roughness={0.75} />
      </mesh>
    );
  }
  if (accessory === "bow") {
    return (
      <group position={[0, sleep ? 0.61 : 1.33, sleep ? 0.12 : 0.06]}>
        <mesh position={[-0.12, 0, 0]} scale={[0.17, 0.11, 0.08]}><sphereGeometry args={[0.8, 12, 8]} /><meshStandardMaterial color="#C98276" /></mesh>
        <mesh position={[0.12, 0, 0]} scale={[0.17, 0.11, 0.08]}><sphereGeometry args={[0.8, 12, 8]} /><meshStandardMaterial color="#C98276" /></mesh>
      </group>
    );
  }
  if (accessory === "hat") {
    return (
      <group position={[0, sleep ? 0.72 : 1.37, sleep ? 0.06 : 0.02]}>
        <mesh><cylinderGeometry args={[0.26, 0.31, 0.12, 20]} /><meshStandardMaterial color="#75675D" /></mesh>
        <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.19, 0.23, 0.3, 20]} /><meshStandardMaterial color="#75675D" /></mesh>
      </group>
    );
  }
  if (accessory === "sweater") {
    return <mesh position={[0, sleep ? 0.32 : 0.47, -0.02]} scale={[0.48, sleep ? 0.29 : 0.52, 0.43]}><sphereGeometry args={[0.74, 18, 12]} /><meshStandardMaterial color="#8C9A88" roughness={0.96} transparent opacity={0.9} /></mesh>;
  }
  return <mesh position={[0, 0.75, 0]}><sphereGeometry args={[0.03, 8, 6]} /><meshBasicMaterial color={palette.base} /></mesh>;
}
