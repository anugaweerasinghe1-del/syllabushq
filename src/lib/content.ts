import { queryOptions } from "@tanstack/react-query";
import subjectsData from "@/data/subjects.json";
import questionsData from "@/data/questions.json";

export type Topic = { slug: string; name: string };
export type Subject = { slug: string; name: string; topics: Topic[] };
export type Question = {
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

const SUBJECTS: Subject[] = subjectsData as Subject[];
const QUESTIONS: Question[] = questionsData as Question[];

export const subjectsQuery = queryOptions({
  queryKey: ["subjects"],
  queryFn: async (): Promise<Subject[]> => SUBJECTS,
  staleTime: Infinity,
});

export const questionsQuery = queryOptions({
  queryKey: ["questions"],
  queryFn: async (): Promise<Question[]> => QUESTIONS,
  staleTime: Infinity,
});

export function countByTopic(questions: Question[]) {
  const map = new Map<string, number>();
  for (const q of questions) {
    const k = `${q.subject}::${q.topic}`;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

export function countBySubject(questions: Question[]) {
  const map = new Map<string, number>();
  for (const q of questions) {
    map.set(q.subject, (map.get(q.subject) ?? 0) + 1);
  }
  return map;
}

export function getQuestionsFor(
  questions: Question[],
  subjectSlug: string,
  topicSlug: string,
) {
  return questions.filter((q) => q.subject === subjectSlug && q.topic === topicSlug);
}

export function pickRandom<T>(items: T[], n: number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

// ---------- Robust subject/topic resolution -----------------------------------
// Handles URL-encoding, casing, trailing slashes, near-misses (e.g. plural
// drift, hyphen drift). Returns null instead of throwing so callers can render
// a branded NotFound state rather than crashing the route.

function normaliseSlug(raw: string): string {
  try { raw = decodeURIComponent(raw); } catch { /* ignore */ }
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Hand-curated aliases for legacy / pluralised slugs that have appeared in old
// links. Extend freely — first match wins.
const TOPIC_ALIASES: Record<string, string> = {
  "real-number": "real-numbers",
  "indices-and-logarithms": "indices-logarithms",
  "indices": "indices-logarithms",
  "logarithms": "indices-logarithms",
  "percentage": "percentages",
  "ratio": "ratio-proportion",
  "proportion": "ratio-proportion",
  "algebra": "algebraic-expressions",
  "factorisation": "factors",
  "factorization": "factors",
  "equation": "equations",
  "quadratic": "quadratic-equations",
  "simultaneous": "simultaneous-equations",
  "sets": "sets-probability",
  "probability": "sets-probability",
  "area": "perimeter-area",
  "perimeter": "perimeter-area",
  "volume": "volume-surface-area",
  "surface-area": "volume-surface-area",
  "triangle": "triangles",
  "circle": "circle-theorems",
  "trig": "trigonometry",
  "graphs": "graphs-functions",
  "functions": "graphs-functions",
  "matrix": "matrices",
  "vector": "vectors",
  "atom": "atomic-structure",
  "bonding": "chemical-bonding",
  "acids": "acids-bases-salts",
  "metals": "metals-non-metals",
  "organic": "organic-chemistry",
  "motion": "motion-forces",
  "forces": "motion-forces",
  "energy": "work-energy-power",
  "cells": "cells-tissues",
  "digestion": "nutrition-digestion",
  "respiration": "respiration-circulation",
  "ecosystem": "ecosystems",
  "microbes": "microorganisms",
  "marketing-mix": "marketing",
  "bank": "money-banking",
  "transport": "transport-communication",
  "accounting": "intro-accounting",
  "ledger": "double-entry",
  "trial-balances": "trial-balance",
};

export function resolveSubject(
  subjects: Subject[],
  raw: string | undefined,
): Subject | null {
  if (!raw) return null;
  const want = normaliseSlug(raw);
  return (
    subjects.find((s) => s.slug === want) ??
    subjects.find((s) => normaliseSlug(s.slug) === want) ??
    subjects.find((s) => normaliseSlug(s.name) === want) ??
    null
  );
}

export function resolveTopic(
  subject: Subject,
  raw: string | undefined,
): Topic | null {
  if (!raw) return null;
  const want = normaliseSlug(raw);
  const aliased = TOPIC_ALIASES[want] ?? want;
  return (
    subject.topics.find((t) => t.slug === want) ??
    subject.topics.find((t) => t.slug === aliased) ??
    subject.topics.find((t) => normaliseSlug(t.name) === want) ??
    subject.topics.find((t) => normaliseSlug(t.slug).includes(want) || want.includes(normaliseSlug(t.slug))) ??
    // Last-resort: fuzzy word-overlap match so a URL like "circles" resolves
    // to "circle-theorems". Prevents dead "we couldn't find that topic"
    // screens on legitimate but drifted slugs.
    (() => {
      const wantWords = new Set(want.split("-").filter(Boolean));
      let best: { t: Topic; score: number } | null = null;
      for (const t of subject.topics) {
        const tw = new Set(normaliseSlug(t.slug).split("-").filter(Boolean));
        let score = 0;
        for (const w of wantWords) if (tw.has(w)) score++;
        if (score > 0 && (!best || score > best.score)) best = { t, score };
      }
      return best?.t ?? null;
    })()
  );
}

export function suggestTopics(subject: Subject, n = 6): Topic[] {
  return subject.topics.slice(0, n);
}