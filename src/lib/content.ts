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