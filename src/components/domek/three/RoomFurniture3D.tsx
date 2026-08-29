"use client";

import { RoundedBox } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { ThreeRoomItemDefinition, ThreeRoomPalette } from "@/lib/room-engine/three";

interface FurnitureProps {
  definition: ThreeRoomItemDefinition;
  palette: ThreeRoomPalette;
  preview?: boolean;
  editMode?: boolean;
  onPress?: (itemKey: string) => void;
}

export function RoomFurniture3D({ definition, palette, preview = false, editMode = false, onPress }: FurnitureProps) {
  const rotation = definition.rotation ?? [0, 0, 0];
  const scale = definition.scale ?? 1;
  const interactive = editMode && Boolean(onPress);

  function handlePress(event: ThreeEvent<PointerEvent>) {
    if (!interactive || !onPress) return;
    event.stopPropagation();
    onPress(definition.key);
  }

  return (
    <group
      position={definition.position}
      rotation={rotation}
      scale={scale}
      onPointerDown={handlePress}
      onPointerOver={(event) => {
        if (!interactive) return;
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (interactive) document.body.style.cursor = "auto";
      }}
    >
      {preview && <PreviewRing palette={palette} />}
      <FurnitureByKind kind={definition.kind} palette={palette} />
    </group>
  );
}

function PreviewRing({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
      <ringGeometry args={[0.7, 0.84, 48]} />
      <meshBasicMaterial color={palette.coral} transparent opacity={0.58} side={THREE.DoubleSide} />
    </mesh>
  );
}

function FurnitureByKind({ kind, palette }: { kind: ThreeRoomItemDefinition["kind"]; palette: ThreeRoomPalette }) {
  switch (kind) {
    case "sofa": return <Sofa palette={palette} />;
    case "rug": return <Rug palette={palette} />;
    case "lamp": return <FloorLamp palette={palette} />;
    case "shelf": return <Shelf palette={palette} />;
    case "plant": return <Plant palette={palette} />;
    case "fireplace": return <Fireplace palette={palette} />;
    case "gramophone": return <Gramophone palette={palette} />;
    case "scratcher": return <Scratcher palette={palette} />;
    case "fish_toy": return <FishToy palette={palette} />;
    case "yarn": return <Yarn palette={palette} />;
    case "tunnel": return <Tunnel palette={palette} />;
    case "box": return <OpenBox palette={palette} />;
    case "hammock": return <Hammock palette={palette} />;
    case "fountain": return <Fountain palette={palette} />;
    case "painting": return <Painting palette={palette} />;
    case "photo_frame": return <PhotoFrame palette={palette} />;
    case "candles": return <Candles palette={palette} />;
    case "cushions": return <Cushions palette={palette} />;
    case "fairy_lights": return <FairyLights palette={palette} />;
    case "flowers": return <Flowers palette={palette} />;
  }
}

function Sofa({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <RoundedBox args={[2.7, 0.48, 1.02]} radius={0.13} smoothness={4} position={[0, 0.34, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.textileDark} roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[2.55, 1.05, 0.34]} radius={0.14} smoothness={4} position={[0, 0.96, -0.38]} castShadow>
        <meshStandardMaterial color={palette.textile} roughness={0.86} />
      </RoundedBox>
      {[-1.16, 1.16].map((x) => (
        <RoundedBox key={x} args={[0.32, 0.78, 0.94]} radius={0.12} smoothness={4} position={[x, 0.63, 0.02]} castShadow>
          <meshStandardMaterial color={palette.textileDark} roughness={0.88} />
        </RoundedBox>
      ))}
      {[-0.62, 0.62].map((x) => (
        <RoundedBox key={x} args={[1.08, 0.22, 0.78]} radius={0.1} smoothness={4} position={[x, 0.64, 0.08]} castShadow receiveShadow>
          <meshStandardMaterial color={palette.textile} roughness={0.9} />
        </RoundedBox>
      ))}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.08, -0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.075, 0.28, 12]} />
          <meshStandardMaterial color={palette.woodDark} roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function Rug({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <mesh scale={[1.25, 1, 0.72]} receiveShadow>
        <cylinderGeometry args={[1.65, 1.65, 0.045, 64]} />
        <meshStandardMaterial color={palette.rug} roughness={1} />
      </mesh>
      <mesh position={[0, 0.028, 0]} scale={[1.13, 1, 0.6]} receiveShadow>
        <torusGeometry args={[1.25, 0.035, 8, 64]} />
        <meshStandardMaterial color={palette.wallShade} roughness={1} />
      </mesh>
    </group>
  );
}

