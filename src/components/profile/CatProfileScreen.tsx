"use client";
import { useState } from "react";
import { CatFigure } from "@/components/cats/CatFigure";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CatAccessory, CatColorVariant, CatFurLength } from "@/lib/content/cats";

export function CatProfileScreen({ initialName, colorVariant, furLength, accessory }: { initialName: string; colorVariant: CatColorVariant; furLength: CatFurLength; accessory: CatAccessory | null }) {
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true); setSaved(null);
    try {
      const res = await fetch("/api/cat/rename", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Nie udało się zapisać.");
      setSaved("Imię zapisane 🐾");
    } catch (e) { setSaved(e instanceof Error ? e.message : "Nie udało się zapisać."); }
    finally { setSaving(false); }
  }
  return <div className="flex flex-col gap-4 px-5">
    <Card className="flex flex-col items-center gap-3 text-center">
      <div className="rounded-full bg-[var(--color-cream-soft)] p-3"><CatFigure colorVariant={colorVariant} furLength={furLength} accessory={accessory} size={120} /></div>
      <div><p className="text-lg font-bold text-[var(--color-ink)]">{name || "Twój kot"}</p><p className="text-xs text-[var(--color-ink-faint)]">Więcej personalizacji dodamy później bez zmiany Waszych danych.</p></div>
    </Card>
    <Card>
      <label className="text-sm font-bold text-[var(--color-ink)]" htmlFor="cat-name">Imię kota</label>
      <input id="cat-name" value={name} maxLength={20} onChange={(e)=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--color-ink)]/10 bg-[var(--color-cream-soft)]/50 px-3.5 py-3 text-base outline-none focus:border-[var(--color-dusty-pink)]" />
      <Button fullWidth className="mt-3" onClick={save} disabled={saving || !name.trim()}>{saving ? "Zapisujemy..." : "Zapisz imię"}</Button>
      {saved && <p className="mt-2 text-center text-xs text-[var(--color-ink-soft)]">{saved}</p>}
    </Card>
  </div>;
}
