import { CalmExperienceShell } from "@/components/calm/CalmExperienceShell";
import { MemoryPhaserGame } from "@/components/games/engine/MemoryPhaserGame";
export function MemoryGameScreen(){return <CalmExperienceShell eyebrow="Dla mnie · Phaser" title="Kocie Memory" description="Spokojne memory bez timera i bez wyniku do pobicia. Odkrywaj po dwie karty i znajdź wszystkie pary."><MemoryPhaserGame/></CalmExperienceShell>}
