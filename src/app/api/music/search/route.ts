import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import {
  jamendoMusicConfigured,
  searchMusic,
  searchUnifiedMusic,
  youtubeMusicConfigured,
} from "@/lib/server/music";

type SearchSource = "unified" | "youtube" | "audius" | "jamendo" | "musicbrainz";

export async function GET(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const requested = url.searchParams.get("source");
  const source: SearchSource = requested === "youtube" || requested === "audius" || requested === "jamendo" || requested === "musicbrainz"
    ? requested
    : "unified";

  if (query.length < 2) {
    return NextResponse.json({ tracks: [], source, configured: true });
  }

  if (source === "youtube" && !youtubeMusicConfigured()) {
    return NextResponse.json({ error: "Brakuje YOUTUBE_API_KEY.", configured: false, tracks: [] }, { status: 503 });
  }
  if (source === "jamendo" && !jamendoMusicConfigured()) {
    return NextResponse.json({ error: "Brakuje JAMENDO_CLIENT_ID.", configured: false, tracks: [] }, { status: 503 });
  }

  try {
    const tracks = source === "unified"
      ? await searchUnifiedMusic(query)
      : await searchMusic(source, query);
    return NextResponse.json({
      tracks,
      source,
      configured: true,
      sources: {
        audius: true,
        jamendo: jamendoMusicConfigured(),
        youtube: youtubeMusicConfigured(),
      },
    });
  } catch (cause) {
    console.error("music search failed", cause);
    return NextResponse.json({ error: "Wyszukiwanie muzyki chwilowo nie odpowiada. Spróbuj ponownie.", tracks: [] }, { status: 502 });
  }
}
