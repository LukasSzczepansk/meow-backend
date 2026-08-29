import { NextResponse } from "next/server";
import { db } from "@/db";
import { checkIns } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";
import { todayDateString } from "@/lib/server/date";

export async function POST() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const today = todayDateString();
  await db
    .update(checkIns)
    .set({ visibility: "shared", updatedAt: new Date() })
    .where(and(eq(checkIns.memberId, member.memberId), eq(checkIns.entryDate, today)));

  return NextResponse.json({ ok: true });
}
