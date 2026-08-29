import "server-only";
import type { MusicTrackSummary } from "@/lib/music/types";

const MUSICBRAINZ_BASE = "https://musicbrainz.org/ws/2";
const SOUNDCLOUD_BASE = "https://api.soundcloud.com";
const SOUNDCLOUD_AUTH_BASE = "https://secure.soundcloud.com";
const AUDIUS_BASE = "https://api.audius.co/v1";
const JAMENDO_BASE = "https://api.jamendo.com/v3.0";
const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3";
const SEARCH_CACHE_TTL_MS = 30 * 60 * 1000;
const DISCOVER_CACHE_TTL_MS = 30 * 60 * 1000;

interface SearchCacheEntry {
  expiresAt: number;
  tracks: MusicTrackSummary[];
}

interface SoundCloudTokenState {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
}

type MusicGlobals = typeof globalThis & {
  __meowMusicSearchCache?: Map<string, SearchCacheEntry>;
  __meowMusicBrainzQueue?: Promise<void>;
  __meowMusicBrainzLastRequestAt?: number;
  __meowSoundCloudToken?: SoundCloudTokenState;
  __meowSoundCloudTokenPromise?: Promise<SoundCloudTokenState>;
};

const musicGlobals = globalThis as MusicGlobals;
const searchCache = musicGlobals.__meowMusicSearchCache ?? new Map<string, SearchCacheEntry>();
musicGlobals.__meowMusicSearchCache = searchCache;

export function youtubeMusicConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY?.trim());
}

export function jamendoMusicConfigured() {
  return Boolean(process.env.JAMENDO_CLIENT_ID?.trim());
}

export function soundCloudMusicConfigured() {
  return Boolean(process.env.SOUNDCLOUD_CLIENT_ID?.trim() && process.env.SOUNDCLOUD_CLIENT_SECRET?.trim());
}

export async function searchMusic(source: "youtube" | "soundcloud" | "audius" | "jamendo" | "musicbrainz", query: string): Promise<MusicTrackSummary[]> {
  const normalized = query.trim().replace(/\s+/g, " ").slice(0, 120);
  if (normalized.length < 2) return [];

  const cacheKey = `${source}:${normalized.toLocaleLowerCase("pl-PL")}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.tracks;

  const tracks = source === "youtube"
    ? await searchYouTube(normalized)
    : source === "soundcloud"
      ? await searchSoundCloud(normalized)
      : source === "audius"
        ? await searchAudius(normalized)
        : source === "jamendo"
          ? await searchJamendo(normalized)
          : await searchMusicBrainz(normalized);

  searchCache.set(cacheKey, { tracks, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS });
  return tracks;
}


export async function searchUnifiedMusic(query: string): Promise<MusicTrackSummary[]> {
  const normalized = query.trim().replace(/\s+/g, " ").slice(0, 120);
  if (normalized.length < 2) return [];

  const [soundcloud, audius, jamendo, youtube] = await Promise.all([
    soundCloudMusicConfigured()
      ? searchMusic("soundcloud", normalized).catch((cause) => {
          console.error("SoundCloud unified search failed", cause);
          return [] as MusicTrackSummary[];
        })
      : Promise.resolve([] as MusicTrackSummary[]),
    searchMusic("audius", normalized).catch((cause) => {
      console.error("Audius unified search failed", cause);
      return [] as MusicTrackSummary[];
    }),
    jamendoMusicConfigured()
      ? searchMusic("jamendo", normalized).catch((cause) => {
          console.error("Jamendo unified search failed", cause);
          return [] as MusicTrackSummary[];
        })
      : Promise.resolve([] as MusicTrackSummary[]),
    youtubeMusicConfigured()
      ? searchMusic("youtube", normalized).catch((cause) => {
          console.error("YouTube unified search failed", cause);
          return [] as MusicTrackSummary[];
        })
      : Promise.resolve([] as MusicTrackSummary[]),
  ]);

  return interleaveUnique([soundcloud, audius, jamendo, youtube], 36);
}

export async function getOpenMusicDiscovery(): Promise<MusicTrackSummary[]> {
  const [audius, jamendo] = await Promise.all([
    getAudiusTrending().catch((cause) => {
      console.error("Audius discovery failed", cause);
      return [] as MusicTrackSummary[];
    }),
    jamendoMusicConfigured()
      ? getJamendoFeatured().catch((cause) => {
          console.error("Jamendo discovery failed", cause);
          return [] as MusicTrackSummary[];
        })
      : Promise.resolve([] as MusicTrackSummary[]),
  ]);
  return interleaveUnique([audius, jamendo], 20);
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

export async function getSoundCloudStreamUrl(trackUrn: string): Promise<string | null> {
  if (!soundCloudMusicConfigured()) return null;
  if (!/^(?:soundcloud:tracks:)?\d{1,30}$/.test(trackUrn)) return null;

  const url = new URL(`${SOUNDCLOUD_BASE}/tracks/${encodeURIComponent(trackUrn)}/streams`);
  const payload = await fetchSoundCloudJson(url);
  const streams = asRecord(payload);
  if (!streams) return null;

  return safeExternalUrl(asString(streams.hls_aac_160_url))
    ?? safeExternalUrl(asString(streams.hls_aac_96_url))
    ?? null;
}

async function searchSoundCloud(query: string): Promise<MusicTrackSummary[]> {
  if (!soundCloudMusicConfigured()) return [];
  const url = new URL(`${SOUNDCLOUD_BASE}/tracks`);
  url.searchParams.set("q", query);
  url.searchParams.set("access", "playable");
  url.searchParams.set("limit", "18");
  url.searchParams.set("linked_partitioning", "true");

  const payload = await fetchSoundCloudJson(url);
  const root = asRecord(payload);
  const collection = Array.isArray(payload) ? payload : root?.collection;
  if (!Array.isArray(collection)) return [];
  return collection.map(toSoundCloudTrack).filter((track): track is MusicTrackSummary => Boolean(track));
}

function toSoundCloudTrack(value: unknown): MusicTrackSummary | null {
  const row = asRecord(value);
  if (!row) return null;

  const legacyId = typeof row.id === "number" || typeof row.id === "string" ? String(row.id) : null;
  const urn = asString(row.urn) ?? (legacyId ? `soundcloud:tracks:${legacyId}` : null);
  const title = asString(row.title);
  if (!urn || !title) return null;

  const user = asRecord(row.user);
  const publisher = asRecord(row.publisher_metadata);
  const artist = asString(row.metadata_artist)
    ?? asString(publisher?.artist)
    ?? asString(user?.username)
    ?? "Nieznany wykonawca";
  const access = asString(row.access);
  const streamable = row.streamable !== false && access !== "preview" && access !== "blocked";
  if (!streamable) return null;

  const durationMs = asNumber(row.duration);
  return {
    provider: "soundcloud",
    providerTrackId: urn,
    title,
    artist,
    album: asString(publisher?.album_title),
    artworkUrl: normalizeSoundCloudArtwork(asString(row.artwork_url)),
    durationMs: durationMs && durationMs > 0 ? Math.round(durationMs) : null,
    sourcePermalink: safeExternalUrl(asString(row.permalink_url)),
    streamable: true,
  };
}

async function fetchSoundCloudJson(url: URL): Promise<unknown> {
  const firstToken = await getSoundCloudAccessToken();
  let response = await fetch(url, {
    headers: {
      Accept: "application/json; charset=utf-8",
      Authorization: `OAuth ${firstToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    musicGlobals.__meowSoundCloudToken = undefined;
    const nextToken = await getSoundCloudAccessToken(true);
    response = await fetch(url, {
      headers: {
        Accept: "application/json; charset=utf-8",
        Authorization: `OAuth ${nextToken}`,
      },
      cache: "no-store",
    });
  }

  if (!response.ok) throw new Error(`SoundCloud request failed: ${response.status}`);
  return response.json();
}

