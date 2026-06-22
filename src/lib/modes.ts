export type Mode = "mcq" | "structured" | "short" | "exam";

export const MODES: { slug: Mode; name: string; tagline: string; bullets: string[]; defaults: { count: number; time: number } }[] = [
  {
    slug: "mcq",
    name: "MCQ",
    tagline: "Rapid recall · 1 mark each",
    bullets: ["Up to 50 questions", "Instant feedback & explanations", "Per-topic or mix"],
    defaults: { count: 20, time: 0 },
  },
  {
    slug: "structured",
    name: "Structured Paper",
    tagline: "Real O/L paper format",
    bullets: ["Multi-part questions", "Mark allocations", "Model answers on reveal"],
    defaults: { count: 6, time: 60 * 60 },
  },
  {
    slug: "short",
    name: "Short Answer",
    tagline: "Write · self-grade · learn",
    bullets: ["One question at a time", "Marking points", "Reveal & self-score"],
    defaults: { count: 15, time: 0 },
  },
  {
    slug: "exam",
    name: "Full Exam Simulation",
    tagline: "Timed · sectioned · realistic",
    bullets: ["Mixed paper", "Hard timer", "No feedback until submit"],
    defaults: { count: 30, time: 90 * 60 },
  },
];

export const MODE_BY_SLUG = Object.fromEntries(MODES.map((m) => [m.slug, m])) as Record<Mode, (typeof MODES)[number]>;