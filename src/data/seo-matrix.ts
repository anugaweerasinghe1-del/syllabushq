import subjectsData from "./subjects.json";

export const SEO_CITIES = [
  "Colombo",
  "Kandy",
  "Galle",
  "Jaffna",
  "Negombo",
  "Matara",
  "Kurunegala",
  "Anuradhapura",
] as const;

export const SEO_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type SeoCity = (typeof SEO_CITIES)[number];
export type SeoDifficulty = (typeof SEO_DIFFICULTIES)[number];

export interface SeoPage {
  slug: string; // composite city-difficulty
  subject: string;
  subjectName: string;
  topic: string;
  topicName: string;
  city: SeoCity;
  difficulty: SeoDifficulty;
}

const subjects = subjectsData as Array<{
  slug: string;
  name: string;
  topics: Array<{ slug: string; name: string }>;
}>;

/**
 * ~480 page matrix: 3 subjects x ~10 topics x 3 difficulties x 8 cities.
 * We cap topics per subject to keep the matrix close to the user's
 * "mid-scale" target (~500 pages).
 */
const TOPICS_PER_SUBJECT = 8;

export const SEO_PAGES: SeoPage[] = subjects.flatMap((s) =>
  s.topics.slice(0, TOPICS_PER_SUBJECT).flatMap((t) =>
    SEO_DIFFICULTIES.flatMap((d) =>
      SEO_CITIES.map((city) => ({
        slug: `${city.toLowerCase()}-${d}`,
        subject: s.slug,
        subjectName: s.name,
        topic: t.slug,
        topicName: t.name,
        city,
        difficulty: d,
      })),
    ),
  ),
);

export function findSeoPage(subject: string, topic: string, slug: string): SeoPage | null {
  return (
    SEO_PAGES.find(
      (p) => p.subject === subject && p.topic === topic && p.slug === slug,
    ) ?? null
  );
}

export function seoTitle(p: SeoPage): string {
  return `${p.topicName} O/L Practice — ${p.difficulty[0].toUpperCase()}${p.difficulty.slice(1)} questions for ${p.city} students`;
}

export function seoDescription(p: SeoPage): string {
  return `Free Sri Lankan G.C.E. O/L ${p.subjectName} practice on ${p.topicName}. ${p.difficulty[0].toUpperCase()}${p.difficulty.slice(1)}-difficulty original questions with worked solutions — built for students in ${p.city}.`;
}