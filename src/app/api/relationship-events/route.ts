import { NextResponse } from "next/server";
import { db } from "@/db";
import { relationshipEvents } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";
import { createCoupleEvent } from "@/lib/server/events";

const EVENT_TYPES = new Set(["poznanie", "pierwsza_randka", "para", "wyjazd", "wazny_moment", "custom"]);

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const events = await db.select().from(relationshipEvents).where(eq(relationshipEvents.coupleId, member.coupleId)).orderBy(asc(relationshipEvents.eventDate));
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : "";
  const eventDate = typeof body?.date === "string" ? body.date : "";
  const description = typeof body?.description === "string" ? body.description.trim().slice(0, 800) || null : null;
  const eventType = typeof body?.eventType === "string" && EVENT_TYPES.has(body.eventType) ? body.eventType : "custom";
  const photoUrl = typeof body?.photoUrl === "string" && body.photoUrl.startsWith("data:image/") && body.photoUrl.length < 1_800_000 ? body.photoUrl : null;
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return NextResponse.json({ error: "Podaj tytuł i datę." }, { status: 400 });

  const [event] = await db.insert(relationshipEvents).values({
    coupleId: member.coupleId,
    createdByMemberId: member.memberId,
    title,
    eventDate,
    description,
    eventType,
    photoUrl,
  }).returning();

  await createCoupleEvent({
    coupleId: member.coupleId,
    actorMemberId: member.memberId,
    type: "relationship_event_added",
    payload: { eventId: event.id, title: event.title },
  });

  return NextResponse.json({ ok: true, event });
}
