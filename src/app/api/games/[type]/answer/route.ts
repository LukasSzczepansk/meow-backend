import { NextResponse } from "next/server";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { submitGuessAnswer, submitSimultaneousAnswer } from "@/lib/server/games";
import type { GameType } from "@/lib/content/games";

export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const validTypes: GameType[] = ["know_me", "match", "who_more", "agree", "choose"];
  if (!validTypes.includes(type as GameType)) return NextResponse.json({ error: "Nieznana gra." }, { status: 404 });

  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const value = body?.value as string | undefined;
  if (!value) return NextResponse.json({ error: "Wybierz odpowiedź." }, { status: 400 });

  try {
    if (type === "who_more" || type === "agree" || type === "choose") {
      const partner = await getPartnerMember(member.coupleId, member.memberId);
      const updated = await submitSimultaneousAnswer({
        coupleId: member.coupleId,
        memberId: member.memberId,
        partnerMemberId: partner?.memberId ?? null,
        gameType: type,
        value,
      });
      return NextResponse.json({ session: updated });
    }

    const role = body?.role as "initiator" | "guesser" | undefined;
    if (!role) return NextResponse.json({ error: "Brak roli." }, { status: 400 });

    const updated = await submitGuessAnswer({
      coupleId: member.coupleId,
      memberId: member.memberId,
      gameType: type as Extract<GameType, "know_me" | "match">,
      role,
      value,
    });
    return NextResponse.json({ session: updated });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Coś poszło nie tak." }, { status: 400 });
  }
}
