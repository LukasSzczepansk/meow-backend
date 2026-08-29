import { NextResponse } from "next/server";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { getQuestionState, submitAnswer } from "@/lib/server/questions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const partner = await getPartnerMember(member.coupleId, member.memberId);
  const state = await getQuestionState(member.coupleId, member.memberId, partner?.memberId ?? null, id);
  if (!state) return NextResponse.json({ error: "Nie znaleziono pytania." }, { status: 404 });

  return NextResponse.json({ ...state, partnerNickname: partner?.nickname ?? null });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const text = (body?.text as string | undefined)?.trim();
  if (!text) return NextResponse.json({ error: "Napisz coś, zanim wyślesz odpowiedź." }, { status: 400 });

  const partner = await getPartnerMember(member.coupleId, member.memberId);
  await submitAnswer({
    coupleId: member.coupleId,
    memberId: member.memberId,
    partnerMemberId: partner?.memberId ?? null,
    questionId: id,
    text,
  });

  return NextResponse.json({ ok: true });
}
