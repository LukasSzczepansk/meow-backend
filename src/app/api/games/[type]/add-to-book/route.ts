import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookEntries, gameSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";

export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  await params;
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const sessionId = body?.sessionId as string | undefined;
  const category = body?.category as string | undefined;
  if (!sessionId || !category) return NextResponse.json({ error: "Brakuje danych." }, { status: 400 });

  const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, sessionId)).limit(1);
  if (!session || session.coupleId !== member.coupleId || !session.initiatorMemberId || !session.initiatorAnswer) {
    return NextResponse.json({ error: "Nie znaleziono odpowiedzi." }, { status: 404 });
  }
  if (session.initiatorMemberId !== member.memberId) {
    return NextResponse.json({ error: "Tylko autor odpowiedzi może zapisać ją o sobie." }, { status: 403 });
  }

  await db.insert(bookEntries).values({
    coupleId: member.coupleId,
    aboutMemberId: member.memberId,
    category,
    content: session.initiatorAnswer,
    sourceType: "game",
    sourceId: session.id,
    visibility: "shared",
  });

  return NextResponse.json({ ok: true });
}
