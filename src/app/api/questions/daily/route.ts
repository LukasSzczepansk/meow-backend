import { NextResponse } from "next/server";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { getQuestionState, pickDailyQuestion } from "@/lib/server/questions";

function localDateKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const partner = await getPartnerMember(member.coupleId, member.memberId);
  const dateKey = localDateKey();
  const question = pickDailyQuestion(member.coupleId, dateKey);
  const state = await getQuestionState(member.coupleId, member.memberId, partner?.memberId ?? null, question.id);
  return NextResponse.json({ dateKey, partnerNickname: partner?.nickname ?? null, ...state });
}
