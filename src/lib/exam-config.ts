// Cross-page config store for short-answer and structured exam runners.
// The setup screen (practice.$mode.$subject.tsx) writes here; the runners read it.
// Falls back to sensible defaults when no config is set.

export type ExamRunnerConfig = {
  count: number;
  timeLimitSec: number;
  topics: string[]; // empty = all
};

function key(mode: string, subject: string) {
  return `ol-exam-cfg-${mode}-${subject}`;
}

export function saveExamConfig(mode: string, subject: string, cfg: ExamRunnerConfig) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(key(mode, subject), JSON.stringify(cfg)); } catch { /* quota */ }
}

export function loadExamConfig(mode: string, subject: string, fallback: ExamRunnerConfig): ExamRunnerConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key(mode, subject));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as ExamRunnerConfig;
    return {
      count: typeof parsed.count === "number" && parsed.count > 0 ? parsed.count : fallback.count,
      timeLimitSec: typeof parsed.timeLimitSec === "number" ? parsed.timeLimitSec : fallback.timeLimitSec,
      topics: Array.isArray(parsed.topics) ? parsed.topics : fallback.topics,
    };
  } catch { return fallback; }
}