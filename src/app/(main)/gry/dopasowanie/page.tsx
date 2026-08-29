import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { GuessGameScreen } from "@/components/games/GuessGameScreen";

export default function MatchPage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/gry" />
      <TopBar title="Dopasowanie" />
      <GuessGameScreen gameType="match" />
    </div>
  );
}
