"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icons";
import { useMusic } from "@/components/music/MusicProvider";
import { YouTubeMusicPlayer } from "@/components/music/YouTubeMusicPlayer";
import type { CoupleTrack, MusicDiscoverPayload, MusicPlaylist, MusicPlaylistTrack, MusicTrackSummary } from "@/lib/music/types";

type ScreenTab = "for-you" | "search" | "library";
type LibraryMode = "songs" | "playlists";

const VIBES = ["Spokojnie", "Randka", "Do auta", "Wieczór", "Wspomnienia"] as const;
const SEARCH_SHORTCUTS = ["Polski pop", "Polski rap", "Na wieczór", "Klasyki", "Zagraniczne hity"] as const;

export function MusicScreen() {
  const music = useMusic();
  const [tab, setTab] = useState<ScreenTab>("for-you");
  const [libraryMode, setLibraryMode] = useState<LibraryMode>("songs");
  const [library, setLibrary] = useState<CoupleTrack[] | null>(null);
  const [playlists, setPlaylists] = useState<MusicPlaylist[] | null>(null);
  const [discover, setDiscover] = useState<MusicDiscoverPayload | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicTrackSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [scrubValue, setScrubValue] = useState<number | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [playlistPickerTrack, setPlaylistPickerTrack] = useState<CoupleTrack | null>(null);
  const [createName, setCreateName] = useState("");
  const [createVibe, setCreateVibe] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(false);
  const [editName, setEditName] = useState("");
  const [editVibe, setEditVibe] = useState("");

  const loadLibrary = useCallback(async () => {
    try {
      const response = await fetch("/api/music/library", { cache: "no-store" });
      const data = await response.json() as { tracks?: CoupleTrack[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się wczytać Waszej muzyki.");
      setLibrary(data.tracks ?? []);
    } catch (cause) {
      setLibrary([]);
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się wczytać Waszej muzyki.");
    }
  }, []);

  const loadPlaylists = useCallback(async () => {
    try {
      const response = await fetch("/api/music/playlists", { cache: "no-store" });
      const data = await response.json() as { playlists?: MusicPlaylist[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się wczytać playlist.");
      setPlaylists(data.playlists ?? []);
    } catch (cause) {
      setPlaylists([]);
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się wczytać playlist.");
    }
  }, []);

  const loadDiscover = useCallback(async () => {
    try {
      const response = await fetch("/api/music/discover", { cache: "no-store" });
      const data = await response.json() as MusicDiscoverPayload & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się wczytać popularnych utworów.");
      setDiscover(data);
    } catch (cause) {
      setDiscover({ configured: false, popular: [], message: cause instanceof Error ? cause.message : "Nie udało się wczytać popularnych utworów." });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([loadLibrary(), loadPlaylists(), loadDiscover()]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDiscover, loadLibrary, loadPlaylists]);

  const ourSong = useMemo(() => library?.find((track) => track.isOurSong) ?? null, [library]);
  const selectedPlaylist = useMemo(() => playlists?.find((playlist) => playlist.id === selectedPlaylistId) ?? null, [playlists, selectedPlaylistId]);
  const recentlyAdded = useMemo(() => (library ?? []).slice(0, 6), [library]);
  const savedKeys = useMemo(() => new Set((library ?? []).map((track) => `${track.provider}:${track.providerTrackId}`)), [library]);
  const displayedPosition = scrubValue ?? (music.joined ? music.localPositionMs : music.room?.computedPositionMs ?? 0);

  async function runSearch(rawQuery = query) {
    const trimmed = rawQuery.trim();
    if (trimmed.length < 2) return;
    setQuery(trimmed);
    setSearching(true);
    setScreenError(null);
    try {
      const response = await fetch(`/api/music/search?q=${encodeURIComponent(trimmed)}`, { cache: "no-store" });
      const data = await response.json() as { tracks?: MusicTrackSummary[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się wyszukać muzyki.");
      setResults(data.tracks ?? []);
    } catch (cause) {
      setResults([]);
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się wyszukać muzyki.");
    } finally {
      setSearching(false);
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    void runSearch();
  }

  async function addTrack(track: MusicTrackSummary) {
    const key = `${track.provider}:${track.providerTrackId}`;
    setSavingId(key);
    setScreenError(null);
    try {
      const response = await fetch("/api/music/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(track),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się dodać utworu.");
      await loadLibrary();
    } catch (cause) {
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się dodać utworu.");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleOurSong(track: CoupleTrack) {
    setSavingId(track.id);
    try {
      const response = await fetch("/api/music/library", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: track.id, isOurSong: !track.isOurSong }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zmienić Waszej piosenki.");
      await loadLibrary();
    } catch (cause) {
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się zmienić Waszej piosenki.");
    } finally {
      setSavingId(null);
    }
  }

  async function removeTrack(track: CoupleTrack) {
    setSavingId(track.id);
    try {
      const response = await fetch(`/api/music/library?id=${encodeURIComponent(track.id)}`, { method: "DELETE" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się usunąć utworu.");
      await Promise.all([loadLibrary(), loadPlaylists()]);
    } catch (cause) {
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się usunąć utworu.");
    } finally {
      setSavingId(null);
    }
  }

  async function createPlaylist(event: FormEvent) {
    event.preventDefault();
    const name = createName.trim();
    if (!name) return;
    setCreatingPlaylist(true);
    try {
      const response = await fetch("/api/music/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, vibe: createVibe || null }),
      });
      const data = await response.json() as { playlist?: { id: string }; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się utworzyć playlisty.");
      setCreateName("");
      setCreateVibe("");
      await loadPlaylists();
      if (data.playlist?.id) setSelectedPlaylistId(data.playlist.id);
    } catch (cause) {
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się utworzyć playlisty.");
    } finally {
      setCreatingPlaylist(false);
    }
  }

  async function updatePlaylist(event: FormEvent) {
    event.preventDefault();
    if (!selectedPlaylist) return;
    const name = editName.trim();
    if (!name) return;
    setSavingId(selectedPlaylist.id);
    try {
      const response = await fetch(`/api/music/playlists/${encodeURIComponent(selectedPlaylist.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, vibe: editVibe || null }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać playlisty.");
      setEditingPlaylist(false);
      await loadPlaylists();
    } catch (cause) {
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się zapisać playlisty.");
    } finally {
      setSavingId(null);
    }
  }

  async function deletePlaylist(playlist: MusicPlaylist) {
    setSavingId(playlist.id);
    try {
      const response = await fetch(`/api/music/playlists/${encodeURIComponent(playlist.id)}`, { method: "DELETE" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się usunąć playlisty.");
      setSelectedPlaylistId(null);
      setEditingPlaylist(false);
      await loadPlaylists();
    } catch (cause) {
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się usunąć playlisty.");
    } finally {
      setSavingId(null);
    }
  }

  async function addTrackToPlaylist(playlist: MusicPlaylist, track: CoupleTrack) {
    setSavingId(`${playlist.id}:${track.id}`);
    try {
      const response = await fetch(`/api/music/playlists/${encodeURIComponent(playlist.id)}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track.id }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się dodać do playlisty.");
      await loadPlaylists();
      setPlaylistPickerTrack(null);
    } catch (cause) {
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się dodać do playlisty.");
    } finally {
      setSavingId(null);
    }
  }

  async function removeTrackFromPlaylist(playlist: MusicPlaylist, track: MusicPlaylistTrack) {
    setSavingId(`${playlist.id}:${track.id}`);
    try {
      const response = await fetch(`/api/music/playlists/${encodeURIComponent(playlist.id)}/tracks?trackId=${encodeURIComponent(track.id)}`, { method: "DELETE" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się usunąć z playlisty.");
      await loadPlaylists();
    } catch (cause) {
      setScreenError(cause instanceof Error ? cause.message : "Nie udało się usunąć z playlisty.");
    } finally {
      setSavingId(null);
    }
  }

  async function commitSeek() {
    if (scrubValue === null) return;
    const next = scrubValue;
    setScrubValue(null);
    await music.seek(next);
  }

  function openSearchWith(queryValue: string) {
    setTab("search");
    setSelectedPlaylistId(null);
    void runSearch(queryValue);
  }

  return (
    <div className="meow-music-v3 pb-12 pt-2">
      <MusicHeader onSearch={() => setTab("search")} />

      {(screenError || music.error) && (
        <div className="meow-music-alert mx-4 mt-3">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="min-w-0 flex-1">{screenError ?? music.error}</p>
          <button type="button" onClick={() => { setScreenError(null); music.clearError(); }} className="meow-touch text-[10px] font-extrabold uppercase tracking-[.08em]">zamknij</button>
        </div>
      )}

      <MusicTabs value={tab} onChange={(next) => { setTab(next); setSelectedPlaylistId(null); }} />

      {music.room && <NowPlaying position={displayedPosition} onScrub={setScrubValue} onCommitSeek={() => void commitSeek()} />}

      {tab === "for-you" && (
        <ForYouTab
          ourSong={ourSong}
          recent={recentlyAdded}
          playlists={playlists ?? []}
          discover={discover}
          onPlay={(track) => void music.playTrack(toSummary(track))}
          onPlaySummary={(track) => void music.playTrack(track)}
          onAddSummary={(track) => void addTrack(track)}
          savedKeys={savedKeys}
          savingId={savingId}
          onOpenPlaylist={(id) => { setTab("library"); setLibraryMode("playlists"); setSelectedPlaylistId(id); }}
          onBrowsePlaylists={() => { setTab("library"); setLibraryMode("playlists"); setSelectedPlaylistId(null); }}
          onSearch={openSearchWith}
          onBrowseSearch={() => setTab("search")}
          onBrowseLibrary={() => { setTab("library"); setLibraryMode("songs"); }}
        />
      )}

      {tab === "search" && (
        <SearchTab
          query={query}
          results={results}
          searching={searching}
          configured={discover?.configured ?? null}
          savedKeys={savedKeys}
          savingId={savingId}
          onQuery={setQuery}
          onSubmit={submitSearch}
          onPlay={(track) => void music.playTrack(track)}
          onAdd={(track) => void addTrack(track)}
          onShortcut={openSearchWith}
        />
      )}

      {tab === "library" && !selectedPlaylist && (
        <LibraryTab
          mode={libraryMode}
          onMode={setLibraryMode}
          library={library}
          playlists={playlists}
          savingId={savingId}
          createName={createName}
          createVibe={createVibe}
          creatingPlaylist={creatingPlaylist}
          onCreateName={setCreateName}
          onCreateVibe={setCreateVibe}
          onCreatePlaylist={(event) => void createPlaylist(event)}
          onSearch={() => setTab("search")}
          onPlayTrack={(track) => {
            const playable = (library ?? []).filter((item) => item.streamable);
            const index = playable.findIndex((item) => item.id === track.id);
            void music.playQueue(playable.map(toSummary), Math.max(0, index));
          }}
          onOurSong={(track) => void toggleOurSong(track)}
          onRemove={(track) => void removeTrack(track)}
          onAddToPlaylist={setPlaylistPickerTrack}
          onOpenPlaylist={setSelectedPlaylistId}
        />
      )}

      {tab === "library" && selectedPlaylist && (
        <PlaylistDetail
          playlist={selectedPlaylist}
          library={library ?? []}
          editing={editingPlaylist}
          editName={editName}
          editVibe={editVibe}
          busy={savingId === selectedPlaylist.id}
          savingId={savingId}
          onBack={() => { setSelectedPlaylistId(null); setEditingPlaylist(false); }}
          onPlayAll={() => void music.playQueue(selectedPlaylist.tracks.filter((track) => track.streamable).map(toSummary))}
          onShuffle={() => {
            const playable = selectedPlaylist.tracks.filter((track) => track.streamable).map(toSummary);
            const shuffled = shuffleCopy(playable);
            void music.playQueue(shuffled);
          }}
          onPlayTrack={(track) => {
            const playable = selectedPlaylist.tracks.filter((item) => item.streamable);
            const index = playable.findIndex((item) => item.id === track.id);
            void music.playQueue(playable.map(toSummary), Math.max(0, index));
          }}
          onRemoveTrack={(track) => void removeTrackFromPlaylist(selectedPlaylist, track)}
          onAddFromLibrary={(track) => void addTrackToPlaylist(selectedPlaylist, track)}
          onStartEdit={() => {
            setEditName(selectedPlaylist.name);
            setEditVibe(selectedPlaylist.vibe ?? "");
            setEditingPlaylist(true);
          }}
          onCancelEdit={() => setEditingPlaylist(false)}
          onEditName={setEditName}
          onEditVibe={setEditVibe}
          onSaveEdit={(event) => void updatePlaylist(event)}
          onDelete={() => void deletePlaylist(selectedPlaylist)}
        />
      )}

      <BottomSheet open={Boolean(playlistPickerTrack)} onClose={() => setPlaylistPickerTrack(null)} title="Dodaj do playlisty" description={playlistPickerTrack ? `${playlistPickerTrack.title} — ${playlistPickerTrack.artist}` : undefined}>
        {!playlists || playlists.length === 0 ? (
          <div className="rounded-[18px] bg-[var(--color-surface-muted)] p-4 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">Najpierw utwórz playlistę w Bibliotece.</div>
        ) : (
          <div className="space-y-2">
            {playlists.map((playlist) => {
              const already = Boolean(playlistPickerTrack && playlist.tracks.some((track) => track.id === playlistPickerTrack.id));
              const busy = Boolean(playlistPickerTrack && savingId === `${playlist.id}:${playlistPickerTrack.id}`);
              return (
                <button key={playlist.id} type="button" disabled={already || busy} onClick={() => playlistPickerTrack && void addTrackToPlaylist(playlist, playlistPickerTrack)} className="meow-playlist-picker-row meow-touch">
                  <PlaylistMiniCover playlist={playlist} />
                  <span className="min-w-0 flex-1 text-left"><strong className="block truncate text-[13px] text-[var(--color-ink)]">{playlist.name}</strong><small className="mt-0.5 block text-[10.5px] text-[var(--color-ink-faint)]">{playlist.trackCount} utworów{playlist.vibe ? ` • ${playlist.vibe}` : ""}</small></span>
                  <span className="text-[11px] font-extrabold text-[var(--color-primary-strong)]">{already ? "Jest" : busy ? "…" : "Dodaj"}</span>
                </button>
              );
            })}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function MusicHeader({ onSearch }: { onSearch: () => void }) {
  return (
    <header className="meow-music-header mx-4">
      <div className="min-w-0">
        <p className="meow-eyebrow">Razem</p>
        <h1>Nasza muzyka</h1>
        <p>Piosenki, które zbieracie i puszczacie razem.</p>
      </div>
      <button type="button" onClick={onSearch} className="meow-music-search-button meow-touch" aria-label="Szukaj muzyki"><Icon name="search" className="h-5 w-5" /></button>
    </header>
  );
}

function MusicTabs({ value, onChange }: { value: ScreenTab; onChange: (value: ScreenTab) => void }) {
  const tabs: Array<{ value: ScreenTab; label: string }> = [
    { value: "for-you", label: "Dla Was" },
    { value: "search", label: "Szukaj" },
    { value: "library", label: "Biblioteka" },
  ];
  return (
    <nav className="meow-music-tabs-v3 mx-4 mt-4" aria-label="Nasza muzyka">
      {tabs.map((item) => <button key={item.value} type="button" onClick={() => onChange(item.value)} className={`meow-touch ${value === item.value ? "is-active" : ""}`}>{item.label}</button>)}
    </nav>
  );
}

function NowPlaying({ position, onScrub, onCommitSeek }: { position: number; onScrub: (value: number) => void; onCommitSeek: () => void }) {
  const music = useMusic();
  const room = music.room;
  if (!room) return null;
  const duration = room.durationMs ?? 0;

  return (
    <section className="meow-now-playing mx-4 mt-4">
      <div className="meow-now-playing-head">
        <div className="min-w-0">
          <p className="meow-eyebrow">Teraz gra</p>
          <h2 className="truncate">{room.title}</h2>
          <p className="truncate">{room.artist}</p>
        </div>
        <span className={`meow-listening-pill ${music.joined ? "is-live" : ""}`}><span />{music.joined ? "Słuchasz" : room.isPlaying ? "Partner słucha" : "Wstrzymane"}</span>
      </div>

      {room.provider === "youtube" ? (
        <div className="mt-4"><YouTubeMusicPlayer /></div>
      ) : (
        <div className="meow-legacy-art mt-4"><TrackArtwork artworkUrl={room.artworkUrl} size="hero" /></div>
      )}

      {!music.joined ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] bg-[var(--color-primary-soft)] px-4 py-3">
          <div className="min-w-0"><strong className="block text-[12px] text-[var(--color-ink)]">Dołącz do wspólnego słuchania</strong><span className="mt-0.5 block text-[10.5px] leading-relaxed text-[var(--color-ink-soft)]">Odtwarzanie ustawi się w aktualnym miejscu partnera.</span></div>
          <button type="button" onClick={() => void music.joinRoom()} className="meow-music-primary-action meow-touch">Dołącz</button>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <input type="range" min={0} max={Math.max(duration, 1)} step={1000} value={Math.min(position, Math.max(duration, 1))} disabled={!duration} onChange={(event) => onScrub(Number(event.target.value))} onPointerUp={onCommitSeek} onKeyUp={onCommitSeek} className="meow-music-range w-full" aria-label="Pozycja utworu" />
            <div className="mt-1 flex justify-between text-[10px] font-semibold tabular-nums text-[var(--color-ink-faint)]"><span>{formatDuration(position)}</span><span>{duration ? formatDuration(duration) : "--:--"}</span></div>
          </div>

          <div className="meow-player-controls mt-2">
            <button type="button" onClick={music.shuffleQueue} disabled={music.queue.length < 2} className="meow-player-small-control meow-touch disabled:opacity-30" aria-label="Losuj kolejkę"><Icon name="shuffle" className="h-5 w-5" /></button>
            <button type="button" onClick={() => void music.previousTrack()} className="meow-player-round-control meow-touch" aria-label="Poprzedni"><Icon name="skip-back" className="h-5 w-5" /></button>
            <button type="button" onClick={() => void music.togglePlayback()} className="meow-player-main-control meow-touch" aria-label={room.isPlaying ? "Pauza" : "Odtwórz"}><Icon name={room.isPlaying ? "pause" : "play"} className="h-7 w-7" /></button>
            <button type="button" onClick={() => void music.nextTrack()} className="meow-player-round-control meow-touch" aria-label="Następny"><Icon name="skip-forward" className="h-5 w-5" /></button>
            <button type="button" onClick={music.toggleRepeat} className={`meow-player-small-control meow-touch ${music.repeatMode !== "off" ? "is-active" : ""}`} aria-label="Powtarzanie"><Icon name="repeat" className="h-5 w-5" />{music.repeatMode === "one" && <span className="meow-repeat-one">1</span>}</button>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-[16px] bg-[var(--color-surface-muted)] px-3 py-2.5">
            <Icon name="volume" className="h-4 w-4 text-[var(--color-ink-faint)]" />
            <input type="range" min={0} max={1} step={0.05} value={music.volume} onChange={(event) => music.setVolume(Number(event.target.value))} className="meow-music-range min-w-0 flex-1" aria-label="Głośność na tym urządzeniu" />
            <button type="button" onClick={music.leaveRoom} className="meow-touch text-[10px] font-extrabold text-[var(--color-ink-faint)]">Wyłącz u mnie</button>
          </div>
        </>
      )}

      {room.provider === "youtube" && <p className="mt-3 text-[9.5px] leading-relaxed text-[var(--color-ink-faint)]">Odtwarzanie odbywa się w widocznym odtwarzaczu YouTube. Po wyjściu z tego ekranu odtwarzanie YouTube na tym urządzeniu zatrzyma się.</p>}
    </section>
  );
}

function ForYouTab({ ourSong, recent, playlists, discover, onPlay, onPlaySummary, onAddSummary, savedKeys, savingId, onOpenPlaylist, onBrowsePlaylists, onSearch, onBrowseSearch, onBrowseLibrary }: {
  ourSong: CoupleTrack | null;
  recent: CoupleTrack[];
  playlists: MusicPlaylist[];
  discover: MusicDiscoverPayload | null;
  onPlay: (track: CoupleTrack) => void;
  onPlaySummary: (track: MusicTrackSummary) => void;
  onAddSummary: (track: MusicTrackSummary) => void;
  savedKeys: Set<string>;
  savingId: string | null;
  onOpenPlaylist: (id: string) => void;
  onBrowsePlaylists: () => void;
  onSearch: (query: string) => void;
  onBrowseSearch: () => void;
  onBrowseLibrary: () => void;
}) {
  return (
    <div className="mt-6 space-y-7 px-4">
      {!discover?.configured && discover?.message && (
        <div className="meow-music-config-note"><Icon name="info" className="h-5 w-5 shrink-0" /><div><strong>Włącz popularne utwory</strong><p>{discover.message}</p></div></div>
      )}

      {ourSong && (
        <section>
          <SectionHeading eyebrow="Wasza piosenka" title="Jedna, która jest trochę Wasza" />
          <button type="button" onClick={() => ourSong.streamable && onPlay(ourSong)} className="meow-our-song meow-touch mt-3 w-full text-left">
            <TrackArtwork artworkUrl={ourSong.artworkUrl} size="large" />
            <span className="min-w-0 flex-1"><strong className="block truncate text-[15px] text-[var(--color-ink)]">{ourSong.title}</strong><span className="mt-1 block truncate text-[11px] text-[var(--color-ink-soft)]">{ourSong.artist}</span></span>
            <span className="meow-our-song-play"><Icon name="play" className="h-5 w-5" /></span>
          </button>
        </section>
      )}

      <section>
        <SectionHeading eyebrow="Odkrywajcie" title="Znajdźcie coś na teraz" action="Szukaj" onAction={onBrowseSearch} />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {SEARCH_SHORTCUTS.map((item) => <button key={item} type="button" onClick={() => onSearch(item)} className="meow-music-chip meow-touch">{item}</button>)}
        </div>
      </section>

      {discover?.popular && discover.popular.length > 0 && (
        <section>
          <SectionHeading eyebrow="Teraz" title="Popularne w Polsce" />
          <div className="meow-popular-list mt-3">
            {discover.popular.slice(0, 8).map((track, index) => {
              const key = `${track.provider}:${track.providerTrackId}`;
              return <DiscoveryRow key={key} index={index + 1} track={track} saved={savedKeys.has(key)} busy={savingId === key} onPlay={() => onPlaySummary(track)} onAdd={() => onAddSummary(track)} />;
            })}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <SectionHeading eyebrow="Wasze" title="Ostatnio dodane" action="Biblioteka" onAction={onBrowseLibrary} />
          <div className="meow-music-cover-grid mt-3">
            {recent.slice(0, 4).map((track) => <button key={track.id} type="button" onClick={() => track.streamable && onPlay(track)} className="meow-cover-card meow-touch text-left"><TrackArtwork artworkUrl={track.artworkUrl} size="grid" /><strong className="mt-2 block truncate text-[12px] text-[var(--color-ink)]">{track.title}</strong><span className="mt-0.5 block truncate text-[10px] text-[var(--color-ink-faint)]">{track.artist}</span></button>)}
          </div>
        </section>
      )}

      {playlists.length > 0 && (
        <section>
          <SectionHeading eyebrow="Playlisty" title="Wasze zbiory" action="Wszystkie" onAction={onBrowsePlaylists} />
          <div className="meow-playlist-strip mt-3">
            {playlists.slice(0, 4).map((playlist) => <button key={playlist.id} type="button" onClick={() => onOpenPlaylist(playlist.id)} className="meow-playlist-tile meow-touch text-left"><PlaylistCover playlist={playlist} /><strong className="mt-2 block truncate text-[12px] text-[var(--color-ink)]">{playlist.name}</strong><span className="mt-0.5 block text-[10px] text-[var(--color-ink-faint)]">{playlist.trackCount} utworów{playlist.vibe ? ` • ${playlist.vibe}` : ""}</span></button>)}
          </div>
        </section>
      )}

      {recent.length === 0 && (!discover?.popular || discover.popular.length === 0) && (
        <EmptyState icon={<Icon name="music" className="h-7 w-7 text-[var(--color-primary)]" />} title="Tu zacznie się Wasza muzyka." description="Wyszukajcie pierwszą piosenkę, zapiszcie ją i zbudujcie wspólną playlistę." action={<Button onClick={onBrowseSearch}>Znajdź piosenkę</Button>} />
      )}
    </div>
  );
}

function SearchTab({ query, results, searching, configured, savedKeys, savingId, onQuery, onSubmit, onPlay, onAdd, onShortcut }: {
  query: string;
  results: MusicTrackSummary[];
  searching: boolean;
  configured: boolean | null;
  savedKeys: Set<string>;
  savingId: string | null;
  onQuery: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onPlay: (track: MusicTrackSummary) => void;
  onAdd: (track: MusicTrackSummary) => void;
  onShortcut: (query: string) => void;
}) {
  return (
    <section className="mt-6 px-4">
      <div className="px-1"><p className="meow-eyebrow">Szukaj</p><h2 className="mt-1 text-[22px] font-extrabold tracking-[-.03em] text-[var(--color-ink)]">Piosenki, artyści i hity</h2><p className="mt-1 text-[11px] leading-relaxed text-[var(--color-ink-soft)]">Bez logowania do Spotify. Popularne nagrania są wyszukiwane przez YouTube Data API i odtwarzane w oficjalnym osadzonym playerze.</p></div>
      <form onSubmit={onSubmit} className="meow-music-search-v3 mt-4">
        <Icon name="search" className="h-5 w-5 shrink-0 text-[var(--color-ink-faint)]" />
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="np. sanah, 505 Arctic Monkeys…" className="min-w-0 flex-1 bg-transparent py-3 text-[14px] font-semibold text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]" />
        <button type="submit" disabled={searching || query.trim().length < 2} className="meow-music-primary-action meow-touch disabled:opacity-40">{searching ? "Szukam…" : "Szukaj"}</button>
      </form>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{SEARCH_SHORTCUTS.map((item) => <button key={item} type="button" onClick={() => onShortcut(item)} className="meow-music-chip meow-touch">{item}</button>)}</div>

      {configured === false && <div className="meow-music-config-note mt-4"><Icon name="info" className="h-5 w-5 shrink-0" /><div><strong>Brakuje klucza YouTube API</strong><p>Po dodaniu YOUTUBE_API_KEY do .env.local wyszukiwarka zacznie zwracać popularne, odtwarzalne wyniki.</p></div></div>}

      {searching && <div className="mt-5 space-y-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-[68px] animate-pulse rounded-[18px] bg-[var(--color-surface-muted)]" />)}</div>}
      {!searching && results.length > 0 && <div className="meow-track-list mt-5">{results.map((track) => { const key = `${track.provider}:${track.providerTrackId}`; return <SearchRow key={key} track={track} saved={savedKeys.has(key)} busy={savingId === key} onPlay={() => onPlay(track)} onAdd={() => onAdd(track)} />; })}</div>}
      {!searching && results.length === 0 && query.trim().length >= 2 && <p className="px-1 py-8 text-center text-[12px] text-[var(--color-ink-faint)]">Naciśnij „Szukaj”, aby zobaczyć wyniki.</p>}
    </section>
  );
}

function LibraryTab({ mode, onMode, library, playlists, savingId, createName, createVibe, creatingPlaylist, onCreateName, onCreateVibe, onCreatePlaylist, onSearch, onPlayTrack, onOurSong, onRemove, onAddToPlaylist, onOpenPlaylist }: {
  mode: LibraryMode;
  onMode: (mode: LibraryMode) => void;
  library: CoupleTrack[] | null;
  playlists: MusicPlaylist[] | null;
  savingId: string | null;
  createName: string;
  createVibe: string;
  creatingPlaylist: boolean;
  onCreateName: (value: string) => void;
  onCreateVibe: (value: string) => void;
  onCreatePlaylist: (event: FormEvent) => void;
  onSearch: () => void;
  onPlayTrack: (track: CoupleTrack) => void;
  onOurSong: (track: CoupleTrack) => void;
  onRemove: (track: CoupleTrack) => void;
  onAddToPlaylist: (track: CoupleTrack) => void;
  onOpenPlaylist: (id: string) => void;
}) {
  return (
    <section className="mt-6 px-4">
      <div className="flex items-end justify-between gap-3 px-1"><div><p className="meow-eyebrow">Biblioteka</p><h2 className="mt-1 text-[22px] font-extrabold tracking-[-.03em] text-[var(--color-ink)]">Wasze zbiory</h2></div>{mode === "songs" && <button type="button" onClick={onSearch} className="meow-touch text-[11px] font-extrabold text-[var(--color-primary-strong)]">+ dodaj piosenkę</button>}</div>
      <div className="meow-library-toggle mt-4"><button type="button" onClick={() => onMode("songs")} className={`meow-touch ${mode === "songs" ? "is-active" : ""}`}>Piosenki</button><button type="button" onClick={() => onMode("playlists")} className={`meow-touch ${mode === "playlists" ? "is-active" : ""}`}>Playlisty</button></div>

      {mode === "songs" && (
        <div className="mt-4">
          {!library ? <div className="h-48 animate-pulse rounded-[22px] bg-[var(--color-surface-muted)]" /> : library.length === 0 ? <EmptyState icon={<Icon name="music" className="h-7 w-7 text-[var(--color-primary)]" />} title="Jeszcze nic tu nie ma." description="Dodajcie piosenki, które chcecie mieć pod ręką." action={<Button onClick={onSearch}>Znajdź piosenkę</Button>} /> : <div className="meow-track-list">{library.map((track) => <LibraryRow key={track.id} track={track} busy={savingId === track.id} onPlay={() => onPlayTrack(track)} onOurSong={() => onOurSong(track)} onRemove={() => onRemove(track)} onAddToPlaylist={() => onAddToPlaylist(track)} />)}</div>}
        </div>
      )}

      {mode === "playlists" && (
        <div className="mt-4 space-y-5">
          <form onSubmit={onCreatePlaylist} className="meow-playlist-create-v3">
            <div><p className="meow-eyebrow">Nowa playlista</p><h3 className="mt-1 text-[16px] font-extrabold text-[var(--color-ink)]">Zbierzcie piosenki na jeden klimat</h3></div>
            <input value={createName} onChange={(event) => onCreateName(event.target.value)} placeholder="np. Nasze wieczory" className="meow-music-input mt-3 w-full rounded-[16px]" maxLength={64} />
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{VIBES.map((vibe) => <button key={vibe} type="button" onClick={() => onCreateVibe(createVibe === vibe ? "" : vibe)} className={`meow-vibe-chip meow-touch ${createVibe === vibe ? "is-active" : ""}`}>{vibe}</button>)}</div>
            <Button type="submit" className="mt-4 w-full" disabled={creatingPlaylist || !createName.trim()}>{creatingPlaylist ? "Tworzę…" : "Utwórz playlistę"}</Button>
          </form>
          {!playlists ? <div className="h-40 animate-pulse rounded-[22px] bg-[var(--color-surface-muted)]" /> : playlists.length === 0 ? <p className="py-6 text-center text-[12px] text-[var(--color-ink-faint)]">Pierwsza playlista może być np. na wieczór, do auta albo ze wspomnień.</p> : <div className="meow-playlist-grid-v3">{playlists.map((playlist) => <button key={playlist.id} type="button" onClick={() => onOpenPlaylist(playlist.id)} className="meow-playlist-card-v3 meow-touch text-left"><PlaylistCover playlist={playlist} /><strong className="mt-3 block truncate text-[13px] text-[var(--color-ink)]">{playlist.name}</strong><span className="mt-1 block text-[10px] text-[var(--color-ink-faint)]">{playlist.trackCount} utworów{playlist.vibe ? ` • ${playlist.vibe}` : ""}</span></button>)}</div>}
        </div>
      )}
    </section>
  );
}

function PlaylistDetail({ playlist, library, editing, editName, editVibe, busy, savingId, onBack, onPlayAll, onShuffle, onPlayTrack, onRemoveTrack, onAddFromLibrary, onStartEdit, onCancelEdit, onEditName, onEditVibe, onSaveEdit, onDelete }: {
  playlist: MusicPlaylist;
  library: CoupleTrack[];
  editing: boolean;
  editName: string;
  editVibe: string;
  busy: boolean;
  savingId: string | null;
  onBack: () => void;
  onPlayAll: () => void;
  onShuffle: () => void;
  onPlayTrack: (track: MusicPlaylistTrack) => void;
  onRemoveTrack: (track: MusicPlaylistTrack) => void;
  onAddFromLibrary: (track: CoupleTrack) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditName: (value: string) => void;
  onEditVibe: (value: string) => void;
  onSaveEdit: (event: FormEvent) => void;
  onDelete: () => void;
}) {
  const available = library.filter((track) => !playlist.tracks.some((item) => item.id === track.id));
  return (
    <section className="mt-6 px-4">
      <button type="button" onClick={onBack} className="meow-touch inline-flex items-center gap-1 text-[11px] font-extrabold text-[var(--color-ink-soft)]"><Icon name="chevron" className="h-4 w-4 rotate-180" /> Biblioteka</button>
      <div className="meow-playlist-detail-v3 mt-4">
        <div className="flex items-center gap-4"><div className="w-[104px] shrink-0"><PlaylistCover playlist={playlist} /></div><div className="min-w-0 flex-1"><p className="meow-eyebrow">{playlist.vibe || "Wspólna playlista"}</p><h2 className="mt-1 text-[23px] font-extrabold tracking-[-.035em] text-[var(--color-ink)]">{playlist.name}</h2><p className="mt-1 text-[10.5px] text-[var(--color-ink-faint)]">{playlist.trackCount} utworów</p></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2"><Button onClick={onPlayAll} disabled={!playlist.tracks.some((track) => track.streamable)}><span className="inline-flex items-center gap-2"><Icon name="play" className="h-4 w-4" /> Odtwórz</span></Button><button type="button" onClick={onShuffle} disabled={!playlist.tracks.some((track) => track.streamable)} className="meow-secondary-action meow-touch"><Icon name="shuffle" className="h-4 w-4" /> Losowo</button></div>
        <div className="mt-3 flex gap-2"><button type="button" onClick={onStartEdit} className="meow-small-text-action meow-touch">Edytuj nazwę</button><button type="button" onClick={onDelete} disabled={busy} className="meow-small-text-action is-danger meow-touch">Usuń playlistę</button></div>
      </div>

      {editing && <form onSubmit={onSaveEdit} className="meow-playlist-edit mt-4"><input value={editName} onChange={(event) => onEditName(event.target.value)} className="meow-music-input w-full rounded-[16px]" maxLength={64} /><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{VIBES.map((vibe) => <button key={vibe} type="button" onClick={() => onEditVibe(editVibe === vibe ? "" : vibe)} className={`meow-vibe-chip meow-touch ${editVibe === vibe ? "is-active" : ""}`}>{vibe}</button>)}</div><div className="mt-3 flex gap-2"><Button type="submit" disabled={busy || !editName.trim()}>Zapisz</Button><button type="button" onClick={onCancelEdit} className="meow-secondary-action meow-touch">Anuluj</button></div></form>}

      <div className="mt-6"><SectionHeading eyebrow="Utwory" title={playlist.trackCount ? "Na tej playliście" : "Ta playlista jest pusta"} />{playlist.tracks.length > 0 ? <div className="meow-track-list mt-3">{playlist.tracks.map((track, index) => <div key={track.playlistTrackId} className="meow-track-row"><button type="button" onClick={() => track.streamable && onPlayTrack(track)} className="meow-track-main meow-touch"><span className="meow-track-index">{index + 1}</span><TrackArtwork artworkUrl={track.artworkUrl} size="small" /><span className="min-w-0 flex-1"><strong className="block truncate">{track.title}</strong><small className="block truncate">{track.artist}</small></span></button><button type="button" onClick={() => onRemoveTrack(track)} disabled={savingId === `${playlist.id}:${track.id}`} className="meow-row-icon meow-touch" aria-label="Usuń z playlisty"><Icon name="close" className="h-4 w-4" /></button></div>)}</div> : <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-ink-faint)]">Dodajcie kilka zapisanych utworów z biblioteki.</p>}</div>

      {available.length > 0 && <div className="mt-7"><SectionHeading eyebrow="Dodaj" title="Z Waszej biblioteki" /><div className="meow-track-list mt-3">{available.slice(0, 12).map((track) => <div key={track.id} className="meow-track-row"><div className="meow-track-main"><TrackArtwork artworkUrl={track.artworkUrl} size="small" /><span className="min-w-0 flex-1"><strong className="block truncate">{track.title}</strong><small className="block truncate">{track.artist}</small></span></div><button type="button" onClick={() => onAddFromLibrary(track)} disabled={savingId === `${playlist.id}:${track.id}`} className="meow-row-icon is-primary meow-touch" aria-label="Dodaj do playlisty"><Icon name="plus" className="h-4 w-4" /></button></div>)}</div></div>}
    </section>
  );
}

function SearchRow({ track, saved, busy, onPlay, onAdd }: { track: MusicTrackSummary; saved: boolean; busy: boolean; onPlay: () => void; onAdd: () => void }) {
  return (
    <div className="meow-track-row">
      <button type="button" onClick={onPlay} className="meow-track-main meow-touch"><TrackArtwork artworkUrl={track.artworkUrl} size="small" /><span className="min-w-0 flex-1"><strong className="block truncate">{track.title}</strong><small className="block truncate">{track.artist}{track.durationMs ? ` • ${formatDuration(track.durationMs)}` : ""}</small></span><span className="meow-inline-play"><Icon name="play" className="h-4 w-4" /></span></button>
      <button type="button" onClick={onAdd} disabled={saved || busy} className={`meow-row-icon meow-touch ${saved ? "is-saved" : "is-primary"}`} aria-label={saved ? "Już w bibliotece" : "Dodaj do biblioteki"}><Icon name={saved ? "check" : "plus"} className="h-4 w-4" /></button>
    </div>
  );
}

function DiscoveryRow({ index, track, saved, busy, onPlay, onAdd }: { index: number; track: MusicTrackSummary; saved: boolean; busy: boolean; onPlay: () => void; onAdd: () => void }) {
  return (
    <div className="meow-track-row">
      <button type="button" onClick={onPlay} className="meow-track-main meow-touch"><span className="meow-track-index">{index}</span><TrackArtwork artworkUrl={track.artworkUrl} size="small" /><span className="min-w-0 flex-1"><strong className="block truncate">{track.title}</strong><small className="block truncate">{track.artist}</small></span><span className="meow-inline-play"><Icon name="play" className="h-4 w-4" /></span></button>
      <button type="button" onClick={onAdd} disabled={saved || busy} className={`meow-row-icon meow-touch ${saved ? "is-saved" : ""}`} aria-label={saved ? "Już zapisane" : "Dodaj do biblioteki"}><Icon name={saved ? "check" : "plus"} className="h-4 w-4" /></button>
    </div>
  );
}

function LibraryRow({ track, busy, onPlay, onOurSong, onRemove, onAddToPlaylist }: { track: CoupleTrack; busy: boolean; onPlay: () => void; onOurSong: () => void; onRemove: () => void; onAddToPlaylist: () => void }) {
  return (
    <div className="meow-track-row">
      <button type="button" onClick={onPlay} disabled={!track.streamable} className="meow-track-main meow-touch disabled:opacity-55"><TrackArtwork artworkUrl={track.artworkUrl} size="small" /><span className="min-w-0 flex-1"><strong className="block truncate">{track.title}</strong><small className="block truncate">{track.artist}{track.addedByNickname ? ` • dodał(a) ${track.addedByNickname}` : ""}</small></span>{track.isOurSong && <span className="meow-our-badge"><Icon name="heart" className="h-3 w-3" /> Wasza</span>}</button>
      <div className="flex items-center"><button type="button" onClick={onOurSong} disabled={busy} className={`meow-row-icon meow-touch ${track.isOurSong ? "is-saved" : ""}`} aria-label="Ustaw jako Waszą piosenkę"><Icon name="heart" className="h-4 w-4" /></button><button type="button" onClick={onAddToPlaylist} className="meow-row-icon meow-touch" aria-label="Dodaj do playlisty"><Icon name="playlist" className="h-4 w-4" /></button><button type="button" onClick={onRemove} disabled={busy} className="meow-row-icon meow-touch" aria-label="Usuń"><Icon name="trash" className="h-4 w-4" /></button></div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="flex items-end justify-between gap-4 px-1"><div className="min-w-0"><p className="meow-eyebrow">{eyebrow}</p><h2 className="mt-1 text-[18px] font-extrabold tracking-[-.025em] text-[var(--color-ink)]">{title}</h2></div>{action && onAction && <button type="button" onClick={onAction} className="meow-touch shrink-0 text-[10.5px] font-extrabold text-[var(--color-primary-strong)]">{action}</button>}</div>;
}

function TrackArtwork({ artworkUrl, size }: { artworkUrl: string | null; size: "small" | "large" | "hero" | "grid" }) {
  const sizeClass = size === "small" ? "h-[50px] w-[50px] rounded-[13px]" : size === "large" ? "h-[74px] w-[74px] rounded-[18px]" : size === "hero" ? "h-[220px] w-[220px] rounded-[28px]" : "aspect-square w-full rounded-[17px]";
  return <span className={`meow-track-art ${sizeClass}`} style={artworkUrl ? { backgroundImage: `url("${artworkUrl}")` } : undefined}>{!artworkUrl && <Icon name="music" className={size === "small" ? "h-5 w-5" : "h-7 w-7"} />}</span>;
}

function PlaylistCover({ playlist }: { playlist: MusicPlaylist }) {
  const covers = playlist.tracks.map((track) => track.artworkUrl).filter((value): value is string => Boolean(value)).slice(0, 4);
  if (!covers.length) return <div className="meow-playlist-cover-v3 is-empty"><Icon name="playlist" className="h-7 w-7" /></div>;
  return <div className={`meow-playlist-cover-v3 ${covers.length > 1 ? "is-collage" : ""}`}>{covers.map((cover, index) => <span key={`${cover}:${index}`} style={{ backgroundImage: `url("${cover}")` }} />)}</div>;
}

function PlaylistMiniCover({ playlist }: { playlist: MusicPlaylist }) {
  const cover = playlist.tracks.find((track) => track.artworkUrl)?.artworkUrl ?? null;
  return <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]" style={cover ? { backgroundImage: `url("${cover}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{!cover && <Icon name="playlist" className="h-4 w-4" />}</span>;
}

function toSummary(track: CoupleTrack | MusicPlaylistTrack): MusicTrackSummary {
  return { provider: track.provider, providerTrackId: track.providerTrackId, title: track.title, artist: track.artist, album: track.album, artworkUrl: track.artworkUrl, durationMs: track.durationMs, sourcePermalink: track.sourcePermalink, streamable: track.streamable };
}

function shuffleCopy<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
