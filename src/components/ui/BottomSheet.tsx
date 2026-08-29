"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icons";

export function BottomSheet({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#1d1515]/45 px-2 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur-[2px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
        >
          <motion.section
            role="dialog" aria-modal="true" aria-labelledby="meow-sheet-title" aria-describedby={description ? "meow-sheet-description" : undefined}
            className="meow-sheet w-full max-w-[462px] px-5 pb-5 pt-3"
            initial={{ y: 28, opacity: 0.76 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto h-1 w-11 rounded-full bg-[var(--color-ink)]/12" />
            <div className="mt-4 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <span className="mb-2 block h-1 w-8 rounded-full bg-[var(--color-primary)]" />
                <h2 id="meow-sheet-title" className="meow-editorial-title text-[25px] leading-tight text-[var(--color-ink)]">{title}</h2>
                {description && <p id="meow-sheet-description" className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">{description}</p>}
              </div>
              <button ref={closeRef} type="button" onClick={onClose} className="meow-icon-button meow-touch -mr-1" aria-label="Zamknij">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
