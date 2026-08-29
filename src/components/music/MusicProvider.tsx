"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MusicRepeatMode, MusicRoomState, MusicTrackSummary } from "@/lib/music/types";

export interface YouTubeMusicController {
  load: (videoId: string, startSeconds: number, autoplay: boolean) => void;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  getCurrentTimeMs: () => number;
  getDurationMs: () => number | null;
  getVideoId: () => string | null;
}

interface MusicContextValue {
  room: MusicRoomState | null;
  joined: boolean;
  blocked: boolean;
  localPositionMs: number;
  volume: number;
  error: string | null;
  queue: MusicTrackSummary[];
  queueIndex: number;
  repeatMode: MusicRepeatMode;
  playTrack: (track: MusicTrackSummary) => Promise<void>;
  playQueue: (tracks: MusicTrackSummary[], startIndex?: number) => Promise<void>;
  joinRoom: () => Promise<void>;
  leaveRoom: () => void;
  togglePlayback: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => void;
  refreshRoom: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  shuffleQueue: () => void;
  toggleRepeat: () => void;
  clearError: () => void;
  registerYouTubeController: (controller: YouTubeMusicController | null) => void;
  syncYouTubeNativeState: (isPlaying: boolean, positionMs: number) => Promise<void>;
}

const MusicContext = createContext<MusicContextValue | null>(null);

const MEDIA_SESSION_ACTIONS: MediaSessionAction[] = [
  "play",
  "pause",
  "previoustrack",
  "nexttrack",
  "seekbackward",
  "seekforward",
  "seekto",
  "stop",
];

function setMediaSessionAction(action: MediaSessionAction, handler: MediaSessionActionHandler | null) {
  if (!("mediaSession" in navigator)) return;
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {
    // Some browsers expose Media Session but do not support every action.
  }
}

function clearMediaSessionActions() {
  for (const action of MEDIA_SESSION_ACTIONS) setMediaSessionAction(action, null);
}

