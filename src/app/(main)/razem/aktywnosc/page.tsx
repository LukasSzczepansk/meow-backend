import { TopBar } from "@/components/navigation/TopBar";
import { ActivityScreen } from "@/components/razem/ActivityScreen";

export default function ActivityPage() {
  return <div className="pb-5"><TopBar title="Ostatnio" backHref="/razem" /><ActivityScreen /></div>;
}
