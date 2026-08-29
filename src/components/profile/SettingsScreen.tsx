"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icons";
import { useTheme, type ThemePreference } from "@/components/providers/ThemeProvider";

const THEMES: { key: ThemePreference; label: string; icon: IconName; description: string }[] = [
  { key: "light", label: "Jasny", icon: "sun", description: "Ciepłe, kremowe Meow." },
  { key: "dark", label: "Ciemny", icon: "moon", description: "Spokojny, ciepły wieczorny motyw." },
  { key: "system", label: "Systemowy", icon: "monitor", description: "Podąża za telefonem lub komputerem." },
];

export function SettingsScreen() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [sounds, setSounds] = useState(true);
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSounds(localStorage.getItem("meow:sounds") !== "off");
      setMotion(localStorage.getItem("meow:motion") !== "off");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggle(key: "sounds" | "motion", value: boolean) {
    localStorage.setItem(`meow:${key}`, value ? "on" : "off");
    if (key === "sounds") setSounds(value);
    else setMotion(value);
  }

  return (
    <div className="px-4 pb-9">
      <section>
        <p className="meow-eyebrow px-1">Wygląd</p>
        <div className="meow-section-surface mt-3 p-2" role="radiogroup" aria-label="Motyw aplikacji">
          {THEMES.map((theme) => {
            const active = preference === theme.key;
            return (
              <button key={theme.key} type="button" role="radio" aria-checked={active} onClick={() => setPreference(theme.key)} className={`meow-touch grid min-h-[68px] w-full grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-[16px] px-3 py-3 text-left ${active ? "bg-[var(--color-primary-soft)]" : "hover:bg-[var(--color-surface-muted)]"}`}>
                <span className={`grid h-9 w-9 place-items-center rounded-[12px] ${active ? "bg-[var(--color-surface)] text-[var(--color-primary-strong)]" : "bg-[var(--color-surface-muted)] text-[var(--color-ink-faint)]"}`}><Icon name={theme.icon} className="h-[18px] w-[18px]" /></span>
                <span><span className="block text-[13.5px] font-semibold text-[var(--color-ink)]">{theme.label}</span><span className="mt-0.5 block text-[11px] leading-relaxed text-[var(--color-ink-faint)]">{theme.key === "system" ? `Teraz: ${resolvedTheme === "dark" ? "ciemny" : "jasny"}` : theme.description}</span></span>
                {active && <Icon name="check" className="h-4 w-4 text-[var(--color-sage)]" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <p className="meow-eyebrow px-1">Wrażenia</p>
        <div className="meow-section-surface mt-3 p-2">
          <Setting icon="volume" title="Dźwięki Meow" desc="Mruczenie i delikatne efekty w pokojach oraz spokojnych aktywnościach." value={sounds} onChange={(value) => toggle("sounds", value)} />
          <Setting icon="motion" title="Animacje" desc="Ogranicz ruch kotów i przejścia, jeśli wolisz spokojniejszy interfejs." value={motion} onChange={(value) => toggle("motion", value)} />
        </div>
      </section>

      <section className="mt-7 rounded-[20px] border border-[var(--color-sage)]/20 bg-[var(--color-sage-soft)] p-4">
        <div className="flex gap-3">
          <Icon name="lock" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[var(--color-sage)]" />
          <div>
            <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">Prywatne naprawdę znaczy prywatne</p>
            <p className="mt-1 max-w-[325px] text-[12px] leading-relaxed text-[var(--color-ink-soft)]">Check-in jest prywatny, dopóki sam nie wybierzesz „Udostępnij”. Motyw aplikacji ani ustawienia interfejsu tego nie zmieniają.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Setting({ icon, title, desc, value, onChange }: { icon: IconName; title: string; desc: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="grid min-h-[74px] grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-[16px] px-3 py-3 hover:bg-[var(--color-surface-muted)]">
      <span className="meow-list-icon meow-list-icon-quiet"><Icon name={icon} className="h-[18px] w-[18px]" /></span>
      <div className="min-w-0"><p className="text-[13.5px] font-semibold text-[var(--color-ink)]">{title}</p><p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-ink-faint)]">{desc}</p></div>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`relative h-8 w-[52px] shrink-0 rounded-full border transition-colors ${value ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-ink)]/10 bg-[var(--color-beige)]"}`}>
        <span className={`absolute top-[5px] h-5 w-5 rounded-full bg-[#fffaf6] shadow-sm transition-transform ${value ? "translate-x-[26px]" : "translate-x-[5px]"}`} />
      </button>
    </div>
  );
}
