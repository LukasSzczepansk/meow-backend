import "server-only";
import type { MusicTrackSummary } from "@/lib/music/types";

const MUSICBRAINZ_BASE = "https://musicbrainz.org/ws/2";
const AUDIUS_BASE = "https://api.audius.co/v1";
const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3";
const SEARCH_CACHE_TTL_MS = 30 * 60 * 1000;
const DISCOVER_CACHE_TTL_MS = 30 * 60 * 1000;

interface SearchCacheEntry {
  expiresAt: number;
  tracks: MusicTrackSummary[];
}

type MusicGlobals = typeof globalThis & {
  __meowMusicSearchCache?: Map<string, SearchCacheEntry>;
  __meowMusicBrainzQueue?: Promise<void>;
  __meowMusicBrainzLastRequestAt?: number;
};

const musicGlobals = globalThis as MusicGlobals;
const searchCache = musicGlobals.__meowMusicSearchCache ?? new Map<string, SearchCacheEntry>();
musicGlobals.__meowMusicSearchCache = searchCache;

export function youtubeMusicConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY?.trim());
}

export async function searchMusic(source: "youtube" | "audius" | "musicbrainz", query: string): Promise<MusicTrackSummary[]> {
  const normalized = query.trim().replace(/\s+/g, " ").slice(0, 120);
  if (normalized.length < 2) return [];

  const cacheKey = `${source}:${normalized.toLocaleLowerCase("pl-PL")}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.tracks;

  const tracks = source === "youtube"
    ? await searchYouTube(normalized)
    : source === "audius"
      ? await searchAudius(normalized)
      : await searchMusicBrainz(normalized);

  searchCache.set(cacheKey, { tracks, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS });
  return tracks;
}

export async function getPopularMusicInPoland(): Promise<MusicTrackSummary[]> {
  const cacheKey = "youtube:discover:PL";
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.tracks;

  const apiKey = requireYouTubeApiKey();
  const url = new URL(`${YOUTUBE_BASE}/videos`);
  url.searchParams.set("part", "snippet,contentDetails,statistics,status");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("regionCode", "PL");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("maxResults", "18");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) throw new Error(`YouTube discover failed: ${response.status}`);
  const payload: unknown = await response.json();
  const items = asRecord(payload)?.items;
  if (!Array.isArray(items)) return [];

  const tracks = items
    .map((item) => toYouTubeTrack(item, ""))
    .filter((track): track is MusicTrackSummary => Boolean(track))
    .slice(0, 12);

  searchCache.set(cacheKey, { tracks, expiresAt: Date.now() + DISCOVER_CACHE_TTL_MS });
  return tracks;
}

async function searchYouTube(query: string): Promise<MusicTrackSummary[]> {
  const apiKey = requireYouTubeApiKey();

  const searchUrl = new URL(`${YOUTUBE_BASE}/search`);
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("maxResults", "25");
  searchUrl.searchParams.set("regionCode", "PL");
  searchUrl.searchParams.set("relevanceLanguage", "pl");
  searchUrl.searchParams.set("safeSearch", "moderate");
  searchUrl.searchParams.set("videoCategoryId", "10");
  searchUrl.searchParams.set("videoEmbeddable", "true");
  searchUrl.searchParams.set("videoSyndicated", "true");
  searchUrl.searchParams.set("key", apiKey);

  const searchResponse = await fetch(searchUrl, { cache: "no-store" });
  if (!searchResponse.ok) throw new Error(`YouTube search failed: ${searchResponse.status}`);

  const searchPayload: unknown = await searchResponse.json();
  const searchItems = asRecord(searchPayload)?.items;
  if (!Array.isArray(searchItems)) return [];

  const ids = searchItems
    .map((item) => asString(asRecord(asRecord(item)?.id)?.videoId))
    .filter((id): id is string => Boolean(id));
  if (!ids.length) return [];

  const videosUrl = new URL(`${YOUTUBE_BASE}/videos`);
  videosUrl.searchParams.set("part", "snippet,contentDetails,statistics,status");
  videosUrl.searchParams.set("id", ids.join(","));
  videosUrl.searchParams.set("key", apiKey);

  const videosResponse = await fetch(videosUrl, { cache: "no-store" });
  if (!videosResponse.ok) throw new Error(`YouTube videos lookup failed: ${videosResponse.status}`);
  const videosPayload: unknown = await videosResponse.json();
  const videos = asRecord(videosPayload)?.items;
  if (!Array.isArray(videos)) return [];

  return videos
    .map((item) => ({ track: toYouTubeTrack(item, query), score: scoreYouTubeResult(item, query) }))
    .filter((entry): entry is { track: MusicTrackSummary; score: number } => Boolean(entry.track))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.track)
    .slice(0, 18);
}

function toYouTubeTrack(value: unknown, query: string): MusicTrackSummary | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = asString(row.id);
  const snippet = asRecord(row.snippet);
  const status = asRecord(row.status);
  if (!id || !snippet || status?.embeddable === false) return null;

  const rawTitle = decodeHtml(asString(snippet.title) ?? "");
  const channelTitle = decodeHtml(asString(snippet.channelTitle) ?? "Nieznany wykonawca");
  if (!rawTitle) return null;

  const metadata = inferTrackMetadata(rawTitle, channelTitle, query);
  const thumbnails = asRecord(snippet.thumbnails);
  const artworkUrl = pickYouTubeThumbnail(thumbnails);
  const contentDetails = asRecord(row.contentDetails);
  const durationMs = parseIsoDurationMs(asString(contentDetails?.duration));

  if (durationMs !== null && (durationMs < 45_000 || durationMs > 30 * 60_000)) return null;

  return {
    provider: "youtube",
    providerTrackId: id,
    title: metadata.title,
    artist: metadata.artist,
    album: null,
    artworkUrl,
    durationMs,
    sourcePermalink: `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
    streamable: true,
  };
}

