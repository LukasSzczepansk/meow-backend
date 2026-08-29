import { NextResponse } from "next/server";

const PASSTHROUGH_HEADERS = [
  "accept-ranges",
  "cache-control",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
] as const;

export async function GET(request: Request, { params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  if (!/^\d{1,20}$/.test(trackId)) {
    return NextResponse.json({ error: "Nieprawidłowy utwór." }, { status: 400 });
  }

  const clientId = process.env.JAMENDO_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json({ error: "Jamendo nie jest skonfigurowane." }, { status: 503 });
  }

  const target = new URL("https://api.jamendo.com/v3.0/tracks/file/");
  target.searchParams.set("client_id", clientId);
  target.searchParams.set("id", trackId);
  target.searchParams.set("action", "stream");
  target.searchParams.set("audioformat", "mp32");

  const headers = new Headers({ Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8", "User-Agent": "Meow/2.2 Open Music" });
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);

  let upstream: Response;
  try {
    upstream = await fetch(target, { headers, redirect: "follow", cache: "no-store" });
  } catch (cause) {
    console.error("Jamendo stream fetch failed", cause);
    return NextResponse.json({ error: "Nie udało się połączyć ze źródłem audio." }, { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    console.error("Jamendo stream rejected", { trackId, status: upstream.status });
    return NextResponse.json({ error: "Źródło audio chwilowo nie odpowiada." }, { status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502 });
  }

  const responseHeaders = new Headers();
  for (const key of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(key);
    if (value) responseHeaders.set(key, value);
  }
  if (!responseHeaders.has("content-type")) responseHeaders.set("content-type", "audio/mpeg");
  if (!responseHeaders.has("accept-ranges")) responseHeaders.set("accept-ranges", "bytes");
  responseHeaders.set("cache-control", "public, max-age=60");
  responseHeaders.set("x-meow-audio-proxy", "jamendo");

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
