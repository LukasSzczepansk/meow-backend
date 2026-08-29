import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { AchievementsScreen } from "@/components/profile/AchievementsScreen";

export default function AchievementsPage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/profil" />
      <TopBar title="Osiągnięcia" subtitle="Wasze wspólne kroki, po cichu doceniane." />
      <AchievementsScreen />
    </div>
  );
}
