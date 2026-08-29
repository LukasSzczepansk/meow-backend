import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { MemoriesScreen } from "@/components/razem/MemoriesScreen";

export default function MemoriesPage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/razem" />
      <TopBar title="Nasze wspomnienia" subtitle="Wasze chwile, zapisane na później." />
      <MemoriesScreen />
    </div>
  );
}
