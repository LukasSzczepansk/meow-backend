import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/server/session";
import { BottomNav } from "@/components/navigation/BottomNav";
import { MusicProvider } from "@/components/music/MusicProvider";
import { MusicMiniPlayer } from "@/components/music/MusicMiniPlayer";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const member = await getCurrentMember();
  if (!member) redirect("/");

  return (
    <MusicProvider>
      <div className="flex min-h-dvh flex-1 flex-col">
        <div className="no-scrollbar flex-1 overflow-y-auto pb-4">{children}</div>
        <MusicMiniPlayer />
        <BottomNav />
      </div>
    </MusicProvider>
  );
}
