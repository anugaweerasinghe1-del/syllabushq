import { useEffect, useRef, useState } from "react";

/**
 * Persistent, accurate exam timer. Survives reloads via sessionStorage.
 * Returns { remaining, mm, ss, isLow, isCritical, expired }.
 * Auto-fires onExpire exactly once when the clock hits 0.
 */
export function useExamTimer(opts: {
  storageKey: string;
  durationSec: number;
  onExpire?: () => void;
  enabled?: boolean;
}) {
  const { storageKey, durationSec, onExpire, enabled = true } = opts;
  const startRef = useRef<number>(0);
  const firedRef = useRef(false);
  const [now, setNow] = useState<number>(() => Date.now());

  // Initialise / restore start timestamp
  useEffect(() => {
    if (!enabled || durationSec <= 0) return;
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(storageKey);
    let start = 0;
    if (raw) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed > 0) start = parsed;
    }
    if (!start) {
      start = Date.now();
      window.sessionStorage.setItem(storageKey, String(start));
    }
    startRef.current = start;
    setNow(Date.now());
  }, [storageKey, durationSec, enabled]);

  // Tick
  useEffect(() => {
    if (!enabled || durationSec <= 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [durationSec, enabled]);

  const elapsed = enabled && startRef.current ? Math.floor((now - startRef.current) / 1000) : 0;
  const remaining = Math.max(0, durationSec - elapsed);

  // Auto-expire
  useEffect(() => {
    if (!enabled || durationSec <= 0) return;
    if (remaining === 0 && !firedRef.current && startRef.current > 0) {
      firedRef.current = true;
      onExpire?.();
    }
  }, [remaining, enabled, durationSec, onExpire]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return {
    remaining,
    mm,
    ss,
    isLow: durationSec > 0 && remaining > 0 && remaining <= 300,
    isCritical: durationSec > 0 && remaining > 0 && remaining <= 60,
    expired: durationSec > 0 && remaining === 0 && startRef.current > 0,
    reset() {
      if (typeof window === "undefined") return;
      window.sessionStorage.removeItem(storageKey);
      firedRef.current = false;
      startRef.current = Date.now();
      window.sessionStorage.setItem(storageKey, String(startRef.current));
      setNow(Date.now());
    },
  };
}