function FloorLamp({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow><cylinderGeometry args={[0.32, 0.36, 0.14, 24]} /><meshStandardMaterial color={palette.metal} metalness={0.18} roughness={0.55} /></mesh>
      <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.035, 0.045, 2.25, 12]} /><meshStandardMaterial color={palette.metal} metalness={0.25} roughness={0.45} /></mesh>
      <mesh position={[0, 2.28, 0]} castShadow><cylinderGeometry args={[0.36, 0.58, 0.66, 24, 1, true]} /><meshStandardMaterial color="#D8C2A5" side={THREE.DoubleSide} roughness={0.9} /></mesh>
      <pointLight position={[0, 2.05, 0]} intensity={1.35} distance={4.2} color={palette.warmLight} castShadow={false} />
    </group>
  );
}

function Shelf({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <RoundedBox args={[1.45, 2.35, 0.52]} radius={0.05} smoothness={3} position={[0, 1.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.wood} roughness={0.86} />
      </RoundedBox>
      <RoundedBox args={[1.14, 1.96, 0.55]} radius={0.025} smoothness={2} position={[0, 1.24, 0.04]}>
        <meshStandardMaterial color={palette.woodDark} roughness={0.92} />
      </RoundedBox>
      {[0.55, 1.15, 1.75].map((y) => <mesh key={y} position={[0, y, 0.33]} castShadow><boxGeometry args={[1.18, 0.08, 0.42]} /><meshStandardMaterial color={palette.wood} roughness={0.85} /></mesh>)}
      <BookCluster palette={palette} position={[-0.28, 0.82, 0.48]} />
      <BookCluster palette={palette} position={[0.25, 1.42, 0.48]} />
    </group>
  );
}

function BookCluster({ palette, position }: { palette: ThreeRoomPalette; position: [number, number, number] }) {
  const colors = [palette.coral, palette.sage, "#C0A27F", "#DDD0BE"];
  return <group position={position}>{colors.map((color, index) => <mesh key={color} position={[(index - 1.5) * 0.11, 0, 0]} castShadow><boxGeometry args={[0.09, 0.35 + (index % 2) * 0.08, 0.22]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>)}</group>;
}

function Plant({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.38, 0.29, 0.62, 20]} /><meshStandardMaterial color="#9A7056" roughness={0.88} /></mesh>
      <mesh position={[0, 1.18, 0]} castShadow><cylinderGeometry args={[0.035, 0.05, 1.25, 10]} /><meshStandardMaterial color="#65775F" roughness={0.9} /></mesh>
      {[
        [-0.28, 1.16, 0.04, -0.5], [0.29, 1.34, 0, 0.45], [-0.22, 1.55, -0.04, -0.38], [0.19, 1.78, 0.02, 0.28], [0.02, 1.98, 0, 0],
      ].map(([x, y, z, rz], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[0, 0, rz]} castShadow>
          <sphereGeometry args={[0.33, 14, 10]} />
          <meshStandardMaterial color={index % 2 ? palette.sage : "#768A73"} roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function Fireplace({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <RoundedBox args={[1.7, 1.65, 0.6]} radius={0.06} smoothness={3} position={[0, 0.83, 0]} castShadow>
        <meshStandardMaterial color="#B8A28D" roughness={0.94} />
      </RoundedBox>
      <RoundedBox args={[1.08, 0.88, 0.66]} radius={0.25} smoothness={5} position={[0, 0.55, 0.08]}>
        <meshStandardMaterial color="#413936" roughness={1} />
      </RoundedBox>
      <mesh position={[0, 0.48, 0.43]} castShadow><sphereGeometry args={[0.31, 18, 12]} /><meshStandardMaterial color="#D77F55" emissive="#C65F38" emissiveIntensity={0.7} roughness={0.65} /></mesh>
      <mesh position={[0.08, 0.61, 0.46]}><sphereGeometry args={[0.19, 16, 10]} /><meshStandardMaterial color="#F0B66A" emissive="#E99A4D" emissiveIntensity={1.1} /></mesh>
      <pointLight position={[0, 0.75, 0.9]} intensity={1.15} distance={3.3} color="#F2A55D" />
      <mesh position={[0, 1.7, 0]} castShadow><boxGeometry args={[1.95, 0.16, 0.74]} /><meshStandardMaterial color={palette.woodDark} roughness={0.86} /></mesh>
    </group>
  );
}

function Gramophone({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <RoundedBox args={[1.0, 0.68, 0.78]} radius={0.06} smoothness={3} position={[0, 0.36, 0]} castShadow><meshStandardMaterial color={palette.wood} roughness={0.82} /></RoundedBox>
      <mesh position={[-0.16, 0.74, 0.02]} rotation={[-Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.31, 0.31, 0.045, 30]} /><meshStandardMaterial color="#312E2B" roughness={0.55} /></mesh>
      <mesh position={[0.25, 1.24, -0.06]} rotation={[0, 0, -0.45]} castShadow><coneGeometry args={[0.62, 1.02, 28, 1, true]} /><meshStandardMaterial color="#C89B69" side={THREE.DoubleSide} metalness={0.08} roughness={0.6} /></mesh>
      <mesh position={[0.02, 0.99, 0]} rotation={[0, 0, -0.35]} castShadow><cylinderGeometry args={[0.035, 0.035, 0.75, 10]} /><meshStandardMaterial color={palette.metal} /></mesh>
    </group>
  );
}

function Scratcher({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <RoundedBox args={[1.15, 0.14, 0.85]} radius={0.07} smoothness={3} position={[0, 0.07, 0]} castShadow><meshStandardMaterial color={palette.wood} roughness={0.92} /></RoundedBox>
      <mesh position={[0, 0.95, 0]} castShadow><cylinderGeometry args={[0.17, 0.17, 1.8, 18]} /><meshStandardMaterial color="#B4936E" roughness={1} /></mesh>
      {Array.from({ length: 8 }, (_, index) => <mesh key={index} position={[0, 0.32 + index * 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.18, 0.015, 6, 18]} /><meshStandardMaterial color="#8D7155" roughness={1} /></mesh>)}
      <RoundedBox args={[0.9, 0.16, 0.64]} radius={0.08} smoothness={3} position={[0, 1.86, 0]} castShadow><meshStandardMaterial color={palette.sage} roughness={0.88} /></RoundedBox>
    </group>
  );
}

function FishToy({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group rotation={[0, -0.35, 0]}>
      <mesh scale={[0.62, 0.3, 0.28]} castShadow><sphereGeometry args={[0.5, 18, 12]} /><meshStandardMaterial color="#789A98" roughness={0.85} /></mesh>
      <mesh position={[0.38, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow><coneGeometry args={[0.25, 0.4, 3]} /><meshStandardMaterial color={palette.sage} roughness={0.85} /></mesh>
      <mesh position={[-0.18, 0.08, 0.14]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#262321" /></mesh>
    </group>
  );
}

function Yarn({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <mesh castShadow><sphereGeometry args={[0.34, 24, 16]} /><meshStandardMaterial color={palette.coral} roughness={0.92} /></mesh>
      {[0, 0.55, -0.55].map((rot) => <mesh key={rot} rotation={[rot, rot * 0.4, 0.8]}><torusGeometry args={[0.28, 0.018, 6, 30]} /><meshStandardMaterial color="#E5B8B0" roughness={1} /></mesh>)}
    </group>
  );
}

function Tunnel({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow><cylinderGeometry args={[0.58, 0.58, 1.75, 32, 1, true]} /><meshStandardMaterial color={palette.sage} roughness={0.94} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.9, 0]}><torusGeometry args={[0.58, 0.055, 10, 32]} /><meshStandardMaterial color="#647860" roughness={0.9} /></mesh>
      <mesh position={[0, -0.9, 0]}><torusGeometry args={[0.58, 0.055, 10, 32]} /><meshStandardMaterial color="#647860" roughness={0.9} /></mesh>
    </group>
  );
}

function OpenBox({ palette }: { palette: ThreeRoomPalette }) {
  const cardboard = "#B68D64";
  return (
    <group>
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow><boxGeometry args={[1.2, 0.06, 1.0]} /><meshStandardMaterial color={cardboard} roughness={1} /></mesh>
      <mesh position={[-0.57, 0.42, 0]} castShadow><boxGeometry args={[0.08, 0.78, 1.0]} /><meshStandardMaterial color={cardboard} roughness={1} /></mesh>
      <mesh position={[0.57, 0.42, 0]} castShadow><boxGeometry args={[0.08, 0.78, 1.0]} /><meshStandardMaterial color={cardboard} roughness={1} /></mesh>
      <mesh position={[0, 0.42, -0.46]} castShadow><boxGeometry args={[1.1, 0.78, 0.08]} /><meshStandardMaterial color={cardboard} roughness={1} /></mesh>
      <mesh position={[0, 0.42, 0.46]} castShadow><boxGeometry args={[1.1, 0.78, 0.08]} /><meshStandardMaterial color={cardboard} roughness={1} /></mesh>
      <mesh position={[0, 0.78, -0.76]} rotation={[0.35, 0, 0]} castShadow><boxGeometry args={[1.1, 0.06, 0.58]} /><meshStandardMaterial color="#C5A079" roughness={1} /></mesh>
      <mesh position={[0, 0.78, 0.76]} rotation={[-0.35, 0, 0]} castShadow><boxGeometry args={[1.1, 0.06, 0.58]} /><meshStandardMaterial color="#C5A079" roughness={1} /></mesh>
      <mesh position={[0, 0.17, 0]}><planeGeometry args={[0.8, 0.6]} /><meshBasicMaterial color={palette.woodDark} transparent opacity={0.1} /></mesh>
    </group>
  );
}

function Hammock({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      {[-0.72, 0.72].map((x) => <mesh key={x} position={[x, 0.72, 0]} castShadow><cylinderGeometry args={[0.055, 0.065, 1.45, 10]} /><meshStandardMaterial color={palette.woodDark} roughness={0.9} /></mesh>)}
      <mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.25, 0.68, 1]} receiveShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.06, 40]} />
        <meshStandardMaterial color={palette.textile} roughness={0.96} />
      </mesh>
    </group>
  );
}

function Fountain({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow><cylinderGeometry args={[0.82, 0.96, 0.24, 32]} /><meshStandardMaterial color="#8FA39F" roughness={0.72} /></mesh>
      <mesh position={[0, 0.42, 0]} castShadow><cylinderGeometry args={[0.48, 0.62, 0.22, 32]} /><meshStandardMaterial color="#A6B8B4" roughness={0.7} /></mesh>
      <mesh position={[0, 0.85, 0]} castShadow><cylinderGeometry args={[0.09, 0.12, 0.72, 18]} /><meshStandardMaterial color={palette.metal} roughness={0.58} /></mesh>
      <mesh position={[0, 1.18, 0]}><sphereGeometry args={[0.13, 16, 12]} /><meshStandardMaterial color="#B8D4D1" emissive="#91B9B5" emissiveIntensity={0.22} roughness={0.45} /></mesh>
    </group>
  );
}

function Painting({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <RoundedBox args={[1.65, 1.15, 0.12]} radius={0.04} smoothness={3} castShadow><meshStandardMaterial color={palette.woodDark} roughness={0.84} /></RoundedBox>
      <mesh position={[0, 0, 0.071]}><planeGeometry args={[1.45, 0.95]} /><meshStandardMaterial color="#D9D3C6" roughness={0.98} /></mesh>
      <mesh position={[-0.38, 0.15, 0.078]}><circleGeometry args={[0.16, 24]} /><meshBasicMaterial color="#D6A66D" /></mesh>
      <mesh position={[0.14, -0.15, 0.08]} rotation={[0, 0, -0.08]}><planeGeometry args={[1.05, 0.45]} /><meshBasicMaterial color={palette.sage} /></mesh>
    </group>
  );
}

function PhotoFrame({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <RoundedBox args={[1.05, 0.84, 0.1]} radius={0.03} smoothness={3} castShadow><meshStandardMaterial color={palette.wood} roughness={0.84} /></RoundedBox>
      <mesh position={[0, 0, 0.06]}><planeGeometry args={[0.86, 0.65]} /><meshStandardMaterial color="#EFE7DA" roughness={0.96} /></mesh>
      <mesh position={[-0.15, -0.04, 0.068]}><circleGeometry args={[0.2, 24]} /><meshBasicMaterial color={palette.coral} transparent opacity={0.68} /></mesh>
      <mesh position={[0.16, 0.03, 0.069]}><circleGeometry args={[0.22, 24]} /><meshBasicMaterial color={palette.sage} transparent opacity={0.72} /></mesh>
    </group>
  );
}

function Candles({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      {[
        [-0.2, 0.28, 0, 0.55], [0.16, 0.36, 0, 0.72], [0.38, 0.22, 0.02, 0.42],
      ].map(([x, y, z, height], index) => (
        <group key={index} position={[x, 0, z]}>
          <mesh position={[0, height / 2, 0]} castShadow><cylinderGeometry args={[0.095, 0.105, height, 16]} /><meshStandardMaterial color={index === 1 ? "#D6C5AF" : "#E7DAC8"} roughness={0.95} /></mesh>
          <mesh position={[0, height + 0.08, 0]}><sphereGeometry args={[0.075, 12, 8]} /><meshStandardMaterial color="#F0AD61" emissive="#F0A14D" emissiveIntensity={1.4} /></mesh>
        </group>
      ))}
      <pointLight position={[0, 0.85, 0.2]} color={palette.warmLight} intensity={0.6} distance={2.2} />
    </group>
  );
}

function Cushions({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <RoundedBox args={[0.68, 0.65, 0.24]} radius={0.18} smoothness={5} position={[-0.42, 0.1, 0]} rotation={[0.08, 0.08, -0.08]} castShadow><meshStandardMaterial color={palette.coral} roughness={0.96} /></RoundedBox>
      <RoundedBox args={[0.72, 0.7, 0.24]} radius={0.18} smoothness={5} position={[0.28, 0.13, -0.02]} rotation={[0.08, -0.06, 0.12]} castShadow><meshStandardMaterial color={palette.sage} roughness={0.96} /></RoundedBox>
    </group>
  );
}

function FairyLights({ palette }: { palette: ThreeRoomPalette }) {
  const bulbs = Array.from({ length: 9 }, (_, index) => ({ x: -2.7 + index * 0.68, y: -Math.abs(index - 4) * 0.07 }));
  return (
    <group>
      {bulbs.slice(0, -1).map((bulb, index) => {
        const next = bulbs[index + 1];
        const dx = next.x - bulb.x;
        const dy = next.y - bulb.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return <mesh key={`wire-${index}`} position={[(bulb.x + next.x) / 2, (bulb.y + next.y) / 2, 0]} rotation={[0, 0, angle]}><boxGeometry args={[length, 0.018, 0.018]} /><meshStandardMaterial color={palette.metal} /></mesh>;
      })}
      {bulbs.map((bulb, index) => <mesh key={`bulb-${index}`} position={[bulb.x, bulb.y - 0.08, 0.08]}><sphereGeometry args={[0.075, 12, 8]} /><meshStandardMaterial color={palette.warmLight} emissive={palette.warmLight} emissiveIntensity={1.1} /></mesh>)}
    </group>
  );
}

function Flowers({ palette }: { palette: ThreeRoomPalette }) {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.28, 0.22, 0.5, 18]} /><meshStandardMaterial color="#A57759" roughness={0.88} /></mesh>
      {[-0.2, 0, 0.22].map((x, index) => (
        <group key={x} position={[x, 0.5, index === 1 ? 0.04 : -0.02]}>
          <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.018, 0.025, 0.7, 8]} /><meshStandardMaterial color="#66805E" /></mesh>
          <mesh position={[0, 0.72, 0]}><sphereGeometry args={[0.16, 12, 8]} /><meshStandardMaterial color={index === 1 ? "#D5A77D" : palette.coral} roughness={0.9} /></mesh>
        </group>
      ))}
    </group>
  );
}
