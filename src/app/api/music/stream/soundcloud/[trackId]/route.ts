import { NextResponse } from "next/server";
import { getSoundCloudStreamUrl, soundCloudMusicConfigured } from "@/lib/server/music";

export async function GET(_request: Request, { params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  if (!/^(?:soundcloud:tracks:)?\d{1,30}$/.test(trackId)) {
    return NextResponse.json({ error: "Nieprawidłowy utwór SoundCloud." }, { status: 400 });
  }

  if (!soundCloudMusicConfigured()) {
    return NextResponse.json({ error: "SoundCloud nie jest skonfigurowany." }, { status: 503 });
  }

  try {
    const streamUrl = await getSoundCloudStreamUrl(trackId);
    if (!streamUrl) {
      return NextResponse.json({ error: "Ten utwór nie udostępnia pełnego streamu poza SoundCloud." }, { status: 404 });
    }

    const response = NextResponse.redirect(streamUrl, 307);
    response.headers.set("cache-control", "private, no-store");
    response.headers.set("x-meow-audio-proxy", "soundcloud");
    return response;
  } catch (cause) {
    console.error("SoundCloud stream lookup failed", { trackId, cause });
    return NextResponse.json({ error: "SoundCloud chwilowo nie odpowiada." }, { status: 502 });
  }
}
