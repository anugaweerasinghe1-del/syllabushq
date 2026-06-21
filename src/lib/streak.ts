const KEY = "ol-streak-v2";
const LEGACY_KEY = "ol-streak-v1";

type StreakData = {
  days: string[]; // ISO yyyy-mm-dd of all study days
  lastActivityAt: number; // ms epoch of the most recent study event
};

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function read(): StreakData {
  if (typeof window === "undefined") return { days: [], lastActivityAt: 0 };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as Partial<StreakData>;
      return {
        days: Array.isArray(data.days) ? data.days.filter((d) => typeof d === "string") : [],
        lastActivityAt: typeof data.lastActivityAt === "number" ? data.lastActivityAt : 0,
      };
    }
    // One-time migration from v1.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const data = JSON.parse(legacy) as { days?: string[] };
      const days = Array.isArray(data.days) ? data.days : [];
      return { days, lastActivityAt: 0 };
    }
    return { days: [], lastActivityAt: 0 };
  } catch {
    return { days: [], lastActivityAt: 0 };
  }
}

function write(data: StreakData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function markStudiedToday() {
  const data = read();
  const t = todayKey();
  const now = Date.now();
  const days = data.days.includes(t) ? data.days : [...data.days, t].sort();
  write({ days, lastActivityAt: now });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ol-streak-updated"));
  }
}

export function getStudyDays(): Set<string> {
  return new Set(read().days);
}

export function getLastActivityAt(): number {
  return read().lastActivityAt;
}

function dateAdd(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

/**
 * Compute streak stats. The current streak auto-resets to 0 when more than
 * 24 hours have passed since the last recorded study activity AND today is
 * not already studied.
 */
export function computeStreaks(
  days: Set<string>,
  lastActivityAt = 0,
  now = Date.now(),
): { current: number; longest: number; total: number; resetsInMs: number } {
  if (days.size === 0) return { current: 0, longest: 0, total: 0, resetsInMs: 0 };
  const sorted = [...days].sort();
  // longest
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  // current: count back from today (or yesterday if today not studied)
  const today = new Date();
  const t = todayKey(today);
  const y = todayKey(dateAdd(today, -1));
  let cursor: Date;
  if (days.has(t)) cursor = today;
  else if (days.has(y)) cursor = dateAdd(today, -1);
  else return { current: 0, longest, total: days.size, resetsInMs: 0 };

  // 24-hour rolling guard: if nothing recorded in the last 24h AND today
  // isn't studied yet, the active streak has lapsed.
  if (!days.has(t) && lastActivityAt > 0 && now - lastActivityAt > 24 * 60 * 60 * 1000) {
    return { current: 0, longest, total: days.size, resetsInMs: 0 };
  }

  let current = 0;
  while (days.has(todayKey(cursor))) {
    current++;
    cursor = dateAdd(cursor, -1);
  }

  // Time until the rolling 24h window collapses the streak.
  const resetsInMs = lastActivityAt > 0
    ? Math.max(0, lastActivityAt + 24 * 60 * 60 * 1000 - now)
    : 0;
  return { current, longest, total: days.size, resetsInMs };
}

/**
 * Build a grid of weeks x days for the heatmap.
 * weeks columns, 7 rows (Sun..Sat). Most recent week is the last column.
 */
export function buildHeatmap(days: Set<string>, weeks = 20) {
  const today = new Date();
  const end = new Date(today);
  // Move end to the Saturday of this week
  const dow = end.getDay(); // 0..6 (Sun..Sat)
  end.setDate(end.getDate() + (6 - dow));
  const start = dateAdd(end, -(weeks * 7 - 1));

  const grid: { date: string; studied: boolean; future: boolean }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: { date: string; studied: boolean; future: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = dateAdd(start, w * 7 + d);
      const key = todayKey(date);
      col.push({
        date: key,
        studied: days.has(key),
        future: date > today,
      });
    }
    grid.push(col);
  }
  return grid;
}