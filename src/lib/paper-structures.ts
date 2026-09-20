/**
 * Structures transcribed from the supplied Department of Examinations papers.
 * Generated practice must never be presented as an official paper.
 */

export type PaperSection = {
  id: string;
  title: string;
  instruction: string;
  questionType: "mcq" | "short" | "structured" | "essay";
  count: number;
  /** Marks per question in this section. */
  perQuestionMarks: number;
  /** "Answer any N of M" structures. Defaults to count (answer all). */
  answerAny?: number;
};

export type PaperStructure = {
  id: string;
  subjectSlug: string;
  name: string;
  durationMinutes: number;
  totalMarks: number;
  readingMinutes?: number;
  verifiedFrom: string;
  sections: PaperSection[];
};

export const PAPER_STRUCTURES: PaperStructure[] = [
  // ───────── Mathematics ─────────
  {
    id: "maths-p1",
    subjectSlug: "mathematics",
    name: "Mathematics · Paper I",
    durationMinutes: 120,
    totalMarks: 100,
    verifiedFrom: "Department of Examinations Mathematics 2020",
    sections: [
      {
        id: "maths-p1-a",
        title: "Part A",
        instruction: "Answer all questions. 2 marks each.",
        questionType: "short",
        count: 25,
        perQuestionMarks: 2,
      },
      {
        id: "maths-p1-b",
        title: "Part B",
        instruction: "Answer all five questions. 10 marks each.",
        questionType: "structured",
        count: 5,
        perQuestionMarks: 10,
      },
    ],
  },
  {
    id: "maths-p2",
    subjectSlug: "mathematics",
    name: "Mathematics · Paper II",
    durationMinutes: 180,
    totalMarks: 100,
    readingMinutes: 10,
    verifiedFrom: "Department of Examinations Mathematics 2020",
    sections: [
      {
        id: "maths-p2-a",
        title: "Part A",
        instruction: "Answer five questions from Part A.",
        questionType: "structured",
        count: 6,
        answerAny: 5,
        perQuestionMarks: 10,
      },
      {
        id: "maths-p2-b",
        title: "Part B",
        instruction: "Answer five questions from Part B.",
        questionType: "essay",
        count: 6,
        answerAny: 5,
        perQuestionMarks: 10,
      },
    ],
  },

  // ───────── Science ─────────
  {
    id: "science-p1",
    subjectSlug: "science",
    name: "Science · Paper I",
    durationMinutes: 60,
    totalMarks: 40,
    verifiedFrom: "Department of Examinations Science 2021 (2022)",
    sections: [
      {
        id: "science-p1-a",
        title: "Section A — Multiple Choice",
        instruction: "Answer all questions. Mark a cross for the correct or most appropriate alternative. 1 mark each.",
        questionType: "mcq",
        count: 40,
        perQuestionMarks: 1,
      },
    ],
  },
  {
    id: "science-p2",
    subjectSlug: "science",
    name: "Science · Paper II",
    durationMinutes: 180,
    totalMarks: 100,
    verifiedFrom: "Department of Examinations Science 2021 (2022)",
    sections: [
      {
        id: "science-p2-a",
        title: "Part A — Structured",
        instruction: "Answer all questions 1 to 4.",
        questionType: "structured",
        count: 4,
        perQuestionMarks: 10,
      },
      {
        id: "science-p2-b",
        title: "Part B — Essay",
        instruction: "Answer only three questions from questions 5 to 9. 20 marks each.",
        questionType: "essay",
        count: 5,
        answerAny: 3,
        perQuestionMarks: 20,
      },
    ],
  },

  // ───────── Business & Accounting Studies ─────────
  {
    id: "business-p1",
    subjectSlug: "business-accounting",
    name: "Business & Accounting Studies · Paper I",
    durationMinutes: 60,
    totalMarks: 40,
    verifiedFrom: "Department of Examinations Business & Accounting Studies 2023 and 2024",
    sections: [
      {
        id: "business-p1-a",
        title: "Section A — Multiple Choice",
        instruction: "Answer all questions. Mark a cross for the correct or most appropriate alternative. 1 mark each.",
        questionType: "mcq",
        count: 40,
        perQuestionMarks: 1,
      },
    ],
  },
  {
    id: "business-p2",
    subjectSlug: "business-accounting",
    name: "Business & Accounting Studies · Paper II",
    durationMinutes: 180,
    totalMarks: 60,
    readingMinutes: 10,
    verifiedFrom: "Department of Examinations Business & Accounting Studies 2023 and 2024",
    sections: [
      {
        id: "business-p2-compulsory",
        title: "Compulsory integrated case",
        instruction: "Answer question 1.",
        questionType: "structured",
        count: 1,
        perQuestionMarks: 20,
      },
      {
        id: "business-p2-business",
        title: "Part I — Business Studies",
        instruction: "Answer two questions from questions 2 to 4.",
        questionType: "essay",
        count: 3,
        answerAny: 2,
        perQuestionMarks: 8,
      },
      {
        id: "business-p2-accounting",
        title: "Part II — Accounting",
        instruction: "Answer two questions from questions 5 to 7.",
        questionType: "structured",
        count: 3,
        answerAny: 2,
        perQuestionMarks: 12,
      },
    ],
  },
];

export function getStructuresFor(subjectSlug: string): PaperStructure[] {
  return PAPER_STRUCTURES.filter((p) => p.subjectSlug === subjectSlug);
}

export function getStructureById(id: string): PaperStructure | undefined {
  return PAPER_STRUCTURES.find((p) => p.id === id);
}
