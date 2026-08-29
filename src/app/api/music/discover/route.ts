import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { getOpenMusicDiscovery, jamendoMusicConfigured, soundCloudMusicConfigured } from "@/lib/server/music";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  try {
    const popular = await getOpenMusicDiscovery();
    return NextResponse.json({
      configured: true,
      popular,
      sources: { soundcloud: soundCloudMusicConfigured(), audius: true, jamendo: jamendoMusicConfigured() },
      message: popular.length ? undefined : "Nie udało się teraz pobrać polecanej muzyki.",
    });
  } catch (cause) {
    console.error("music discover failed", cause);
    return NextResponse.json({ configured: true, popular: [], message: "Nie udało się pobrać polecanej muzyki. Spróbuj za chwilę." });
  }
}
