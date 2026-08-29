import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { equipRoomItem } from "@/lib/server/room";

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const itemKey = typeof body?.itemKey === "string" ? body.itemKey : "";
  if (!itemKey) return NextResponse.json({ error: "Wybierz przedmiot." }, { status: 400 });

  try {
    const equipped = await equipRoomItem({ coupleId: member.coupleId, memberId: member.memberId, itemKey });
    return NextResponse.json({ ok: true, equipped });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Nie udało się ustawić przedmiotu." }, { status: 400 });
  }
}
