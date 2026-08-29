import { redirect } from "next/navigation";
import { getCurrentMember, getPartnerMember } from "@/lib/server/session";
import { CatFigure } from "@/components/cats/CatFigure";
import { ListRow } from "@/components/ui/ListRow";
import type { CatColorVariant, CatFurLength, CatAccessory } from "@/lib/content/cats";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const member = await getCurrentMember();
  if (!member) redirect("/");
  const partner = await getPartnerMember(member.coupleId, member.memberId);

  return (
    <div className="pb-9 pt-4">
      <header className="mx-4 overflow-hidden rounded-[26px] bg-[var(--color-primary-strong)] text-[#fff8f7] shadow-[var(--shadow-soft)]">
        <div className="p-5 pb-3">
          <p className="text-[9.5px] font-extrabold uppercase tracking-[0.18em] opacity-55">My</p>
        </div>
        <div className="grid grid-cols-[116px_minmax(0,1fr)] items-end gap-4 px-5 pb-5">
          <div className="relative flex h-[126px] items-end justify-center rounded-[22px] bg-white/10">
            <span className="absolute bottom-2 h-8 w-20 rounded-[50%] bg-black/10" />
            <div className="relative">
              <CatFigure
                colorVariant={(member.cat?.colorVariant ?? "ginger") as CatColorVariant}
                furLength={(member.cat?.furLength ?? "short") as CatFurLength}
                accessory={member.cat?.accessory as CatAccessory | null}
                size={106}
              />
            </div>
          </div>
          <div className="min-w-0 pb-2">
            <h1 className="meow-editorial-title text-[34px] leading-none">{member.nickname}</h1>
            <p className="mt-2 text-[13px] font-bold opacity-90">{member.cat?.name ?? "Twój kot"}</p>
            {partner && <p className="mt-1.5 text-[11.5px] leading-relaxed opacity-65">W tej przestrzeni razem z {partner.nickname}.</p>}
          </div>
        </div>
      </header>

      <section className="mt-6 px-4">
        <p className="meow-eyebrow px-1">Twoje Meow</p>
        <div className="meow-section-surface mt-3 p-2">
          <ListRow href="/profil/kot" icon="cat" title="Mój kot" description="Imię, wygląd, personality i dodatki." />
          <ListRow href="/profil/odpowiedzi" icon="note" title="Moje odpowiedzi" description="Prywatna historia rzeczy, które już napisałeś/aś." />
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="flex items-end justify-between gap-4 px-1"><p className="meow-eyebrow">Wspólne</p><p className="text-[10.5px] text-[var(--color-ink-faint)]">bez presji na kompletowanie</p></div>
        <div className="meow-section-surface mt-3 p-2">
          <ListRow href="/profil/osiagniecia" icon="trophy" title="Pamiątki" description="Małe rzeczy, które pojawiły się po drodze." quiet />
          <ListRow href="/profil/nagrody" icon="paw" title="Łapki" description="Skąd się wzięły i na co zostały wydane." quiet />
        </div>
      </section>

      <section className="mt-6 px-4">
        <p className="meow-eyebrow px-1">Aplikacja</p>
        <div className="meow-section-surface mt-3 p-2">
          <ListRow href="/profil/ustawienia" icon="settings" title="Ustawienia" description="Wygląd, animacje, dźwięki i prywatność." quiet />
          <ListRow href="/profil/pomoc" icon="help" title="Pomoc i wsparcie" quiet />
          <ListRow href="/profil/o-aplikacji" icon="info" title="O Meow" quiet />
        </div>
      </section>
    </div>
  );
}
