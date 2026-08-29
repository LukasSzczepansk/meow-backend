import { TopBar } from "@/components/navigation/TopBar";
import { DateJarScreen } from "@/components/razem/DateJarScreen";

export default function DateJarPage() {
  return <div className="pb-5"><TopBar title="Słoik pomysłów" backHref="/razem" /><DateJarScreen /></div>;
}
