/**
 * Exact replicas of Sri Lankan G.C.E. O/L paper STRUCTURES (NIE / Department of
 * Examinations format). We mirror question counts, marks, and section flow —
 * never the wording of any real past paper.
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
        instruction: "Answer five questions only. 10 marks each.",
        questionType: "structured",
        count: 10,
        answerAny: 5,
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
    sections: [
      {
        id: "maths-p2-a",
        title: "Part A",
        instruction: "Answer all five questions. 10 marks each.",
        questionType: "structured",
        count: 5,
        perQuestionMarks: 10,
      },
      {
        id: "maths-p2-b",
        title: "Part B",
        instruction: "Answer five questions only. 12 marks each.",
        questionType: "essay",
        count: 7,
        answerAny: 5,
        perQuestionMarks: 12,
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
    sections: [
      {
        id: "science-p1-a",
        title: "Section A — Multiple Choice",
        instruction: "Underline the most appropriate answer. 1 mark each.",
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
    sections: [
      {
        id: "science-p2-a",
        title: "Part A — Structured",
        instruction: "Answer all questions. 7 marks each.",
        questionType: "structured",
        count: 10,
        perQuestionMarks: 7,
      },
      {
        id: "science-p2-b",
        title: "Part B — Essay",
        instruction: "Answer two questions only. 15 marks each.",
        questionType: "essay",
        count: 4,
        answerAny: 2,
        perQuestionMarks: 15,
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
    sections: [
      {
        id: "business-p1-a",
        title: "Section A — Multiple Choice",
        instruction: "Underline the most appropriate answer. 1 mark each.",
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
    totalMarks: 100,
    sections: [
      {
        id: "business-p2-a",
        title: "Part A — Structured",
        instruction: "Answer all four questions. 10 marks each.",
        questionType: "structured",
        count: 4,
        perQuestionMarks: 10,
      },
      {
        id: "business-p2-b",
        title: "Part B — Essay / Accounting Problem",
        instruction: "Answer three questions including at least one accounting problem. 20 marks each.",
        questionType: "essay",
        count: 6,
        answerAny: 3,
        perQuestionMarks: 20,
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