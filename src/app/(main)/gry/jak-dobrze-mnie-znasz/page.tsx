import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { GuessGameScreen } from "@/components/games/GuessGameScreen";

export default function KnowMePage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/gry" />
      <TopBar title="Jak dobrze mnie znasz?" />
      <GuessGameScreen gameType="know_me" />
    </div>
  );
}
