const KEY = "ol-scores-v1";

type ScoreEntry = {
  subject: string;
  topic: string;
  score: number;
  total: number;
  date: string;
};

function read(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(data: ScoreEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data.slice(-200)));
}

export function recordScore(
  subject: string,
  topic: string,
  score: number,
  total: number,
) {
  const data = read();
  data.push({ subject, topic, score, total, date: new Date().toISOString() });
  write(data);
}

export function lastScoreFor(subject: string, topic: string): ScoreEntry | null {
  const data = read();
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].subject === subject && data[i].topic === topic) return data[i];
  }
  return null;
}