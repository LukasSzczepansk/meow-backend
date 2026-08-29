"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CatFigure } from "@/components/cats/CatFigure";
import { CatPicker, type CatChoiceState } from "@/components/onboarding/CatPicker";

type Mode = "welcome" | "create" | "join";
type CreateStep = "nick" | "cat" | "name" | "code";
type JoinStep = "code" | "nick" | "cat" | "name";

const DEFAULT_CAT: CatChoiceState = {
  colorVariant: "ginger",
  furLength: "short",
  personality: "ciekawski",
};

export function OnboardingFlow() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("welcome");
  const [createStep, setCreateStep] = useState<CreateStep>("nick");
  const [joinStep, setJoinStep] = useState<JoinStep>("code");

  const [nickname, setNickname] = useState("");
  const [catName, setCatName] = useState("");
  const [cat, setCat] = useState<CatChoiceState>(DEFAULT_CAT);
  const [joinCode, setJoinCode] = useState("");

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitCreate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, catName, cat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Coś poszło nie tak.");
      setInviteCode(data.inviteCode);
      setCreateStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coś poszło nie tak.");
    } finally {
      setLoading(false);
    }
  }

  async function submitJoin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode, nickname, catName, cat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Coś poszło nie tak.");
      router.push("/dzis");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coś poszło nie tak.");
      setLoading(false);
    }
  }

  if (mode === "welcome") {
    return (
      <Screen>
        <div className="mx-4 mt-4 flex flex-1 flex-col overflow-hidden rounded-[30px] bg-[var(--color-primary-strong)] text-[#fff8f7] shadow-[var(--shadow-soft)]">
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 py-12 text-center">
            <div className="relative flex min-h-[160px] w-full items-end justify-center gap-2 rounded-[26px] bg-white/10 px-6 pt-8">
              <span className="absolute left-5 top-5 text-[9.5px] font-extrabold uppercase tracking-[0.2em] opacity-50">Wasze miejsce</span>
              <CatFigure colorVariant="white" pose="sit" size={112} />
              <CatFigure colorVariant="black" pose="curious" flip size={112} />
            </div>
            <div>
              <h1 className="meow-editorial-title text-[48px] leading-none">Meow</h1>
              <p className="mx-auto mt-3 max-w-[290px] text-[14px] leading-relaxed opacity-[0.72]">Wasz mały świat: dwa koty, rozmowy, wspomnienia i rzeczy tylko między Wami.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 px-5 pb-9 pt-5">
          <Button onClick={() => { setMode("create"); setCreateStep("nick"); }} fullWidth>Stwórz naszą przestrzeń</Button>
          <Button variant="secondary" onClick={() => { setMode("join"); setJoinStep("code"); }} fullWidth>Dołącz do partnera</Button>
        </div>
      </Screen>
    );
  }

  if (mode === "create") {
    return (
      <Screen onBack={() => setMode("welcome")} dots={{ total: 3, active: ["nick", "cat", "name"].indexOf(createStep) }}>
        <StepBody stepKey={`create-${createStep}`}>
          {createStep === "nick" && (
            <>
              <Heading title="Stwórz naszą przestrzeń" subtitle="Wybierz nick, kota i stwórzcie swoje miejsce." />
              <FieldLabel>Twój nick</FieldLabel>
              <TextInput value={nickname} onChange={setNickname} placeholder="np. Ola" autoFocus />
              <Spacer />
              <Button disabled={!nickname.trim()} onClick={() => setCreateStep("cat")} fullWidth>
                Dalej
              </Button>
            </>
          )}
          {createStep === "cat" && (
            <>
              <Heading title="Wybierz swojego kota" />
              <CatPicker value={cat} onChange={setCat} />
              <Spacer />
              <Button onClick={() => setCreateStep("name")} fullWidth>
                Dalej
              </Button>
            </>
          )}
          {createStep === "name" && (
            <>
              <Heading title="Wybierz swojego kota" />
              <div className="flex justify-center py-2">
                <CatFigure colorVariant={cat.colorVariant} furLength={cat.furLength} size={100} />
              </div>
              <FieldLabel>Imię kota</FieldLabel>
              <TextInput value={catName} onChange={setCatName} placeholder="np. Puszek" autoFocus />
              {error && <ErrorText>{error}</ErrorText>}
              <Spacer />
              <Button disabled={!catName.trim() || loading} onClick={submitCreate} fullWidth>
                {loading ? "Tworzymy..." : "Dalej"}
              </Button>
            </>
          )}
          {createStep === "code" && inviteCode && (
            <>
              <Heading title="Kod dołączenia" subtitle="Podaj ten kod swojej drugiej połówce." />
              <div className="my-6 rounded-2xl bg-[var(--color-cream-soft)] py-6 text-center">
                <p className="text-3xl font-bold tracking-wide text-[var(--color-ink)]">{inviteCode}</p>
              </div>
              <p className="text-center text-sm text-[var(--color-ink-faint)]">Kod jest ważny bezterminowo 🐾</p>
              <Spacer />
              <Button onClick={() => router.push("/dzis")} fullWidth>
                Gotowe
              </Button>
            </>
          )}
        </StepBody>
      </Screen>
    );
  }

  return (
    <Screen onBack={() => setMode("welcome")} dots={{ total: 3, active: ["code", "nick", "cat"].indexOf(joinStep === "name" ? "cat" : joinStep) }}>
      <StepBody stepKey={`join-${joinStep}`}>
        {joinStep === "code" && (
          <>
            <Heading title="Dołącz do partnera" subtitle="Wpisz kod, który otrzymałeś od partnera." />
            <FieldLabel>Kod dołączenia</FieldLabel>
            <TextInput value={joinCode} onChange={(v) => setJoinCode(v.toUpperCase())} placeholder="MEOW-4728" autoFocus />
            {error && <ErrorText>{error}</ErrorText>}
            <Spacer />
            <Button disabled={!joinCode.trim()} onClick={() => { setError(null); setJoinStep("nick"); }} fullWidth>
              Dalej
            </Button>
          </>
        )}
        {joinStep === "nick" && (
          <>
            <Heading title="Dołącz do partnera" />
            <FieldLabel>Twój nick</FieldLabel>
            <TextInput value={nickname} onChange={setNickname} placeholder="np. Łukasz" autoFocus />
            <Spacer />
            <Button disabled={!nickname.trim()} onClick={() => setJoinStep("cat")} fullWidth>
              Dalej
            </Button>
          </>
        )}
        {joinStep === "cat" && (
          <>
            <Heading title="Wybierz swojego kota" />
            <CatPicker value={cat} onChange={setCat} />
            <Spacer />
            <Button onClick={() => setJoinStep("name")} fullWidth>
              Dalej
            </Button>
          </>
        )}
        {joinStep === "name" && (
          <>
            <Heading title="Wybierz swojego kota" />
            <div className="flex justify-center py-2">
              <CatFigure colorVariant={cat.colorVariant} furLength={cat.furLength} size={100} />
            </div>
            <FieldLabel>Imię kota</FieldLabel>
            <TextInput value={catName} onChange={setCatName} placeholder="np. Mruczek" autoFocus />
            {error && <ErrorText>{error}</ErrorText>}
            <Spacer />
            <Button disabled={!catName.trim() || loading} onClick={submitJoin} fullWidth>
              {loading ? "Łączymy..." : "Dalej"}
            </Button>
          </>
        )}
      </StepBody>
    </Screen>
  );
}

