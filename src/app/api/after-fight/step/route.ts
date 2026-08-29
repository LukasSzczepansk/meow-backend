import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { upsertStep } from "@/lib/server/afterFight";

const ALLOWED_FIELDS = ["readyState", "calmChoice", "emotions", "difficult", "needs", "conversationMode", "improve", "finalThought"] as const;

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const { sessionId, field, value } = body ?? {};

  if (!sessionId || !ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  await upsertStep({ sessionId, memberId: member.memberId, field, value });
  return NextResponse.json({ ok: true });
}