async function getSoundCloudAccessToken(forceRefresh = false): Promise<string> {
  if (!soundCloudMusicConfigured()) throw new Error("SoundCloud is not configured");

  const current = musicGlobals.__meowSoundCloudToken;
  if (!forceRefresh && current && current.expiresAt > Date.now() + 60_000) return current.accessToken;
  if (!forceRefresh && musicGlobals.__meowSoundCloudTokenPromise) {
    return (await musicGlobals.__meowSoundCloudTokenPromise).accessToken;
  }

  const pending = requestSoundCloudToken(!forceRefresh ? current?.refreshToken ?? null : null);
  musicGlobals.__meowSoundCloudTokenPromise = pending;
  try {
    const next = await pending;
    musicGlobals.__meowSoundCloudToken = next;
    return next.accessToken;
  } finally {
    if (musicGlobals.__meowSoundCloudTokenPromise === pending) {
      musicGlobals.__meowSoundCloudTokenPromise = undefined;
    }
  }
}

async function requestSoundCloudToken(refreshToken: string | null): Promise<SoundCloudTokenState> {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID?.trim();
  const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error("SoundCloud credentials are not configured");

  const body = new URLSearchParams();
  const headers = new Headers({
    Accept: "application/json; charset=utf-8",
    "Content-Type": "application/x-www-form-urlencoded",
  });

  if (refreshToken) {
    body.set("grant_type", "refresh_token");
    body.set("client_id", clientId);
    body.set("client_secret", clientSecret);
    body.set("refresh_token", refreshToken);
  } else {
    body.set("grant_type", "client_credentials");
    headers.set("Authorization", `Basic ${Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64")}`);
  }

  const response = await fetch(`${SOUNDCLOUD_AUTH_BASE}/oauth/token`, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    if (refreshToken) return requestSoundCloudToken(null);
    throw new Error(`SoundCloud token exchange failed: ${response.status}`);
  }

  const payload = asRecord(await response.json());
  const accessToken = asString(payload?.access_token);
  if (!accessToken) throw new Error("SoundCloud token response is missing access_token");
  const expiresIn = Math.max(300, asNumber(payload?.expires_in) ?? 3600);
  return {
    accessToken,
    refreshToken: asString(payload?.refresh_token),
    expiresAt: Date.now() + expiresIn * 1000,
  };
}

