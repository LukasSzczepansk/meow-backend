import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { musicPlaylists } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ playlistId: string }> }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const { playlistId } = await params;
  const body = asRecord(await request.json());
  const name = shortString(body?.name, 60);
  const vibe = body?.vibe === null ? null : shortString(body?.vibe, 40);
  if (!name) return NextResponse.json({ error: "Podaj nazwę playlisty." }, { status: 400 });

  const [updated] = await db
    .update(musicPlaylists)
    .set({ name, vibe, updatedAt: new Date() })
    .where(and(eq(musicPlaylists.id, playlistId), eq(musicPlaylists.coupleId, member.coupleId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Nie znaleziono playlisty." }, { status: 404 });
  return NextResponse.json({ ok: true, playlist: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ playlistId: string }> }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const { playlistId } = await params;

  const [deleted] = await db
    .delete(musicPlaylists)
    .where(and(eq(musicPlaylists.id, playlistId), eq(musicPlaylists.coupleId, member.coupleId)))
    .returning({ id: musicPlaylists.id });

  if (!deleted) return NextResponse.json({ error: "Nie znaleziono playlisty." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function shortString(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}