function scoreYouTubeResult(value: unknown, query: string) {
  const row = asRecord(value);
  const snippet = asRecord(row?.snippet);
  const statistics = asRecord(row?.statistics);
  const contentDetails = asRecord(row?.contentDetails);
  const title = decodeHtml(asString(snippet?.title) ?? "").toLocaleLowerCase("pl-PL");
  const channel = decodeHtml(asString(snippet?.channelTitle) ?? "").toLocaleLowerCase("pl-PL");
  const normalizedQuery = query.toLocaleLowerCase("pl-PL").trim();
  const viewCount = Number(asString(statistics?.viewCount) ?? "0");
  const duration = parseIsoDurationMs(asString(contentDetails?.duration));

  let score = 0;
  if (title.includes(normalizedQuery)) score += 18;
  if (channel.endsWith(" - topic") || channel.includes("vevo")) score += 18;
  if (/official\s+(video|audio)|oficjalny|official music video/.test(title)) score += 12;
  if (/audio/.test(title)) score += 4;
  if (/lyrics?|tekst/.test(title)) score -= 2;
  if (/cover|karaoke|nightcore|sped\s*up|slowed|reverb|reaction|8d\s*audio|instrumental/.test(title)) score -= 28;
  if (/remix|mix\b/.test(title) && !normalizedQuery.includes("remix")) score -= 13;
  if (/live|koncert/.test(title) && !normalizedQuery.includes("live")) score -= 8;
  if (Number.isFinite(viewCount) && viewCount > 0) score += Math.min(18, Math.log10(viewCount + 1) * 2.3);
  if (duration !== null && duration >= 120_000 && duration <= 8 * 60_000) score += 6;
  if (duration !== null && duration > 15 * 60_000) score -= 10;
  return score;
}

function inferTrackMetadata(rawTitle: string, channelTitle: string, query: string) {
  const cleaned = rawTitle
    .replace(/\s*[\[(](official(?: music)? video|official audio|official lyric video|lyrics?|tekst|audio|visualizer|4k)[\])]/gi, "")
    .replace(/\s+official(?: music)? video\s*$/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const separators = [" - ", " – ", " — "];
  for (const separator of separators) {
    const index = cleaned.indexOf(separator);
    if (index > 0 && index < cleaned.length - separator.length) {
      const left = cleaned.slice(0, index).trim();
      const right = cleaned.slice(index + separator.length).trim();
      if (left && right && left.length <= 90) return { artist: left, title: right };
    }
  }

  const artist = channelTitle
    .replace(/\s+-\s+Topic$/i, "")
    .replace(/VEVO$/i, "")
    .trim() || query.trim() || "Nieznany wykonawca";
  return { artist, title: cleaned };
}

function pickYouTubeThumbnail(thumbnails: Record<string, unknown> | null) {
  if (!thumbnails) return null;
  for (const key of ["maxres", "standard", "high", "medium", "default"]) {
    const thumbnail = asRecord(thumbnails[key]);
    const url = safeExternalUrl(asString(thumbnail?.url));
    if (url) return url;
  }
  return null;
}

function requireYouTubeApiKey() {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) throw new Error("YOUTUBE_API_KEY is not configured");
  return key;
}

