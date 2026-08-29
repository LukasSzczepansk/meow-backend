import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/server/session";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const member = await getCurrentMember();
  if (member) {
    redirect("/dzis");
  }

  return <OnboardingFlow />;
}
