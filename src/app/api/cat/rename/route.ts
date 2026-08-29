import { NextResponse } from "next/server";
import { db } from "@/db";
import { cats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const name = (body?.name as string | undefined)?.trim();
  if (!name) return NextResponse.json({ error: "Podaj imię." }, { status: 400 });

  await db.update(cats).set({ name: name.slice(0, 20) }).where(eq(cats.memberId, member.memberId));
  return NextResponse.json({ ok: true });
}
