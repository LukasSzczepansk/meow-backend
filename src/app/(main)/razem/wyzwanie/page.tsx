import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { ChallengeScreen } from "@/components/razem/ChallengeScreen";

export default function ChallengePage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/razem" />
      <TopBar title="Wyzwanie dnia" subtitle="Coś małego, co możecie zrobić razem." />
      <ChallengeScreen />
    </div>
  );
}
