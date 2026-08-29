import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { searchMusic, youtubeMusicConfigured } from "@/lib/server/music";

export async function GET(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const requested = url.searchParams.get("source");
  const source = requested === "musicbrainz" || requested === "audius" ? requested : "youtube";

  if (query.length < 2) return NextResponse.json({ tracks: [], source, configured: youtubeMusicConfigured() });

  if (source === "youtube" && !youtubeMusicConfigured()) {
    return NextResponse.json({
      error: "Brakuje YOUTUBE_API_KEY. Dodaj klucz YouTube Data API do .env.local i uruchom ponownie serwer.",
      configured: false,
      tracks: [],
    }, { status: 503 });
  }

  try {
    const tracks = await searchMusic(source, query);
    return NextResponse.json({ tracks, source, configured: youtubeMusicConfigured() });
  } catch (cause) {
    console.error("music search failed", cause);
    const message = source === "youtube"
      ? "YouTube chwilowo nie zwrócił wyników. Sprawdź klucz API albo spróbuj ponownie."
      : source === "musicbrainz"
        ? "Katalog MusicBrainz chwilowo nie odpowiada. Spróbuj za moment."
        : "Katalog Audius chwilowo nie odpowiada. Spróbuj za moment.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
