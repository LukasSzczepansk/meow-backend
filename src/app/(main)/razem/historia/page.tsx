import { TopBar } from "@/components/navigation/TopBar";
import { RelationshipTimeline } from "@/components/razem/RelationshipTimeline";

export default function HistoryPage() {
  return <div className="pb-5"><TopBar title="Nasza historia" backHref="/razem" /><RelationshipTimeline /></div>;
}
