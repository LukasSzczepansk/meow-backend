import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { coupleTracks } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";
import { assertR2ObjectExists, r2PublicUrl } from "@/lib/server/r2";

export const runtime = "nodejs";

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function shortString(value: unknown, max = 800): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : null;
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  }

  const body = asObject(await request.json());
  const trackId = shortString(body?.trackId, 80);
  const objectKey = shortString(body?.objectKey, 800);

  if (!trackId || !objectKey) {
    return NextResponse.json(
      { error: "Brak trackId lub objectKey." },
      { status: 400 },
    );
  }

  const expectedPrefix = `music/${member.coupleId}/${trackId}/`;
  if (!objectKey.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { error: "Nieprawidłowy klucz obiektu." },
      { status: 403 },
    );
  }

  const [track] = await db
    .select({ id: coupleTracks.id })
    .from(coupleTracks)
    .where(
      and(
        eq(coupleTracks.id, trackId),
        eq(coupleTracks.coupleId, member.coupleId),
      ),
    )
    .limit(1);

  if (!track) {
    return NextResponse.json(
      { error: "Nie znaleziono utworu." },
      { status: 404 },
    );
  }

  try {
    const objectInfo = await assertR2ObjectExists(objectKey);
    const audioUrl = r2PublicUrl(objectKey);
    const now = new Date();

    const [updated] = await db
      .update(coupleTracks)
      .set({
        audioUrl,
        audioStatus: "ready",
        audioUpdatedAt: now,
      })
      .where(
        and(
          eq(coupleTracks.id, trackId),
          eq(coupleTracks.coupleId, member.coupleId),
        ),
      )
      .returning();

    return NextResponse.json({
      ok: true,
      track: updated,
      object: objectInfo,
      audioUrl,
    });
  } catch (error) {
    console.error("[music/r2/complete]", error);
    return NextResponse.json(
      {
        error:
          "Plik nie istnieje w R2 albo backend nie ma do niego dostępu.",
      },
      { status: 400 },
    );
  }
}
