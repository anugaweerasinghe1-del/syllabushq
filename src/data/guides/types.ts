export type GuideCategory = "past-papers" | "exam-strategy" | "study-guide";

export type GuideSection = {
  h: string;
  p?: string[];
  ul?: string[];
  ol?: string[];
  /** Optional simple two-column table. First row is the header. */
  table?: string[][];
};

export type Guide = {
  slug: string;
  category: GuideCategory;
  /** The search phrase this page is written for. */
  keyword: string;
  title: string;
  metaTitle: string;
  description: string;
  readMinutes: number;
  intro: string;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  cta: { label: string; href: string };
  related: string[];
};

export const CATEGORY_LABEL: Record<GuideCategory, string> = {
  "past-papers": "Past papers",
  "exam-strategy": "Exam strategy",
  "study-guide": "Study guides",
};
