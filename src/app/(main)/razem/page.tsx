import Link from "next/link";
import { ActionTile } from "@/components/ui/ActionTile";
import { Icon } from "@/components/ui/Icons";
import { ListRow } from "@/components/ui/ListRow";

export default function RazemPage() {
  return (
    <div className="pb-9 pt-4">
      <header className="meow-hero mx-4 p-5">
        <p className="meow-eyebrow">Razem</p>
        <h1 className="meow-editorial-title mt-2 max-w-[355px] text-[36px] leading-[1.02] text-[var(--color-ink)]">Wasze miejsce na rozmowy, plany i rzeczy, które zostają.</h1>
        <p className="mt-3 max-w-[330px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">Bez feedu i bez oceniania relacji. Tylko Wasze rzeczy, w jednym miejscu.</p>
      </header>

      <section className="mx-4 mt-4">
        <Link href="/razem/porozmawiajmy" className="meow-touch group block rounded-[22px] bg-[var(--color-primary-strong)] p-5 text-[#fff8f7] shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.17em] opacity-65">Wasze teraz</p>
              <p className="meow-editorial-title mt-2 text-[27px] leading-[1.08]">Jedno pytanie. Dwie osobne odpowiedzi.</p>
              <p className="mt-2 max-w-[310px] text-[12px] leading-relaxed opacity-75">Odpowiadacie po swojemu. Dopiero potem odkrywacie odpowiedź drugiej osoby.</p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-white/10"><Icon name="chat" className="h-5 w-5" /></span>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="text-[12px] font-bold">Porozmawiajmy</span>
            <Icon name="chevron" className="h-4 w-4 transition-transform group-active:translate-x-0.5" />
          </div>
        </Link>
      </section>

      <section className="mt-7 px-4">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <div><p className="meow-eyebrow">Wasze rzeczy</p><h2 className="mt-1 text-[18px] font-extrabold text-[var(--color-ink)]">To, co zostaje na dłużej</h2></div>
          <p className="pb-0.5 text-[10.5px] text-[var(--color-ink-faint)]">tylko między Wami</p>
        </div>
        <div className="meow-section-surface p-2">
          <ListRow href="/razem/wspomnienia" icon="photo" title="Wspomnienia" description="Zdjęcia, zwykłe wieczory i ważniejsze momenty." />
          <ListRow href="/razem/poznaj-mnie" icon="book" title="Księga Nas" description="Rzeczy o sobie, o których dobrze pamiętać." />
          <ListRow href="/razem/historia" icon="history" title="Nasza historia" description="Najważniejsze wydarzenia w jednej osi czasu." />
          <ListRow href="/razem/muzyka" icon="music" title="Nasza muzyka" description="Wspólna biblioteka i słuchanie tego samego na odległość." />
        </div>
      </section>

      <section className="mt-7 px-4">
        <p className="meow-eyebrow px-1">Coś razem</p>
        <div className="mt-3 grid gap-3">
          <ActionTile href="/razem/date-jar" icon="calendar" eyebrow="Słoik" title="Nie wiecie co robić?" description="Wylosujcie jeden z Waszych pomysłów." tone="sand" />
          <ActionTile href="/razem/wyzwanie" icon="spark" eyebrow="Na dziś" title="Mała rzecz razem" description="Krótki pomysł do zrobienia poza ekranem." tone="sage" />
        </div>
      </section>

      <section className="mt-7 px-4">
        <p className="meow-eyebrow px-1">Spokojnie i bez pośpiechu</p>
        <div className="meow-section-surface mt-3 p-2">
          <ListRow href="/razem/tydzien" icon="calendar" title="Wasz tydzień" description="Podsumowanie bez ocen, serii i porównań." quiet />
          <ListRow href="/razem/miau" icon="paw" title="Nasze Miau" description="Małe sygnały bez zamieniania Meow w komunikator." quiet />
          <ListRow href="/razem/aktywnosc" icon="bell" title="Ostatnio" description="Tylko wspólne zdarzenia, które mają znaczenie." quiet />
        </div>
      </section>

      <section className="mx-4 mt-7 rounded-[20px] border border-[var(--color-sage)]/20 bg-[var(--color-sage-soft)] p-4">
        <p className="meow-eyebrow">Kiedy jest trudniej</p>
        <Link href="/razem/po-klotni" className="meow-touch group mt-2 flex items-center justify-between gap-4">
          <div><p className="text-[14px] font-extrabold text-[var(--color-ink)]">Wróćmy do rozmowy</p><p className="mt-1 max-w-[310px] text-[12px] leading-relaxed text-[var(--color-ink-soft)]">Spokojnie, krok po kroku, bez wskazywania kto ma rację.</p></div>
          <span className="meow-row-arrow"><Icon name="chevron" className="h-4 w-4" /></span>
        </Link>
      </section>
    </div>
  );
}
