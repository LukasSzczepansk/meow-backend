import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { isCoupleComplete } from "@/lib/server/onboarding";
import { getRoomState } from "@/lib/server/room";
import { TodayScreen } from "@/components/today/TodayScreen";
import { redirect } from "next/navigation";
import type { CatAccessory, CatColorVariant, CatFurLength } from "@/lib/content/cats";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/");

  const partner = await getPartnerMember(member.coupleId, member.memberId);
  const complete = await isCoupleComplete(member.coupleId);
  const room = await getRoomState(member.coupleId);

  return (
    <TodayScreen
      nickname={member.nickname}
      pawPoints={member.pawPoints}
      roomType={room.currentRoom.type}
      coupleComplete={complete}
      inviteCode={member.inviteCode}
      partnerNickname={partner?.nickname ?? null}
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
