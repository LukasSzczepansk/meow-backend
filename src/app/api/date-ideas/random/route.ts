import { NextResponse } from "next/server";
import { db } from "@/db";
import { dateIdeas } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const ideas = await db.select().from(dateIdeas).where(and(eq(dateIdeas.coupleId, member.coupleId), eq(dateIdeas.status, "idea")));
  if (ideas.length === 0) return NextResponse.json({ idea: null });
  const idea = ideas[Math.floor(Math.random() * ideas.length)];
  return NextResponse.json({ idea });
}