function updateMediaSessionPosition(audio: HTMLAudioElement, room: MusicRoomState | null) {
  if (!("mediaSession" in navigator) || typeof navigator.mediaSession.setPositionState !== "function") return;
  if (!room || room.provider !== "audius") return;

  const durationSeconds = Number.isFinite(audio.duration) && audio.duration > 0
    ? audio.duration
    : room.durationMs && room.durationMs > 0
      ? room.durationMs / 1000
      : 0;
  if (!durationSeconds) return;

  const position = Math.max(0, Math.min(durationSeconds, Number.isFinite(audio.currentTime) ? audio.currentTime : 0));
  try {
    navigator.mediaSession.setPositionState({
      duration: durationSeconds,
      playbackRate: audio.playbackRate || 1,
      position,
    });
  } catch {
    // Ignore temporary metadata/position races while the next track is loading.
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioTrackIdRef = useRef<string | null>(null);
  const youtubeControllerRef = useRef<YouTubeMusicController | null>(null);
  const volumeRef = useRef(0.82);
  const roomRef = useRef<MusicRoomState | null>(null);
  const joinedRef = useRef(false);
  const [room, setRoomState] = useState<MusicRoomState | null>(null);
  const [joined, setJoinedState] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [localPositionMs, setLocalPositionMs] = useState(0);
  const [volume, setVolumeState] = useState(0.82);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<MusicTrackSummary[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState<MusicRepeatMode>("off");

  const setRoom = useCallback((next: MusicRoomState | null) => {
    roomRef.current = next;
    setRoomState(next);
  }, []);

  const setJoined = useCallback((next: boolean) => {
    joinedRef.current = next;
    setJoinedState(next);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = 0.82;
    audio.setAttribute("playsinline", "");
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (roomRef.current?.provider === "audius" && joinedRef.current) {
        setLocalPositionMs(Math.round(audio.currentTime * 1000));
        updateMediaSessionPosition(audio, roomRef.current);
      }
    };
    const onLoadedMetadata = () => updateMediaSessionPosition(audio, roomRef.current);
    const onPlay = () => {
      if ("mediaSession" in navigator && roomRef.current?.provider === "audius") {
        navigator.mediaSession.playbackState = "playing";
      }
    };
    const onPause = () => {
      if ("mediaSession" in navigator && roomRef.current?.provider === "audius") {
        navigator.mediaSession.playbackState = "paused";
      }
    };
    const onError = () => {
      if (roomRef.current?.provider !== "audius") return;
      setError("Nie udało się odtworzyć starszego utworu Audius. Wyszukaj go ponownie w nowej wyszukiwarce Meow.");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
      currentAudioTrackIdRef.current = null;
    };
  }, []);

  const ensureAudioTrack = useCallback((nextRoom: MusicRoomState) => {
    const audio = audioRef.current;
    if (!audio || nextRoom.provider !== "audius") return audio;
    if (currentAudioTrackIdRef.current !== nextRoom.providerTrackId) {
      currentAudioTrackIdRef.current = nextRoom.providerTrackId;
      audio.src = `/api/music/stream/audius/${encodeURIComponent(nextRoom.providerTrackId)}`;
      audio.load();
    }
    return audio;
  }, []);

  const registerYouTubeController = useCallback((controller: YouTubeMusicController | null) => {
    youtubeControllerRef.current = controller;
    if (!controller) {
      if (roomRef.current?.provider === "youtube") setJoined(false);
      return;
    }
    controller.setVolume(volumeRef.current);
    const currentRoom = roomRef.current;
    if (currentRoom?.provider === "youtube") {
      controller.load(
        currentRoom.providerTrackId,
        Math.max(0, currentRoom.computedPositionMs / 1000),
        joinedRef.current && currentRoom.isPlaying,
      );
    }
  }, [setJoined]);

  const applyRemoteRoom = useCallback(async (nextRoom: MusicRoomState | null) => {
    if (!nextRoom || !joinedRef.current) return;

    if (nextRoom.provider === "youtube") {
      const controller = youtubeControllerRef.current;
      if (!controller) return;
      const expectedMs = Math.max(0, nextRoom.computedPositionMs);
      if (controller.getVideoId() !== nextRoom.providerTrackId) {
        controller.load(nextRoom.providerTrackId, expectedMs / 1000, nextRoom.isPlaying);
        setLocalPositionMs(expectedMs);
        return;
      }
      const currentMs = controller.getCurrentTimeMs();
      if (Math.abs(currentMs - expectedMs) > 1500) {
        controller.seek(expectedMs / 1000);
        setLocalPositionMs(expectedMs);
      }
      if (nextRoom.isPlaying) controller.play();
      else controller.pause();
      return;
    }

    if (nextRoom.provider === "audius") {
      const audio = ensureAudioTrack(nextRoom);
      if (!audio) return;
      const expectedSeconds = Math.max(0, nextRoom.computedPositionMs / 1000);
      if (Math.abs(audio.currentTime - expectedSeconds) > 1.15 && Number.isFinite(expectedSeconds)) {
        try {
          audio.currentTime = expectedSeconds;
          setLocalPositionMs(Math.round(expectedSeconds * 1000));
        } catch {
          // Metadata can finish loading after the sync pass.
        }
      }
      if (nextRoom.isPlaying && audio.paused) {
        try {
          await audio.play();
          setBlocked(false);
        } catch (cause) {
          if (cause instanceof DOMException && cause.name === "NotAllowedError") setBlocked(true);
        }
      } else if (!nextRoom.isPlaying && !audio.paused) {
        audio.pause();
      }
    }
  }, [ensureAudioTrack]);

  const refreshRoom = useCallback(async () => {
    try {
      const response = await fetch("/api/music/room", { cache: "no-store" });
      const data = await response.json() as { room?: MusicRoomState | null; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zsynchronizować muzyki.");
      const nextRoom = data.room ?? null;
      setRoom(nextRoom);
      if (!joinedRef.current && nextRoom) setLocalPositionMs(nextRoom.computedPositionMs);
      await applyRemoteRoom(nextRoom);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się zsynchronizować muzyki.");
    }
  }, [applyRemoteRoom, setRoom]);

  useEffect(() => {
    const first = window.setTimeout(() => void refreshRoom(), 0);
    const interval = window.setInterval(() => void refreshRoom(), room?.isPlaying ? 2500 : 7000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [refreshRoom, room?.isPlaying]);

  useEffect(() => {
    if (!joined || room?.provider !== "youtube") return;
    const interval = window.setInterval(() => {
      const controller = youtubeControllerRef.current;
      if (!controller) return;
      setLocalPositionMs(controller.getCurrentTimeMs());
      const duration = controller.getDurationMs();
      if (duration && roomRef.current && !roomRef.current.durationMs) {
        const next = { ...roomRef.current, durationMs: duration };
        setRoom(next);
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [joined, room?.provider, setRoom]);

  const persistTrackToRoom = useCallback(async (track: MusicTrackSummary, play: boolean) => {
    const response = await fetch("/api/music/room", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setTrack", track, play }),
    });
    const data = await response.json() as { room?: MusicRoomState; error?: string };
    if (!response.ok || !data.room) throw new Error(data.error ?? "Nie udało się uruchomić wspólnego słuchania.");
    setRoom(data.room);
    return data.room;
  }, [setRoom]);

  const playTrackInternal = useCallback(async (track: MusicTrackSummary) => {
    if (!track.streamable || (track.provider !== "youtube" && track.provider !== "audius")) {
      setError("Ten wpis nie ma źródła, które Meow może odtworzyć.");
      return;
    }

    const now = new Date().toISOString();
    const optimistic: MusicRoomState = {
      provider: track.provider,
      providerTrackId: track.providerTrackId,
      title: track.title,
      artist: track.artist,
      artworkUrl: track.artworkUrl,
      durationMs: track.durationMs,
      sourcePermalink: track.sourcePermalink,
      isPlaying: true,
      positionMs: 0,
      computedPositionMs: 0,
      stateChangedAt: now,
      updatedAt: now,
      updatedByMemberId: null,
      updatedByMe: true,
    };

    setJoined(true);
    setBlocked(false);
    setRoom(optimistic);
    setLocalPositionMs(0);
    setError(null);

    if (track.provider === "youtube") {
      const controller = youtubeControllerRef.current;
      if (controller) controller.load(track.providerTrackId, 0, true);
    } else {
      const audio = ensureAudioTrack(optimistic);
      if (audio) {
        try {
          audio.currentTime = 0;
          await audio.play();
          setBlocked(false);
        } catch (cause) {
          if (cause instanceof DOMException && cause.name === "NotAllowedError") setBlocked(true);
          else setError("Nie udało się uruchomić starszego źródła audio.");
        }
      }
    }

    try {
      await persistTrackToRoom(track, true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się uruchomić wspólnego słuchania.");
    }
  }, [ensureAudioTrack, persistTrackToRoom, setJoined, setRoom]);

  const playTrack = useCallback(async (track: MusicTrackSummary) => {
    setQueue([track]);
    setQueueIndex(0);
    await playTrackInternal(track);
  }, [playTrackInternal]);

  const playQueue = useCallback(async (tracks: MusicTrackSummary[], startIndex = 0) => {
    const playable = tracks.filter((track) => track.streamable && (track.provider === "youtube" || track.provider === "audius"));
    if (!playable.length) {
      setError("Ta playlista nie ma jeszcze utworów dostępnych do odtwarzania.");
      return;
    }
    const safeIndex = Math.max(0, Math.min(playable.length - 1, startIndex));
    setQueue(playable);
    setQueueIndex(safeIndex);
    await playTrackInternal(playable[safeIndex]);
  }, [playTrackInternal]);

  const joinRoom = useCallback(async () => {
    const currentRoom = roomRef.current;
    if (!currentRoom || (currentRoom.provider !== "youtube" && currentRoom.provider !== "audius")) return;
    setJoined(true);
    setBlocked(false);
    setError(null);

    if (currentRoom.provider === "youtube") {
      const controller = youtubeControllerRef.current;
      if (!controller) {
        setError("Otwórz ekran Nasza muzyka, aby dołączyć do odtwarzania YouTube.");
        return;
      }
      controller.load(currentRoom.providerTrackId, currentRoom.computedPositionMs / 1000, currentRoom.isPlaying);
      return;
    }

    const audio = ensureAudioTrack(currentRoom);
    if (!audio) return;
    try { audio.currentTime = Math.max(0, currentRoom.computedPositionMs / 1000); } catch { /* metadata may still load */ }
    if (currentRoom.isPlaying) {
      try {
        await audio.play();
        setBlocked(false);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "NotAllowedError") setBlocked(true);
        else setError("Nie udało się włączyć dźwięku na tym urządzeniu.");
      }
    }
  }, [ensureAudioTrack, setJoined]);

  const leaveRoom = useCallback(() => {
    audioRef.current?.pause();
    youtubeControllerRef.current?.pause();
    setJoined(false);
    setBlocked(false);
  }, [setJoined]);

  const sendPlayerAction = useCallback(async (action: "play" | "pause" | "seek" | "stop", positionMs: number) => {
    const response = await fetch("/api/music/room", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, positionMs }),
    });
    const data = await response.json() as { room?: MusicRoomState; error?: string };
    if (!response.ok || !data.room) throw new Error(data.error ?? "Nie udało się zmienić odtwarzania.");
    setRoom(data.room);
  }, [setRoom]);

  const togglePlayback = useCallback(async () => {
    const currentRoom = roomRef.current;
    if (!currentRoom) return;

    let positionMs = currentRoom.computedPositionMs;
    if (currentRoom.provider === "youtube") {
      const controller = youtubeControllerRef.current;
      if (!controller) {
        setError("Otwórz ekran Nasza muzyka, aby sterować odtwarzaniem YouTube.");
        return;
      }
      positionMs = joinedRef.current ? controller.getCurrentTimeMs() : currentRoom.computedPositionMs;
      if (currentRoom.isPlaying) controller.pause();
      else {
        setJoined(true);
        controller.seek(positionMs / 1000);
        controller.play();
      }
    } else if (currentRoom.provider === "audius") {
      const audio = ensureAudioTrack(currentRoom);
      if (!audio) return;
      positionMs = joinedRef.current ? Math.round(audio.currentTime * 1000) : currentRoom.computedPositionMs;
      if (currentRoom.isPlaying) audio.pause();
      else {
        setJoined(true);
        try {
          audio.currentTime = Math.max(0, positionMs / 1000);
          await audio.play();
          setBlocked(false);
        } catch (cause) {
          if (cause instanceof DOMException && cause.name === "NotAllowedError") setBlocked(true);
        }
      }
    } else {
      return;
    }

    try {
      await sendPlayerAction(currentRoom.isPlaying ? "pause" : "play", positionMs);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się zmienić odtwarzania.");
    }
  }, [ensureAudioTrack, sendPlayerAction, setJoined]);

  const seek = useCallback(async (positionMs: number) => {
    const currentRoom = roomRef.current;
    if (!currentRoom) return;
    const safePosition = Math.max(0, currentRoom.durationMs ? Math.min(currentRoom.durationMs, Math.round(positionMs)) : Math.round(positionMs));

    if (currentRoom.provider === "youtube") {
      youtubeControllerRef.current?.seek(safePosition / 1000);
    } else if (currentRoom.provider === "audius") {
      const audio = ensureAudioTrack(currentRoom);
      if (audio && joinedRef.current) {
        try { audio.currentTime = safePosition / 1000; } catch { /* next sync pass corrects */ }
      }
    } else {
      return;
    }

    setLocalPositionMs(safePosition);
    try {
      await sendPlayerAction("seek", safePosition);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się przewinąć utworu.");
    }
  }, [ensureAudioTrack, sendPlayerAction]);

  const setVolume = useCallback((nextVolume: number) => {
    const safe = Math.max(0, Math.min(1, nextVolume));
    volumeRef.current = safe;
    setVolumeState(safe);
    if (audioRef.current) audioRef.current.volume = safe;
    youtubeControllerRef.current?.setVolume(safe);
  }, []);

  const previousTrack = useCallback(async () => {
    const currentRoom = roomRef.current;
    const currentMs = currentRoom?.provider === "youtube"
      ? youtubeControllerRef.current?.getCurrentTimeMs() ?? localPositionMs
      : currentRoom?.provider === "audius"
        ? Math.round((audioRef.current?.currentTime ?? 0) * 1000)
        : 0;
    if (currentMs > 4000) {
      await seek(0);
      return;
    }
    if (!queue.length) return;
    const nextIndex = queueIndex > 0 ? queueIndex - 1 : repeatMode === "all" ? queue.length - 1 : 0;
    setQueueIndex(nextIndex);
    await playTrackInternal(queue[nextIndex]);
  }, [localPositionMs, playTrackInternal, queue, queueIndex, repeatMode, seek]);

  const nextTrack = useCallback(async () => {
    if (!queue.length) return;
    if (repeatMode === "one" && queueIndex >= 0) {
      await playTrackInternal(queue[queueIndex]);
      return;
    }
    const hasNext = queueIndex >= 0 && queueIndex < queue.length - 1;
    if (!hasNext && repeatMode !== "all") {
      audioRef.current?.pause();
      youtubeControllerRef.current?.pause();
      return;
    }
    const nextIndex = hasNext ? queueIndex + 1 : 0;
    setQueueIndex(nextIndex);
    await playTrackInternal(queue[nextIndex]);
  }, [playTrackInternal, queue, queueIndex, repeatMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      if (roomRef.current?.provider === "audius") void nextTrack();
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [nextTrack]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const currentRoom = room;
    if (!currentRoom || currentRoom.provider !== "audius" || !joined) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      clearMediaSessionActions();
      return;
    }

    const artwork = currentRoom.artworkUrl
      ? [{ src: currentRoom.artworkUrl }]
      : undefined;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentRoom.title,
      artist: currentRoom.artist,
      album: "Meow • Nasza muzyka",
      artwork,
    });
    navigator.mediaSession.playbackState = currentRoom.isPlaying ? "playing" : "paused";

    const audio = audioRef.current;
    if (audio) updateMediaSessionPosition(audio, currentRoom);

    setMediaSessionAction("play", () => {
      const activeRoom = roomRef.current;
      if (activeRoom?.provider !== "audius") return;
      if (activeRoom.isPlaying) void joinRoom();
      else void togglePlayback();
    });
    setMediaSessionAction("pause", () => {
      const activeRoom = roomRef.current;
      if (activeRoom?.provider !== "audius") return;
      if (activeRoom.isPlaying) void togglePlayback();
      else audioRef.current?.pause();
    });
    setMediaSessionAction("previoustrack", () => { void previousTrack(); });
    setMediaSessionAction("nexttrack", () => { void nextTrack(); });
    setMediaSessionAction("seekbackward", (details) => {
      const currentMs = Math.round((audioRef.current?.currentTime ?? 0) * 1000);
      const offsetMs = Math.round((details.seekOffset ?? 10) * 1000);
      void seek(Math.max(0, currentMs - offsetMs));
    });
    setMediaSessionAction("seekforward", (details) => {
      const currentMs = Math.round((audioRef.current?.currentTime ?? 0) * 1000);
      const offsetMs = Math.round((details.seekOffset ?? 10) * 1000);
      void seek(currentMs + offsetMs);
    });
    setMediaSessionAction("seekto", (details) => {
      if (typeof details.seekTime !== "number") return;
      void seek(Math.round(details.seekTime * 1000));
    });
    setMediaSessionAction("stop", () => {
      audioRef.current?.pause();
      leaveRoom();
    });

    return () => clearMediaSessionActions();
  }, [joined, joinRoom, leaveRoom, nextTrack, previousTrack, room, seek, togglePlayback]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshRoom();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refreshRoom]);

  const syncYouTubeNativeState = useCallback(async (isPlaying: boolean, positionMs: number) => {
    const currentRoom = roomRef.current;
    if (!currentRoom || currentRoom.provider !== "youtube" || !joinedRef.current) return;
    if (currentRoom.isPlaying === isPlaying && Math.abs(currentRoom.computedPositionMs - positionMs) < 1200) return;
    try {
      await sendPlayerAction(isPlaying ? "play" : "pause", positionMs);
    } catch {
      // Keep native YouTube controls usable even if room sync is temporarily offline.
    }
  }, [sendPlayerAction]);

  const shuffleQueue = useCallback(() => {
    if (queue.length < 2) return;
    const current = queueIndex >= 0 ? queue[queueIndex] : queue[0];
    const rest = queue.filter((_, index) => index !== queueIndex);
    for (let index = rest.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [rest[index], rest[swap]] = [rest[swap], rest[index]];
    }
    setQueue([current, ...rest]);
    setQueueIndex(0);
  }, [queue, queueIndex]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((current) => current === "off" ? "all" : current === "all" ? "one" : "off");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<MusicContextValue>(() => ({
    room,
    joined,
    blocked,
    localPositionMs,
    volume,
    error,
    queue,
    queueIndex,
    repeatMode,
    playTrack,
    playQueue,
    joinRoom,
    leaveRoom,
    togglePlayback,
    seek,
    setVolume,
    refreshRoom,
    nextTrack,
    previousTrack,
    shuffleQueue,
    toggleRepeat,
    clearError,
    registerYouTubeController,
    syncYouTubeNativeState,
  }), [
    room,
    joined,
    blocked,
    localPositionMs,
    volume,
    error,
    queue,
    queueIndex,
    repeatMode,
    playTrack,
    playQueue,
    joinRoom,
    leaveRoom,
    togglePlayback,
    seek,
    setVolume,
    refreshRoom,
    nextTrack,
    previousTrack,
    shuffleQueue,
    toggleRepeat,
    clearError,
    registerYouTubeController,
    syncYouTubeNativeState,
  ]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used inside MusicProvider");
  return context;
}