function normalizeSoundCloudArtwork(value: string | null): string | null {
  const url = safeExternalUrl(value);
  if (!url) return null;
  return url.replace(/-large(?=\.[a-z0-9]+(?:\?|$))/i, "-t500x500");
}

async function searchAudius(query: string): Promise<MusicTrackSummary[]> {
  const url = new URL(`${AUDIUS_BASE}/tracks/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("limit", "18");
  url.searchParams.set("sort_method", "relevant");
  const apiKey = process.env.AUDIUS_API_KEY?.trim();
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const headers = audiusHeaders();

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

async function getAudiusTrending(): Promise<MusicTrackSummary[]> {
  const url = new URL(`${AUDIUS_BASE}/tracks/trending`);
  url.searchParams.set("limit", "14");
  url.searchParams.set("time", "week");
  const apiKey = process.env.AUDIUS_API_KEY?.trim();
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const headers = audiusHeaders();
  const response = await fetch(url, { headers, next: { revalidate: 900 } });
  if (!response.ok) throw new Error(`Audius trending failed: ${response.status}`);
  const payload: unknown = await response.json();
  const data = asRecord(payload)?.data;
  if (!Array.isArray(data)) return [];
  return data.map(toAudiusTrack).filter((track): track is MusicTrackSummary => Boolean(track));
}

async function searchJamendo(query: string): Promise<MusicTrackSummary[]> {
  const clientId = process.env.JAMENDO_CLIENT_ID?.trim();
  if (!clientId) return [];
  const url = new URL(`${JAMENDO_BASE}/tracks/`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "18");
  url.searchParams.set("search", query);
  url.searchParams.set("audioformat", "mp32");
  url.searchParams.set("imagesize", "500");
  url.searchParams.set("groupby", "artist_id");
  url.searchParams.set("boost", "popularity_month");

  const response = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 600 } });
  if (!response.ok) throw new Error(`Jamendo search failed: ${response.status}`);
  const payload: unknown = await response.json();
  const results = asRecord(payload)?.results;
  if (!Array.isArray(results)) return [];
  return results.map(toJamendoTrack).filter((track): track is MusicTrackSummary => Boolean(track));
}

async function getJamendoFeatured(): Promise<MusicTrackSummary[]> {
  const clientId = process.env.JAMENDO_CLIENT_ID?.trim();
  if (!clientId) return [];
  const url = new URL(`${JAMENDO_BASE}/tracks/`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "14");
  url.searchParams.set("featured", "1");
  url.searchParams.set("order", "popularity_month_desc");
  url.searchParams.set("audioformat", "mp32");
  url.searchParams.set("imagesize", "500");
  url.searchParams.set("groupby", "artist_id");

  const response = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 900 } });
  if (!response.ok) throw new Error(`Jamendo featured failed: ${response.status}`);
  const payload: unknown = await response.json();
  const results = asRecord(payload)?.results;
  if (!Array.isArray(results)) return [];
  return results.map(toJamendoTrack).filter((track): track is MusicTrackSummary => Boolean(track));
}

function toJamendoTrack(value: unknown): MusicTrackSummary | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = asString(row.id);
  const title = asString(row.name);
  const artist = asString(row.artist_name);
  if (!id || !title || !artist) return null;

  const durationSeconds = asNumber(row.duration);
  const audio = safeExternalUrl(asString(row.audio));
  const artworkUrl = safeExternalUrl(asString(row.image)) ?? safeExternalUrl(asString(row.album_image));
  return {
    provider: "jamendo",
    providerTrackId: id,
    title,
    artist,
    album: asString(row.album_name),
    artworkUrl,
    durationMs: durationSeconds && durationSeconds > 0 ? Math.round(durationSeconds * 1000) : null,
    sourcePermalink: safeExternalUrl(asString(row.shareurl)) ?? `https://www.jamendo.com/track/${encodeURIComponent(id)}`,
    streamable: Boolean(audio),
  };
}

function audiusHeaders() {
  const headers = new Headers({ Accept: "application/json" });
  const bearerToken = process.env.AUDIUS_API_BEARER_TOKEN?.trim();
  if (bearerToken) headers.set("Authorization", `Bearer ${bearerToken}`);
  return headers;
}

function interleaveUnique(groups: MusicTrackSummary[][], limit: number) {
  const output: MusicTrackSummary[] = [];
  const seen = new Set<string>();
  const maxLength = Math.max(0, ...groups.map((group) => group.length));
  for (let index = 0; index < maxLength && output.length < limit; index += 1) {
    for (const group of groups) {
      const track = group[index];
      if (!track) continue;
      const key = `${track.provider}:${track.providerTrackId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      output.push(track);
      if (output.length >= limit) break;
    }
  }
  return output;
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
