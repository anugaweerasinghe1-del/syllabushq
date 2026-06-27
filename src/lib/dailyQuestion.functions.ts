import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { googleAi, FAST_MODEL } from "./ai-gateway.server";
import subjectsData from "@/data/subjects.json";
import questionsData from "@/data/questions.json";

type SubjectJSON = { slug: string; name: string; topics: { slug: string; name: string }[] };
type QuestionJSON = { subject: string; topic: string; question: string; options: string[]; correct: number; explanation: string };

const SUBJECTS = subjectsData as SubjectJSON[];
const QUESTIONS = questionsData as QuestionJSON[];

// In-process cache keyed by ISO date. Server lives per request on the
// edge runtime, so this is a best-effort warm cache only — the LLM call
// is cheap and we degrade gracefully if it fails.
const cache = new Map<string, DailyOut>();

const Schema = z.object({
  subject: z.string(),
  topic: z.string(),
  question: z.string().min(20).max(500),
  options: z.array(z.string()).length(4),
  correct: z.number().int().min(0).max(3),
  explanation: z.string().min(20).max(600),
  hook: z.string().min(20).max(180),
});

export type DailyOut = z.infer<typeof Schema> & {
  date: string;
  subjectName: string;
  topicName: string;
  source: "ai" | "fallback";
};

function dateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function deterministicPick(date: string): DailyOut {
  // Stable fallback when AI fails / rate-limited.
  const hash = [...date].reduce((a, c) => a + c.charCodeAt(0), 0);
  const q = QUESTIONS[hash % QUESTIONS.length];
  const subject = SUBJECTS.find((s) => s.slug === q.subject);
  const topicName = subject?.topics.find((t) => t.slug === q.topic)?.name ?? q.topic;
  return {
    date,
    subject: q.subject,
    topic: q.topic,
    subjectName: subject?.name ?? q.subject,
    topicName,
    question: q.question,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
    hook: "Today's question, hand-picked from the SyllabusHQ bank.",
    source: "fallback",
  };
}

export const getDailyQuestion = createServerFn({ method: "GET" }).handler(
  async (): Promise<DailyOut> => {
    const date = dateKey();
    const cached = cache.get(date);
    if (cached) return cached;

    // Pick a deterministic subject/topic rotation so each day feels balanced.
    const dayIdx = Math.floor(Date.now() / 86400000);
    const subject = SUBJECTS[dayIdx % SUBJECTS.length];
    const topic = subject.topics[dayIdx % subject.topics.length];

    try {
      if (!process.env.GOOGLE_AI_API_KEY) throw new Error("no key");
      const model = googleAi()(FAST_MODEL);
      const { object } = await generateObject({
        model,
        schema: Schema,
        prompt: [
          `Today is ${date}. You are crafting the SyllabusHQ Daily Question for Sri Lankan G.C.E. O/L students (English medium).`,
          `Subject: ${subject.name} (${subject.slug})`,
          `Topic: ${topic.name} (${topic.slug})`,
          `Write ONE original, exam-realistic MCQ that strictly follows the Sri Lankan O/L syllabus.`,
          `- 4 plausible options, exactly one correct. correct = index of the correct option (0-3).`,
          `- Difficulty: medium, similar to a real O/L paper.`,
          `- "hook" = one tight, motivating line (<= 18 words) that introduces today's question.`,
          `- Keep "question" concise (<= 60 words). Use plain text or LaTeX inside $...$ for math.`,
          `Set "subject" to "${subject.slug}" and "topic" to "${topic.slug}".`,
        ].join("\n"),
      });
      const out: DailyOut = {
        ...object,
        date,
        subjectName: subject.name,
        topicName: topic.name,
        source: "ai",
      };
      cache.set(date, out);
      return out;
    } catch (err) {
      console.warn("[dailyQuestion] AI failed, falling back:", err);
      const out = deterministicPick(date);
      cache.set(date, out);
      return out;
    }
  },
);