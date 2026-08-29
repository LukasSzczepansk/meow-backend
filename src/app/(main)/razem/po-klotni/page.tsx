import { BackLink } from "@/components/navigation/BackLink";
import { TopBar } from "@/components/navigation/TopBar";
import { AfterFightFlow } from "@/components/razem/AfterFightFlow";

export default function AfterFightPage() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <BackLink href="/razem" />
      <TopBar title="Po kłótni" subtitle="Bez oceniania, bez szukania winnych." />
      <AfterFightFlow />
    </div>
  );
}
