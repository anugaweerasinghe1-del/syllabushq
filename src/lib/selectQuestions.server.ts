import { generateObject } from "ai";
import { z } from "zod";
import { googleAi, FAST_MODEL, SMART_MODEL } from "./ai-gateway.server";
import subjectsData from "@/data/subjects.json";

type SubjectJSON = { slug: string; name: string; topics: { slug: string; name: string }[] };
const SUBJECTS = subjectsData as SubjectJSON[];

export const GenSchema = z.object({
  questions: z
    .array(
      z.object({
        topic: z.string(),
        question: z.string().min(15).max(500),
        options: z.array(z.string()).length(4),
        correct: z.number().int().min(0).max(3),
        explanation: z.string().min(15).max(600),
      }),
    )
    .min(1)
    .max(20),
});

export type GenQuestion = z.infer<typeof GenSchema>["questions"][number];

// Best-effort warm cache + a crude per-subject throttle so a burst of
// concurrent students collapses into very few upstream calls.
const cache = new Map<string, { at: number; items: GenQuestion[] }>();
const lastCall = new Map<string, number>();
const TTL = 10 * 60 * 1000;
const MIN_GAP = 3000;
const MAX_ENTRIES = 200;

export function cacheKey(o: {
  subject: string;
  topics: string[];
  difficulty: string;
  need: number;
}) {
  return `${o.subject}|${[...o.topics].sort().join(",")}|${o.difficulty}|${o.need}`;
}

export function readCache(key: string): GenQuestion[] | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL) {
    cache.delete(key);
    return null;
  }
  return hit.items;
}

export function writeCache(key: string, items: GenQuestion[]) {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { at: Date.now(), items });
}

export function throttled(subject: string) {
  const last = lastCall.get(subject) ?? 0;
  if (Date.now() - last < MIN_GAP) return true;
  lastCall.set(subject, Date.now());
  return false;
}

export async function generateTopUp(opts: {
  subject: string;
  topics: string[];
  difficulty: string;
  need: number;
  avoid: string[];
}): Promise<GenQuestion[]> {
  const subject = SUBJECTS.find((s) => s.slug === opts.subject);
  if (!subject) return [];
  const topicList = (opts.topics.length ? opts.topics : subject.topics.map((t) => t.slug))
    .map((slug) => {
      const t = subject.topics.find((x) => x.slug === slug);
      return t ? `${t.slug} (${t.name})` : slug;
    })
    .join("; ");

  const prompt = [
    `You are a Sri Lankan G.C.E. Ordinary Level examiner writing ${subject.name} MCQs in English medium.`,
    `Write exactly ${opts.need} ORIGINAL multiple-choice questions strictly within the Sri Lankan NIE O/L syllabus.`,
    `Allowed topics (use the slug verbatim in the "topic" field): ${topicList}.`,
    opts.difficulty !== "all"
      ? `Target difficulty: ${opts.difficulty}.`
      : `Mix easy, medium and hard fairly.`,
    `Each question must have 4 plausible options, exactly one correct, and a one-to-three sentence explanation.`,
    `Use plain text maths notation (e.g. x^2, sqrt(5), 3/4). Do not use LaTeX delimiters.`,
    opts.avoid.length
      ? `Do NOT repeat or paraphrase any of these existing questions:\n${opts.avoid
          .slice(0, 25)
          .map((q) => `- ${q}`)
          .join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const ai = googleAi();
  for (const model of [FAST_MODEL, SMART_MODEL]) {
    try {
      const { object } = await generateObject({
        model: ai(model),
        schema: GenSchema,
        prompt,
      });
      const valid = object.questions.filter((q) => subject.topics.some((t) => t.slug === q.topic));
      if (valid.length) return valid.slice(0, opts.need);
    } catch {
      // try next model, then give up silently (caller falls back to local bank)
    }
  }
  return [];
}