async function searchAudius(query: string): Promise<MusicTrackSummary[]> {
  const url = new URL(`${AUDIUS_BASE}/tracks/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("limit", "18");
  url.searchParams.set("sort_method", "relevant");
  const apiKey = process.env.AUDIUS_API_KEY?.trim();
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const headers = new Headers({ Accept: "application/json" });
  const bearerToken = process.env.AUDIUS_API_BEARER_TOKEN?.trim();
  if (bearerToken) headers.set("Authorization", `Bearer ${bearerToken}`);

  const response = await fetch(url, { headers, next: { revalidate: 600 } });
  if (!response.ok) throw new Error(`Audius search failed: ${response.status}`);

  const payload: unknown = await response.json();
  const data = asRecord(payload)?.data;
  if (!Array.isArray(data)) return [];

  return data.map(toAudiusTrack).filter((track): track is MusicTrackSummary => Boolean(track));
}

function toAudiusTrack(value: unknown): MusicTrackSummary | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = asString(row.id);
  const title = asString(row.title);
  if (!id || !title) return null;

  const user = asRecord(row.user);
  const artist = asString(user?.name) ?? asString(user?.handle) ?? "Nieznany wykonawca";
  const artwork = asRecord(row.artwork);
  const artworkUrl = asString(artwork?._480x480) ?? asString(artwork?.["480x480"]) ?? asString(artwork?._150x150) ?? asString(artwork?.["150x150"]);
  const durationSeconds = asNumber(row.duration);
  const streamFlag = row.isStreamable ?? row.is_streamable;
  const access = asRecord(row.access);
  const streamGate = row.isStreamGated ?? row.is_stream_gated;
  const flagAllowsStream = streamFlag === undefined || streamFlag === null || streamFlag === true || streamFlag === "true";
  const accessAllowsStream = access?.stream !== false && access?.stream !== "false";
  const isGated = streamGate === true || streamGate === "true";

  return {
    provider: "audius",
    providerTrackId: id,
    title,
    artist,
    album: asString(row.albumName) ?? asString(row.album_name),
    artworkUrl: safeExternalUrl(artworkUrl),
    durationMs: durationSeconds && durationSeconds > 0 ? Math.round(durationSeconds * 1000) : null,
    sourcePermalink: safeExternalUrl(asString(row.permalink)),
    streamable: flagAllowsStream && accessAllowsStream && !isGated,
  };
}

async function searchMusicBrainz(query: string): Promise<MusicTrackSummary[]> {
  await waitForMusicBrainzSlot();
  const url = new URL(`${MUSICBRAINZ_BASE}/recording`);
  url.searchParams.set("query", query);
  url.searchParams.set("limit", "18");
  url.searchParams.set("fmt", "json");

  const contact = process.env.MUSICBRAINZ_CONTACT?.trim() || "local-development";
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": `Meow/6.0 (${contact})` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`MusicBrainz search failed: ${response.status}`);

  const payload: unknown = await response.json();
  const recordings = asRecord(payload)?.recordings;
  if (!Array.isArray(recordings)) return [];
  return recordings.map(toMusicBrainzTrack).filter((track): track is MusicTrackSummary => Boolean(track));
}

function toMusicBrainzTrack(value: unknown): MusicTrackSummary | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = asString(row.id);
  const title = asString(row.title);
  if (!id || !title) return null;

  const artistCredit = Array.isArray(row["artist-credit"]) ? row["artist-credit"] : [];
  const artist = artistCredit
    .map((credit) => {
      const creditRecord = asRecord(credit);
      const artistRecord = asRecord(creditRecord?.artist);
      return asString(creditRecord?.name) ?? asString(artistRecord?.name);
    })
    .filter((name): name is string => Boolean(name))
    .join(", ") || "Nieznany wykonawca";

  const releases = Array.isArray(row.releases) ? row.releases : [];
  const firstRelease = asRecord(releases[0]);
  const length = asNumber(row.length);

  return {
    provider: "musicbrainz",
    providerTrackId: id,
    title,
    artist,
    album: asString(firstRelease?.title),
    artworkUrl: null,
    durationMs: length && length > 0 ? Math.round(length) : null,
    sourcePermalink: `https://musicbrainz.org/recording/${encodeURIComponent(id)}`,
    streamable: false,
  };
}

async function waitForMusicBrainzSlot(): Promise<void> {
  const previous = musicGlobals.__meowMusicBrainzQueue ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(async () => {
    const last = musicGlobals.__meowMusicBrainzLastRequestAt ?? 0;
    const remaining = 1100 - (Date.now() - last);
    if (remaining > 0) await delay(remaining);
    musicGlobals.__meowMusicBrainzLastRequestAt = Date.now();
  });
  musicGlobals.__meowMusicBrainzQueue = next;
  await next;
}

function parseIsoDurationMs(value: string | null) {
  if (!value) return null;
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
