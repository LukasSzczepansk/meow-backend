import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { ShopScreen } from "@/components/domek/ShopScreen";

export default function ShopPage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/domek" />
      <TopBar title="Sklep" subtitle="Urządźcie swój wspólny domek." />
      <ShopScreen />
    </div>
  );
}
