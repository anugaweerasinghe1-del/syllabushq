import { generateObject } from "ai";
import { z } from "zod";
import { googleAi, FAST_MODEL, SMART_MODEL } from "./ai-gateway.server";
import subjectsData from "@/data/subjects.json";
import type { Json } from "@/integrations/supabase/types";
import type { BankMode, McqItem, ShortItem, StructuredItem, BankItem } from "./bank-types";

type SubjectJSON = { slug: string; name: string; topics: { slug: string; name: string }[] };
const SUBJECTS = subjectsData as SubjectJSON[];

export type { BankMode, McqItem, ShortItem, StructuredItem, BankItem };

const McqSchema = z.object({
  questions: z.array(
    z.object({
      topic: z.string(),
      question: z.string(),
      options: z.array(z.string()),
      correct: z.number(),
      explanation: z.string(),
    }),
  ),
});

const ShortSchema = z.object({
  questions: z.array(
    z.object({
      topic: z.string(),
      question: z.string(),
      modelAnswer: z.string(),
      markingPoints: z.array(z.string()),
      marks: z.number(),
    }),
  ),
});

const StructuredSchema = z.object({
  questions: z.array(
    z.object({
      topic: z.string(),
      context: z.string(),
      parts: z.array(
        z.object({
          label: z.string(),
          prompt: z.string(),
          answer: z.string(),
          marks: z.number(),
        }),
      ),
    }),
  ),
});

// ---------------------------------------------------------------- hashing

export function hashOf(mode: BankMode, subject: string, text: string) {
  let h = 2166136261;
  const s = `${mode}|${subject}|${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${mode}-${subject}-${(h >>> 0).toString(36)}`;
}

function itemText(mode: BankMode, item: BankItem) {
  if (mode === "structured")
    return (
      (item as StructuredItem).context +
      " " +
      (item as StructuredItem).parts.map((p) => p.prompt).join(" ")
    );
  return (item as McqItem).question;
}

// ---------------------------------------------------------------- storage

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function readBank(opts: {
  mode: BankMode;
  subject: string;
  topics: string[];
  difficulty: string;
  limit: number;
}): Promise<BankItem[]> {
  try {
    const db = await admin();
    let q = db
      .from("generated_questions")
      .select("payload, topic")
      .eq("subject", opts.subject)
      .eq("mode", opts.mode)
      .limit(Math.min(400, Math.max(opts.limit * 4, 40)));
    if (opts.topics.length) q = q.in("topic", opts.topics);
    const { data, error } = await q;
    if (error || !data) return [];
    return data.map((r) => r.payload as BankItem);
  } catch {
    return [];
  }
}

export async function writeBank(
  mode: BankMode,
  subject: string,
  difficulty: string,
  items: BankItem[],
) {
  if (!items.length) return;
  try {
    const db = await admin();
    await db.from("generated_questions").upsert(
      items.map((it) => ({
        hash: hashOf(mode, subject, itemText(mode, it)),
        subject,
        topic: it.topic,
        mode,
        difficulty,
        payload: it as unknown as Json,
      })),
      { onConflict: "hash", ignoreDuplicates: true },
    );
  } catch {
    /* generation still returns to the student */
  }
}

// ---------------------------------------------------------------- throttle

const lastCall = new Map<string, number>();
const MIN_GAP = 1200;

export function throttled(key: string) {
  const last = lastCall.get(key) ?? 0;
  if (Date.now() - last < MIN_GAP) return true;
  lastCall.set(key, Date.now());
  return false;
}

// ---------------------------------------------------------------- generate

function topicList(subject: SubjectJSON, topics: string[]) {
  return (topics.length ? topics : subject.topics.map((t) => t.slug))
    .map((slug) => {
      const t = subject.topics.find((x) => x.slug === slug);
      return t ? `${t.slug} (${t.name})` : slug;
    })
    .join("; ");
}

