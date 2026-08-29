"use client";

import { useEffect } from "react";

/**
 * Small transport-agnostic sync primitive. Today it uses visibility-aware polling;
 * later the implementation can be swapped for Supabase Realtime without changing screens.
 */
export function useCoupleSync(callback: () => void | Promise<void>, intervalMs = 15_000, enabled = true, runImmediately = false) {
  useEffect(() => {
    let disposed = false;
    let timer: number | null = null;

    const run = async () => {
      if (disposed || document.visibilityState === "hidden" || !navigator.onLine) return;
      await callback();
    };

    if (runImmediately) void run();
    if (!enabled) {
      return () => { disposed = true; };
    }

    timer = window.setInterval(() => void run(), intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void run();
    };
    const onOnline = () => void run();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);

    return () => {
      disposed = true;
      if (timer !== null) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, [callback, enabled, intervalMs, runImmediately]);
}
