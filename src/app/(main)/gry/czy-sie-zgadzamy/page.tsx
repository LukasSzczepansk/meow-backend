import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { SimultaneousGameScreen } from "@/components/games/SimultaneousGameScreen";

export default function Page() {
  return <div className="flex flex-col gap-3 pb-4"><BackLink href="/gry" /><TopBar title="Czy się zgadzamy?" /><SimultaneousGameScreen gameType="agree" /></div>;
}
