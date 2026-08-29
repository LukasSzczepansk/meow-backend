export const MUSIC_PROVIDERS = ["youtube", "soundcloud", "audius", "jamendo", "musicbrainz"] as const;
export type MusicProvider = (typeof MUSIC_PROVIDERS)[number];

export interface MusicTrackInput {
  provider: MusicProvider;
  providerTrackId: string;
  title: string;
  artist: string;
  album: string | null;
  artworkUrl: string | null;
  durationMs: number | null;
  sourcePermalink: string | null;
}

export function asMusicProvider(value: unknown): MusicProvider | null {
  return typeof value === "string" && (MUSIC_PROVIDERS as readonly string[]).includes(value)
    ? (value as MusicProvider)
    : null;
}

export function parseMusicTrackInput(value: unknown): MusicTrackInput | null {
  const body = asRecord(value);
  if (!body) return null;

  const provider = asMusicProvider(body.provider);
  const providerTrackId = asShortString(body.providerTrackId, 180);
  const title = asShortString(body.title, 240);
  const artist = asShortString(body.artist, 240);
  if (!provider || !providerTrackId || !title || !artist) return null;

  const durationMs = typeof body.durationMs === "number" && Number.isFinite(body.durationMs)
    ? Math.max(0, Math.min(24 * 60 * 60 * 1000, Math.round(body.durationMs)))
    : null;

  return {
    provider,
    providerTrackId,
    title,
    artist,
    album: asShortString(body.album, 300),
    artworkUrl: safeHttpsUrl(body.artworkUrl),
    durationMs,
    sourcePermalink: safeHttpsUrl(body.sourcePermalink),
  };
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

export function asShortString(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

export function safeHttpsUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Used only for audio that Meow is allowed to host/stream directly.
 * Intentionally rejects known YouTube media/player hosts: this endpoint is not
 * a YouTube downloader or extractor.
 */
export function safeOwnedAudioUrl(value: unknown): string | null {
  const parsed = safeHttpsUrl(value);
  if (!parsed) return null;
  const host = new URL(parsed).hostname.toLowerCase();
  const blocked = [
    "youtube.com",
    "www.youtube.com",
    "youtu.be",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
    "googlevideo.com",
  ];
  if (blocked.some((domain) => host === domain || host.endsWith(`.${domain}`))) return null;
  return parsed;
}
