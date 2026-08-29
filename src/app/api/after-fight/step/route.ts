import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { upsertStep } from "@/lib/server/afterFight";

const ALLOWED_FIELDS = ["readyState", "calmChoice", "emotions", "difficult", "needs", "conversationMode", "improve", "finalThought"] as const;

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const { sessionId, field, value } = body ?? {};

  const validValue = typeof value === "string"
    ? value.length <= 1500
    : Array.isArray(value) && value.length <= 12 && value.every((item) => typeof item === "string" && item.length <= 80);
  if (typeof sessionId !== "string" || !ALLOWED_FIELDS.includes(field) || !validValue) {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const saved = await upsertStep({ sessionId, coupleId: member.coupleId, memberId: member.memberId, field, value });
  if (!saved) return NextResponse.json({ error: "Nie znaleziono aktywnej rozmowy." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