function header(subject: SubjectJSON, topics: string[], difficulty: string, avoid: string[]) {
  return [
    `You are a Sri Lankan G.C.E. Ordinary Level examiner writing ${subject.name} questions in English medium.`,
    `Every question must be strictly inside the Sri Lankan NIE O/L syllabus for ${subject.name}. Never use Cambridge IGCSE or Edexcel content or terminology.`,
    `Allowed topics — use the slug VERBATIM in the "topic" field: ${topicList(subject, topics)}.`,
    difficulty && difficulty !== "all"
      ? `Target difficulty: ${difficulty}.`
      : `Mix easy, medium and hard fairly.`,
    `Use plain-text maths notation (x^2, sqrt(5), 3/4, log_2(8)). Never use LaTeX delimiters.`,
    `Use Sri Lankan context where natural (rupees, local place names, local businesses).`,
    avoid.length
      ? `Do NOT repeat or paraphrase any of these existing questions:\n${avoid
          .slice(0, 20)
          .map((q) => `- ${q.slice(0, 160)}`)
          .join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function tryModels<T>(fn: (model: string) => Promise<T>): Promise<T | null> {
  for (const model of [FAST_MODEL, SMART_MODEL]) {
    try {
      return await fn(model);
    } catch {
      /* next model */
    }
  }
  return null;
}

export async function generate(opts: {
  mode: BankMode;
  subject: string;
  topics: string[];
  difficulty: string;
  need: number;
  avoid: string[];
}): Promise<BankItem[]> {
  const subject = SUBJECTS.find((s) => s.slug === opts.subject);
  if (!subject) return [];
  const validTopic = (t: string) => subject.topics.some((x) => x.slug === t);
  const ai = googleAi();
  const need = Math.max(1, Math.min(12, opts.need));
  const base = header(subject, opts.topics, opts.difficulty, opts.avoid);

  if (opts.mode === "mcq") {
    const out = await tryModels(async (model) => {
      const { object } = await generateObject({
        model: ai(model),
        schema: McqSchema,
        prompt:
          base +
          `\nWrite exactly ${need} ORIGINAL multiple-choice questions. Each has exactly 4 plausible options, exactly one correct (0-based index in "correct"), and a 1-3 sentence explanation.`,
      });
      return object.questions;
    });
    return (out ?? [])
      .filter(
        (q) =>
          validTopic(q.topic) &&
          q.options.length === 4 &&
          q.correct >= 0 &&
          q.correct < 4 &&
          q.question.trim().length > 10 &&
          new Set(q.options.map((o) => o.trim().toLowerCase())).size === 4,
      )
      .slice(0, need);
  }

  if (opts.mode === "short") {
    const out = await tryModels(async (model) => {
      const { object } = await generateObject({
        model: ai(model),
        schema: ShortSchema,
        prompt:
          base +
          `\nWrite exactly ${need} ORIGINAL short-answer questions of the kind found in O/L Paper II. For each: a concise model answer (1-4 sentences), 2 to 5 marking points (one mark each), and "marks" equal to the number of marking points.`,
      });
      return object.questions;
    });
    return (out ?? [])
      .filter(
        (q) =>
          validTopic(q.topic) &&
          q.question.trim().length > 10 &&
          q.modelAnswer.trim().length > 5 &&
          q.markingPoints.length >= 1,
      )
      .map((q) => ({ ...q, marks: Math.max(1, Math.min(10, q.markingPoints.length || q.marks)) }))
      .slice(0, need);
  }

  const out = await tryModels(async (model) => {
    const { object } = await generateObject({
      model: ai(model),
      schema: StructuredSchema,
      prompt:
        base +
        `\nWrite exactly ${Math.min(need, 6)} ORIGINAL structured (essay-style) questions in real O/L Paper II format. Each has a short scenario/data "context" and 3 to 4 parts labelled a, b, c, d. Each part has a prompt, a model answer used as the marking reference, and a mark allocation of 2 to 5. Total marks per question should be 8 to 15.`,
    });
    return object.questions;
  });
  return (out ?? [])
    .filter(
      (q) =>
        validTopic(q.topic) &&
        q.parts.length >= 2 &&
        q.parts.every((p) => p.prompt.trim().length > 5 && p.answer.trim().length > 3),
    )
    .map((q) => ({
      ...q,
      parts: q.parts.map((p, i) => ({
        label: p.label || String.fromCharCode(97 + i),
        prompt: p.prompt,
        answer: p.answer,
        marks: Math.max(1, Math.min(8, Math.round(p.marks) || 2)),
      })),
    }))
    .slice(0, need);
}
