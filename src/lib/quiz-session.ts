// Deterministic, persistent quiz session.
// The set of questions is chosen ONCE per attempt and kept in sessionStorage
// keyed by (subject, topic, attemptId). This is what prevents the "questions
// switch on navigation" glitch — re-renders re-read the same stored order
// instead of re-rolling Math.random().
import type { Question } from "@/lib/content";

const DEFAULT_LEN = 10;

export type QuizConfig = {
  count: number;       // number of questions
  timeLimitSec: number; // 0 = untimed
  difficulty: "all" | "easy" | "medium" | "hard";
  mode: "mcq" | "exam"; // "exam" = full simulation
};

export type Session = {
  attemptId: string;
  subject: string;
  topic: string;
  order: number[];       // indexes into the pool (stable)
  answers: (number | null)[]; // chosen option per index (null = unanswered)
  current: number;       // current question index within `order`
  startedAt: number;
  config: QuizConfig;
};

function key(subject: string, topic: string) {
  return `ol-quiz-${subject}-${topic}`;
}

function freshOrder(pool: Question[], n: number): number[] {
  const idxs = pool.map((_, i) => i);
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
  }
  return idxs.slice(0, Math.min(n, idxs.length));
}

export function loadOrCreate(
  subject: string,
  topic: string,
  pool: Question[],
  config?: QuizConfig,
): Session {
  if (typeof window !== "undefined") {
    const raw = window.sessionStorage.getItem(key(subject, topic));
    if (raw) {
      try {
        const s = JSON.parse(raw) as Session;
        if (
          s &&
          s.subject === subject &&
          s.topic === topic &&
          Array.isArray(s.order) &&
          s.order.length > 0 &&
          s.order.every((i) => typeof i === "number" && i >= 0 && i < pool.length)
        ) {
          if (!s.config) {
            s.config = config ?? defaultConfig();
          }
          return s;
        }
      } catch { /* fall through */ }
    }
  }
  return startNew(subject, topic, pool, config);
}

export function startNew(
  subject: string,
  topic: string,
  pool: Question[],
  config?: QuizConfig,
): Session {
  const cfg = config ?? defaultConfig();
  const order = freshOrder(pool, cfg.count);
  const s: Session = {
    attemptId: crypto.randomUUID?.() ?? String(Date.now()),
    subject,
    topic,
    order,
    answers: order.map(() => null),
    current: 0,
    startedAt: Date.now(),
    config: cfg,
  };
  save(s);
  return s;
}

export function defaultConfig(): QuizConfig {
  return { count: DEFAULT_LEN, timeLimitSec: 0, difficulty: "all", mode: "mcq" };
}

export function save(s: Session) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key(s.subject, s.topic), JSON.stringify(s));
}

export function clear(subject: string, topic: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key(subject, topic));
}
