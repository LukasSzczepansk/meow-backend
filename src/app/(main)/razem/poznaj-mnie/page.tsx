import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { BookScreen } from "@/components/razem/BookScreen";

export default function BookPage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/razem" />
      <TopBar title="Księga Nas" subtitle="To, co odkryliście o sobie nawzajem." />
      <BookScreen />
    </div>
  );
}
