import { TopBar } from "@/components/navigation/TopBar";
import { BackLink } from "@/components/navigation/BackLink";
import { CategoryList } from "@/components/porozmawiajmy/CategoryList";

export default function PorozmawiajmyPage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/razem" />
      <TopBar title="Porozmawiajmy" subtitle="Wybierzcie kategorię, od której chcecie zacząć." />
      <CategoryList />
    </div>
  );
}
