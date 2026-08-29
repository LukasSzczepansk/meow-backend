import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { getRoomState } from "@/lib/server/room";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const state = await getRoomState(member.coupleId);
  return NextResponse.json(state);
}
