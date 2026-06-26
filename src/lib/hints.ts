// Rate-limited hint quota — 4 hints per rolling 24h window.
// Pure client-side; persisted in localStorage.

const KEY = "shq:hints:v1";
export const HINT_LIMIT = 4;
export const HINT_WINDOW_MS = 24 * 60 * 60 * 1000;

type HintState = { uses: number[]; cache: Record<string, string> };

function read(): HintState {
  if (typeof window === "undefined") return { uses: [], cache: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { uses: [], cache: {} };
    const parsed = JSON.parse(raw) as Partial<HintState>;
    return { uses: parsed.uses ?? [], cache: parsed.cache ?? {} };
  } catch {
    return { uses: [], cache: {} };
  }
}

function write(state: HintState) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
}

function pruneUses(uses: number[]): number[] {
  const cutoff = Date.now() - HINT_WINDOW_MS;
  return uses.filter((t) => t > cutoff);
}

export function getQuota(): { remaining: number; resetMs: number | null } {
  const s = read();
  const live = pruneUses(s.uses);
  if (live.length < HINT_LIMIT) return { remaining: HINT_LIMIT - live.length, resetMs: null };
  const oldest = Math.min(...live);
  return { remaining: 0, resetMs: oldest + HINT_WINDOW_MS - Date.now() };
}

export function getCachedHint(questionId: string): string | null {
  return read().cache[questionId] ?? null;
}

/** Records a hint use and stores it in cache. Returns updated quota. */
export function commitHint(questionId: string, hint: string) {
  const s = read();
  const live = pruneUses(s.uses);
  live.push(Date.now());
  s.uses = live;
  s.cache[questionId] = hint;
  write(s);
}

/** Stable id for a question (no DB id available). */
export function hintIdFor(subject: string, topic: string, question: string): string {
  // tiny djb2-ish hash to keep keys bounded
  let h = 5381;
  const s = `${subject}|${topic}|${question}`;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `q_${(h >>> 0).toString(36)}`;
}

export function formatCountdown(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}