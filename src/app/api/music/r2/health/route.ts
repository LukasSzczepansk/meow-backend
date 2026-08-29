import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/server/session";
import { testR2Connection } from "@/lib/server/r2";

export const runtime = "nodejs";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  }

  try {
    const info = await testR2Connection();
    return NextResponse.json({
      ok: true,
      bucket: info.bucket,
      publicBaseUrlConfigured: Boolean(info.publicBaseUrl),
    });
  } catch (error) {
    console.error("[music/r2/health]", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Nie udało się połączyć z Cloudflare R2.",
      },
      { status: 500 },
    );
  }
}
