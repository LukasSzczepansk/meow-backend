export type MusicProviderName = "youtube" | "audius" | "jamendo" | "musicbrainz";
export type MusicRepeatMode = "off" | "all" | "one";

export interface MusicTrackSummary {
  provider: MusicProviderName;
  providerTrackId: string;
  title: string;
  artist: string;
  album: string | null;
  artworkUrl: string | null;
  durationMs: number | null;
  sourcePermalink: string | null;
  streamable: boolean;
}

export interface CoupleTrack extends MusicTrackSummary {
  id: string;
  addedByMemberId: string;
  addedByNickname: string | null;
  addedByMe: boolean;
  isOurSong: boolean;
  createdAt: string;
}

export interface MusicPlaylistTrack extends CoupleTrack {
  playlistTrackId: string;
  position: number;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  vibe: string | null;
  createdByMemberId: string;
  createdByNickname: string | null;
  createdByMe: boolean;
  createdAt: string;
  updatedAt: string;
  trackCount: number;
  tracks: MusicPlaylistTrack[];
}

export interface MusicRoomState {
  provider: MusicProviderName;
  providerTrackId: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  durationMs: number | null;
  sourcePermalink: string | null;
  isPlaying: boolean;
  positionMs: number;
  computedPositionMs: number;
  stateChangedAt: string;
  updatedAt: string;
  updatedByMemberId: string | null;
  updatedByMe: boolean;
}

export interface MusicDiscoverPayload {
  configured: boolean;
  popular: MusicTrackSummary[];
  message?: string;
}
