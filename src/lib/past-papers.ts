export type PastPaperSection = {
  label: string;
  instruction: string;
  questions: string;
};

export type PastPaper = {
  slug: string;
  subject: "mathematics" | "science" | "business-accounting";
  subjectName: string;
  year: string;
  sitting: string;
  medium: "English";
  source: "Department of Examinations, Sri Lanka";
  pdfUrl: string;
  pages: number;
  durationLabel: string;
  durationSeconds: number;
  readingMinutes?: number;
  mcqCount?: number;
  sections: PastPaperSection[];
};

export const PAST_PAPERS: PastPaper[] = [
  {
    slug: "mathematics-2020",
    subject: "mathematics",
    subjectName: "Mathematics",
    year: "2020",
    sitting: "2020",
    medium: "English",
    source: "Department of Examinations, Sri Lanka",
    pdfUrl: "/past-papers/mathematics-2020.pdf",
    pages: 12,
    durationLabel: "Paper I: 2 hours · Paper II: 3 hours + 10 minutes reading",
    durationSeconds: 2 * 60 * 60,
    readingMinutes: 10,
    sections: [
      { label: "Paper I · Part A", instruction: "Answer all questions on the paper.", questions: "1–25 · 2 marks each" },
      { label: "Paper I · Part B", instruction: "Answer all five questions on the paper.", questions: "1–5 · 10 marks each" },
      { label: "Paper II · Parts A & B", instruction: "Answer ten questions: five from Part A and five from Part B.", questions: "3 hours" },
    ],
  },
  {
    slug: "science-2021",
    subject: "science",
    subjectName: "Science",
    year: "2021",
    sitting: "2021 (2022)",
    medium: "English",
    source: "Department of Examinations, Sri Lanka",
    pdfUrl: "/past-papers/science-2021.pdf",
    pages: 8,
    durationLabel: "Paper I: 1 hour · Paper II included",
    durationSeconds: 60 * 60,
    mcqCount: 40,
    sections: [
      { label: "Paper I", instruction: "Answer all questions. Mark one of alternatives (1)–(4).", questions: "1–40" },
      { label: "Paper II · Part A", instruction: "Answer all questions.", questions: "1–4" },
      { label: "Paper II · Part B", instruction: "Answer only three questions.", questions: "Choose 3 from 5–9" },
    ],
  },
  {
    slug: "business-accounting-2023",
    subject: "business-accounting",
    subjectName: "Business & Accounting Studies",
    year: "2023",
    sitting: "2023 (2024)",
    medium: "English",
    source: "Department of Examinations, Sri Lanka",
    pdfUrl: "/past-papers/business-accounting-2023.pdf",
    pages: 12,
    durationLabel: "Papers I & II: 3 hours + 10 minutes reading",
    durationSeconds: 3 * 60 * 60,
    readingMinutes: 10,
    mcqCount: 40,
    sections: [
      { label: "Paper I", instruction: "Answer all questions. Mark one of alternatives (1)–(4).", questions: "1–40" },
      { label: "Paper II · Question 1", instruction: "Compulsory integrated case question.", questions: "1 · 20 marks" },
      { label: "Paper II · Part I", instruction: "Answer two Business Studies questions.", questions: "Choose 2 from 2–4" },
      { label: "Paper II · Part II", instruction: "Answer two Accounting questions.", questions: "Choose 2 from 5–7" },
    ],
  },
  {
    slug: "business-accounting-2024",
    subject: "business-accounting",
    subjectName: "Business & Accounting Studies",
    year: "2024",
    sitting: "2024 (2025)",
    medium: "English",
    source: "Department of Examinations, Sri Lanka",
    pdfUrl: "/past-papers/business-accounting-2024.pdf",
    pages: 12,
    durationLabel: "Papers I & II: 3 hours + 10 minutes reading",
    durationSeconds: 3 * 60 * 60,
    readingMinutes: 10,
    mcqCount: 40,
    sections: [
      { label: "Paper I", instruction: "Answer all questions. Mark one of alternatives (1)–(4).", questions: "1–40" },
      { label: "Paper II · Question 1", instruction: "Compulsory integrated case question.", questions: "1 · 20 marks" },
      { label: "Paper II · Part I", instruction: "Answer two Business Studies questions.", questions: "Choose 2 from 2–4" },
      { label: "Paper II · Part II", instruction: "Answer two Accounting questions.", questions: "Choose 2 from 5–7" },
    ],
  },
];

export function getPastPaper(slug: string): PastPaper | undefined {
  return PAST_PAPERS.find((paper) => paper.slug === slug);
}