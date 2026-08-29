import { NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { coupleTracks, members, musicPlaylists, musicPlaylistTracks } from "@/db/schema";
import { getCurrentMember } from "@/lib/server/session";
import { createCoupleEvent } from "@/lib/server/events";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const rows = await db
    .select({
      id: musicPlaylists.id,
      name: musicPlaylists.name,
      vibe: musicPlaylists.vibe,
      createdByMemberId: musicPlaylists.createdByMemberId,
      createdByNickname: members.nickname,
      createdAt: musicPlaylists.createdAt,
      updatedAt: musicPlaylists.updatedAt,
    })
    .from(musicPlaylists)
    .leftJoin(members, eq(members.id, musicPlaylists.createdByMemberId))
    .where(eq(musicPlaylists.coupleId, member.coupleId))
    .orderBy(desc(musicPlaylists.updatedAt));

  const playlists = await Promise.all(rows.map(async (playlist) => {
    const trackRows = await db
      .select({
        playlistTrackId: musicPlaylistTracks.id,
        position: musicPlaylistTracks.position,
        id: coupleTracks.id,
        provider: coupleTracks.provider,
        providerTrackId: coupleTracks.providerTrackId,
        title: coupleTracks.title,
        artist: coupleTracks.artist,
        album: coupleTracks.album,
        artworkUrl: coupleTracks.artworkUrl,
        durationMs: coupleTracks.durationMs,
        sourcePermalink: coupleTracks.sourcePermalink,
        isOurSong: coupleTracks.isOurSong,
        createdAt: coupleTracks.createdAt,
        addedByMemberId: coupleTracks.addedByMemberId,
        addedByNickname: members.nickname,
      })
      .from(musicPlaylistTracks)
      .innerJoin(coupleTracks, eq(coupleTracks.id, musicPlaylistTracks.trackId))
      .leftJoin(members, eq(members.id, coupleTracks.addedByMemberId))
      .where(eq(musicPlaylistTracks.playlistId, playlist.id))
      .orderBy(asc(musicPlaylistTracks.position), asc(musicPlaylistTracks.createdAt));

    return {
      ...playlist,
      createdByMe: playlist.createdByMemberId === member.memberId,
      trackCount: trackRows.length,
      tracks: trackRows.map((track) => ({
        ...track,
        streamable: track.provider === "audius" || track.provider === "youtube",
        addedByMe: track.addedByMemberId === member.memberId,
      })),
    };
  }));

  return NextResponse.json({ playlists });
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const body = asRecord(await request.json());
  const name = shortString(body?.name, 60);
  const vibe = shortString(body?.vibe, 40);
  if (!name) return NextResponse.json({ error: "Podaj nazwę playlisty." }, { status: 400 });

  const [playlist] = await db
    .insert(musicPlaylists)
    .values({
      coupleId: member.coupleId,
      createdByMemberId: member.memberId,
      name,
      vibe,
    })
    .returning();

  await createCoupleEvent({
    coupleId: member.coupleId,
    actorMemberId: member.memberId,
    type: "music_playlist_created",
    payload: { playlistId: playlist.id, name: playlist.name },
  });

  return NextResponse.json({ ok: true, playlist });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function shortString(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}
