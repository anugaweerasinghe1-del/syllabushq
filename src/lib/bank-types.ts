export type BankMode = "mcq" | "short" | "structured";

export type McqItem = {
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type ShortItem = {
  topic: string;
  question: string;
  modelAnswer: string;
  markingPoints: string[];
  marks: number;
};

export type StructuredPart = { label: string; prompt: string; answer: string; marks: number };

export type StructuredItem = {
  topic: string;
  context: string;
  parts: StructuredPart[];
};

export type BankItem = McqItem | ShortItem | StructuredItem;
