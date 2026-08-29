import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { coupleTracks } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";
import { createR2UploadUrl } from "@/lib/server/r2";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 100 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
]);

const EXTENSIONS: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/flac": "flac",
  "audio/x-flac": "flac",
};

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function shortString(value: unknown, max = 200): string | null {
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
  const contentType = shortString(body?.contentType, 100)?.toLowerCase() ?? null;
  const sizeBytes =
    typeof body?.sizeBytes === "number" && Number.isFinite(body.sizeBytes)
      ? Math.round(body.sizeBytes)
      : null;

  if (!trackId || !contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Nieprawidłowy utwór albo format audio." },
      { status: 400 },
    );
  }

  if (sizeBytes !== null && (sizeBytes <= 0 || sizeBytes > MAX_AUDIO_BYTES)) {
    return NextResponse.json(
      { error: "Plik audio jest za duży. Limit: 100 MB." },
      { status: 413 },
    );
  }

  const [track] = await db
    .select({
      id: coupleTracks.id,
      providerTrackId: coupleTracks.providerTrackId,
    })
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

  const extension = EXTENSIONS[contentType] ?? "bin";
  const key = [
    "music",
    member.coupleId,
    track.id,
    `${Date.now()}-${randomUUID()}.${extension}`,
  ].join("/");

  try {
    const uploadUrl = await createR2UploadUrl({
      key,
      contentType,
      expiresInSeconds: 15 * 60,
    });

    return NextResponse.json({
      ok: true,
      uploadUrl,
      objectKey: key,
      expiresInSeconds: 15 * 60,
      requiredHeaders: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("[music/r2/upload-url]", error);
    return NextResponse.json(
      { error: "Nie udało się przygotować uploadu do R2." },
      { status: 500 },
    );
  }
}
