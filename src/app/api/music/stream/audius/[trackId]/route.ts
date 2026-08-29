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
  if (!/^[A-Za-z0-9_-]{2,180}$/.test(trackId)) {
    return NextResponse.json({ error: "Nieprawidłowy utwór." }, { status: 400 });
  }

  const target = new URL(`https://api.audius.co/v1/tracks/${encodeURIComponent(trackId)}/stream`);
  const apiKey = process.env.AUDIUS_API_KEY?.trim();
  if (apiKey) target.searchParams.set("api_key", apiKey);

  const headers = new Headers({
    Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
    "User-Agent": "Meow/5.1 Music Studio",
  });
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);
  const bearerToken = process.env.AUDIUS_API_BEARER_TOKEN?.trim();
  if (bearerToken) headers.set("Authorization", `Bearer ${bearerToken}`);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers,
      redirect: "follow",
      cache: "no-store",
    });
  } catch (cause) {
    console.error("Audius stream fetch failed", cause);
    return NextResponse.json({ error: "Nie udało się połączyć ze źródłem audio." }, { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    console.error("Audius stream rejected", { trackId, status: upstream.status });
    const message = upstream.status === 401 || upstream.status === 403
      ? "Ten utwór ma ograniczony dostęp i nie może zostać odtworzony bez dodatkowych uprawnień."
      : "Źródło audio chwilowo nie odpowiada.";
    return NextResponse.json({ error: message }, { status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502 });
  }

  const responseHeaders = new Headers();
  for (const key of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(key);
    if (value) responseHeaders.set(key, value);
  }
  if (!responseHeaders.has("content-type")) responseHeaders.set("content-type", "audio/mpeg");
  if (!responseHeaders.has("accept-ranges")) responseHeaders.set("accept-ranges", "bytes");
  responseHeaders.set("cache-control", "private, max-age=60");
  responseHeaders.set("x-meow-audio-proxy", "audius");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
