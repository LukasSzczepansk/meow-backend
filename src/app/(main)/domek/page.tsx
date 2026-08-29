import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { DomekScreen } from "@/components/domek/DomekScreen";
import type { CatAccessory, CatColorVariant, CatFurLength } from "@/lib/content/cats";

export const dynamic = "force-dynamic";

export default async function DomekPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/");
  const partner = await getPartnerMember(member.coupleId, member.memberId);

  return (
    <DomekScreen
      me={{
        colorVariant: (member.cat?.colorVariant ?? "ginger") as CatColorVariant,
        furLength: (member.cat?.furLength ?? "short") as CatFurLength,
        accessory: member.cat?.accessory as CatAccessory | null,
        name: member.cat?.name ?? "Twój kot",
        personality: member.cat?.personality ?? "ciekawski",
      }}
      partner={
        partner?.cat
          ? {
              colorVariant: partner.cat.colorVariant as CatColorVariant,
              furLength: partner.cat.furLength as CatFurLength,
              accessory: partner.cat.accessory as CatAccessory | null,
              name: partner.cat.name,
              personality: partner.cat.personality,
            }
          : null
      }
    />
  );
}
