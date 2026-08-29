"use client";

import { useEffect, useRef, useState } from "react";
import { useMusic, type YouTubeMusicController } from "@/components/music/MusicProvider";

type YTPlayerState = -1 | 0 | 1 | 2 | 3 | 5;

interface YTPlayerLike {
  destroy: () => void;
  loadVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  cueVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => { video_id?: string };
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      width?: string | number;
      height?: string | number;
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayerLike }) => void;
        onStateChange?: (event: { data: YTPlayerState; target: YTPlayerLike }) => void;
        onError?: (event: { data: number }) => void;
      };
    },
  ) => YTPlayerLike;
  PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2 };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
    __meowYouTubeApiPromise?: Promise<YTNamespace>;
  }
}

export function YouTubeMusicPlayer() {
  const music = useMusic();
  const registerYouTubeController = music.registerYouTubeController;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerLike | null>(null);
  const suppressNativeSyncUntilRef = useRef(0);
  const nextTrackRef = useRef(music.nextTrack);
  const syncNativeRef = useRef(music.syncYouTubeNativeState);
  const [ready, setReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => { nextTrackRef.current = music.nextTrack; }, [music.nextTrack]);
  useEffect(() => { syncNativeRef.current = music.syncYouTubeNativeState; }, [music.syncYouTubeNativeState]);

  useEffect(() => {
    let disposed = false;
    if (!hostRef.current) return;

    void loadYouTubeApi().then((YT) => {
      if (disposed || !hostRef.current || playerRef.current) return;
      const player = new YT.Player(hostRef.current, {
        width: "100%",
        height: "100%",
        playerVars: { controls: 1, playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: ({ target }) => {
            if (disposed) return;
            playerRef.current = target;
            setReady(true);
            setPlayerError(null);
            const controller = createController(target, suppressNativeSyncUntilRef);
            registerYouTubeController(controller);
          },
          onStateChange: ({ data, target }) => {
            if (disposed || Date.now() < suppressNativeSyncUntilRef.current) return;
            if (data === YT.PlayerState.ENDED) {
              void nextTrackRef.current();
              return;
            }
            if (data === YT.PlayerState.PLAYING || data === YT.PlayerState.PAUSED) {
              void syncNativeRef.current(data === YT.PlayerState.PLAYING, Math.round(target.getCurrentTime() * 1000));
            }
          },
          onError: () => {
            if (!disposed) setPlayerError("YouTube nie może odtworzyć tego filmu w osadzonym odtwarzaczu. Wybierz inny wynik.");
          },
        },
      });
      playerRef.current = player;
    }).catch(() => {
      if (!disposed) setPlayerError("Nie udało się załadować odtwarzacza YouTube.");
    });

    return () => {
      disposed = true;
      registerYouTubeController(null);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [registerYouTubeController]);

  return (
    <div className="meow-youtube-wrap">
      <div className="meow-youtube-shell">
        <div className="meow-youtube-player" ref={hostRef} aria-label="Odtwarzacz YouTube" />
      </div>
      {!ready && !playerError && <p className="meow-youtube-status">Ładowanie odtwarzacza YouTube…</p>}
      {playerError && <p className="meow-youtube-error">{playerError}</p>}
    </div>
  );
}

function createController(player: YTPlayerLike, suppressRef: { current: number }): YouTubeMusicController {
  const suppress = () => { suppressRef.current = Date.now() + 700; };
  return {
    load(videoId, startSeconds, autoplay) {
      suppress();
      if (autoplay) player.loadVideoById({ videoId, startSeconds: Math.max(0, startSeconds) });
      else player.cueVideoById({ videoId, startSeconds: Math.max(0, startSeconds) });
    },
    play() { suppress(); player.playVideo(); },
    pause() { suppress(); player.pauseVideo(); },
    seek(seconds) { suppress(); player.seekTo(Math.max(0, seconds), true); },
    setVolume(volume) { player.setVolume(Math.round(Math.max(0, Math.min(1, volume)) * 100)); },
    getCurrentTimeMs() {
      const seconds = player.getCurrentTime();
      return Number.isFinite(seconds) ? Math.max(0, Math.round(seconds * 1000)) : 0;
    },
    getDurationMs() {
      const seconds = player.getDuration();
      return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds * 1000) : null;
    },
    getVideoId() { return player.getVideoData()?.video_id ?? null; },
  };
}

function loadYouTubeApi(): Promise<YTNamespace> {
  const existingYouTube = window.YT;
  if (existingYouTube?.Player) return Promise.resolve(existingYouTube);
  const existingPromise = window.__meowYouTubeApiPromise;
  if (existingPromise) return existingPromise;

  const promise = new Promise<YTNamespace>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => reject(new Error("YouTube iframe API timeout")), 15_000);
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      window.clearTimeout(timeout);
      const readyYouTube = window.YT;
      if (readyYouTube?.Player) resolve(readyYouTube);
      else reject(new Error("YouTube iframe API unavailable"));
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });
  window.__meowYouTubeApiPromise = promise;
  return promise;
}
