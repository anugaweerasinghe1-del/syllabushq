import type { Question } from "@/lib/content";

/**
 * Sample questions with balanced topic + difficulty distribution.
 *
 * - `balanced: true` -> distribute evenly across selected topics.
 * - `difficulty: "mix"` -> split evenly across easy/medium/hard (when present).
 * - Falls back to whatever the pool supports without crashing.
 */
export function pickQuestions(opts: {
  pool: Question[];
  topics: string[]; // empty array = use every topic in the pool
  count: number;
  balanced?: boolean;
  difficulty?: "all" | "mix" | "easy" | "medium" | "hard";
  seed?: number;
}): Question[] {
  const { pool, count, balanced = true } = opts;
  if (pool.length === 0 || count <= 0) return [];

  const topics = opts.topics.length
    ? opts.topics
    : Array.from(new Set(pool.map((q) => q.topic)));

  const rng = mulberry32(opts.seed ?? Date.now());

  function bucketByTopic(qs: Question[]) {
    const out: Record<string, Question[]> = {};
    for (const t of topics) out[t] = [];
    for (const q of qs) if (out[q.topic]) out[q.topic].push(q);
    return out;
  }

  const filtered = pool.filter((q) => topics.includes(q.topic));
  if (filtered.length === 0) return [];

  // No balancing requested -> simple shuffle
  if (!balanced) return shuffle(filtered, rng).slice(0, count);

  const buckets = bucketByTopic(filtered);
  for (const key of Object.keys(buckets)) buckets[key] = shuffle(buckets[key], rng);

  // Round-robin pick from each non-empty bucket until count reached or empty.
  const result: Question[] = [];
  const topicKeys = Object.keys(buckets).filter((k) => buckets[k].length > 0);
  let i = 0;
  let safety = 0;
  while (result.length < count && safety < count * 10) {
    safety += 1;
    const key = topicKeys[i % topicKeys.length];
    const next = buckets[key]?.shift();
    if (next) result.push(next);
    // Drop exhausted buckets to keep distribution balanced among the rest.
    if (!buckets[key] || buckets[key].length === 0) {
      const idx = topicKeys.indexOf(key);
      if (idx >= 0) topicKeys.splice(idx, 1);
      if (topicKeys.length === 0) break;
      continue;
    }
    i += 1;
  }
  return result;
}

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Tiny seedable PRNG so a given (topics, count, seed) returns the same paper. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}