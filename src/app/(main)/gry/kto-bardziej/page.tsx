import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { WhoMoreScreen } from "@/components/games/WhoMoreScreen";

export default function WhoMorePage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/gry" />
      <TopBar title="Kto bardziej?" />
      <WhoMoreScreen />
    </div>
  );
}
