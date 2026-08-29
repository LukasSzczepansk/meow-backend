import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { getPopularMusicInPoland, youtubeMusicConfigured } from "@/lib/server/music";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  if (!youtubeMusicConfigured()) {
    return NextResponse.json({
      configured: false,
      popular: [],
      message: "Dodaj YOUTUBE_API_KEY, aby włączyć popularne utwory i pełne wyszukiwanie.",
    });
  }

  try {
    const popular = await getPopularMusicInPoland();
    return NextResponse.json({ configured: true, popular });
  } catch (cause) {
    console.error("music discover failed", cause);
    return NextResponse.json({
      configured: true,
      popular: [],
      message: "Nie udało się pobrać popularnych utworów. Spróbuj za chwilę.",
    });
  }
}