function Screen({
  children,
  onBack,
  dots,
}: {
  children: React.ReactNode;
  onBack?: () => void;
  dots?: { total: number; active: number };
}) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-[var(--color-cream)]">
      {onBack && (
        <div className="px-4 pt-4">
          <button
            onClick={onBack}
            className="meow-icon-button meow-touch"
            aria-label="Wstecz"
          >
            ←
          </button>
        </div>
      )}
      <div className="flex flex-1 flex-col">{children}</div>
      {dots && (
        <div className="flex justify-center gap-1.5 pb-8">
          {Array.from({ length: dots.total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === dots.active ? "w-5 bg-[var(--color-ink)]" : "w-1.5 bg-[var(--color-ink)]/15"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StepBody({ children, stepKey }: { children: React.ReactNode; stepKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mx-4 mb-5 flex flex-1 flex-col rounded-[26px] bg-[var(--color-surface)] px-5 py-6 shadow-[var(--shadow-softer)]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="meow-editorial-title text-[30px] leading-tight text-[var(--color-ink)]">{title}</h2>
      {subtitle && <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--color-ink-faint)]">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      maxLength={24}
      className="w-full rounded-[16px] border border-[var(--color-ink)]/10 bg-[var(--color-cream)] px-4 py-3.5 text-base font-semibold text-[var(--color-ink)] outline-none transition-all placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:shadow-[0_0_0_4px_var(--color-primary-soft)]"
    />
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm text-[#b3675a]">{children}</p>;
}

function Spacer() {
  return <div className="flex-1 min-h-6" />;
}
