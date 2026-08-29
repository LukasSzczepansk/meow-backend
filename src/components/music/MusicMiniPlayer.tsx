"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icons";
import { useMusic } from "@/components/music/MusicProvider";

export function MusicMiniPlayer() {
  const pathname = usePathname();
  const music = useMusic();
  const { room, joined, blocked, localPositionMs, joinRoom, togglePlayback, leaveRoom } = music;
  const fullScreenGame = pathname.startsWith("/gry/") && pathname !== "/gry/dla-mnie";
  if (!room || fullScreenGame || pathname.startsWith("/razem/muzyka")) return null;

  const position = joined ? localPositionMs : room.computedPositionMs;
  const duration = room.durationMs ?? 0;
  const progress = duration > 0 ? Math.max(0, Math.min(100, (position / duration) * 100)) : 0;

  if (room.provider === "youtube") {
    return (
      <Link href="/razem/muzyka" className="meow-mini-player meow-mini-player-v3 mx-2 mb-1 block" aria-label="Wróć do Naszej muzyki">
        <div className="meow-mini-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
        <div className="grid grid-cols-[44px_minmax(0,1fr)_36px] items-center gap-3 px-3 py-2.5">
          <Artwork artworkUrl={room.artworkUrl} />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-extrabold text-[var(--color-ink)]">{room.title}</p>
            <p className="mt-0.5 truncate text-[10.5px] text-[var(--color-ink-soft)]">Wróć do Naszej muzyki, aby słuchać</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"><Icon name="chevron" className="h-4 w-4" /></span>
        </div>
      </Link>
    );
  }

  if (room.provider !== "audius") return null;
  return (
    <aside className="meow-mini-player meow-mini-player-v3 mx-2 mb-1" aria-label="Wspólne słuchanie">
      <div className="meow-mini-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
        <Artwork artworkUrl={room.artworkUrl} />
        <Link href="/razem/muzyka" className="min-w-0 meow-touch">
          <p className="truncate text-[12.5px] font-extrabold text-[var(--color-ink)]">{room.title}</p>
          <p className="mt-0.5 truncate text-[10.5px] text-[var(--color-ink-soft)]">
            {blocked ? "Dotknij Włącz" : joined ? `Gra w tle • ${room.artist}` : room.isPlaying ? "Partner słucha • dołącz" : room.artist}
          </p>
        </Link>
        <div className="flex items-center gap-1">
          {!joined || blocked ? (
            <button type="button" onClick={() => void joinRoom()} className="meow-mini-join meow-touch">{blocked ? "Włącz" : "Dołącz"}</button>
          ) : (
            <button type="button" onClick={() => void togglePlayback()} className="meow-mini-main meow-touch" aria-label={room.isPlaying ? "Pauza" : "Odtwórz"}><Icon name={room.isPlaying ? "pause" : "play"} className="h-[18px] w-[18px]" /></button>
          )}
          {joined && !blocked && <button type="button" onClick={leaveRoom} className="meow-touch grid h-8 w-8 place-items-center text-[var(--color-ink-faint)]" aria-label="Wyłącz muzykę tylko u mnie"><Icon name="close" className="h-3.5 w-3.5" /></button>}
        </div>
      </div>
    </aside>
  );
}

function Artwork({ artworkUrl }: { artworkUrl: string | null }) {
  return (
    <span className="grid h-[44px] w-[44px] place-items-center overflow-hidden rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]" style={artworkUrl ? { backgroundImage: `url("${artworkUrl}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
      {!artworkUrl && <Icon name="music" className="h-5 w-5" />}
    </span>
  );
}
