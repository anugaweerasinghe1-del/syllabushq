// Mistakes notebook + flashcard memory, stored on this device only.
import type { Question } from "@/lib/content";

const MISTAKES = "shq-mistakes";
const CARDS = "shq-flashcards";

export type Mistake = Question & { addedAt: number; misses: number };

const keyOf = (q: { question: string }) => q.question.trim().toLowerCase().replace(/\s+/g, " ");

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* quota */
  }
}

export function loadMistakes(): Mistake[] {
  return read<Mistake[]>(MISTAKES, []);
}

export function addMistakes(items: Question[]) {
  if (!items.length) return;
  const list = loadMistakes();
  const map = new Map(list.map((m) => [keyOf(m), m]));
  for (const q of items) {
    const k = keyOf(q);
    const prev = map.get(k);
    map.set(k, prev ? { ...prev, misses: prev.misses + 1, addedAt: Date.now() } : { ...q, addedAt: Date.now(), misses: 1 });
  }
  write(MISTAKES, [...map.values()].sort((a, b) => b.addedAt - a.addedAt).slice(0, 500));
}

export function removeMistake(q: { question: string }) {
  const k = keyOf(q);
  write(
    MISTAKES,
    loadMistakes().filter((m) => keyOf(m) !== k),
  );
}

// Simple Leitner boxes: 0 = new/again … 4 = mastered. Higher box = seen less often.
type CardState = { box: number; due: number };
const INTERVAL_DAYS = [0, 1, 3, 7, 16];

export function loadCardStates(): Record<string, CardState> {
  return read<Record<string, CardState>>(CARDS, {});
}

export function rateCard(q: { question: string }, knew: boolean) {
  const all = loadCardStates();
  const k = keyOf(q);
  const prev = all[k] ?? { box: 0, due: 0 };
  const box = knew ? Math.min(4, prev.box + 1) : 0;
  all[k] = { box, due: Date.now() + INTERVAL_DAYS[box] * 86_400_000 };
  write(CARDS, all);
}

export function cardKey(q: { question: string }) {
  return keyOf(q);
}
