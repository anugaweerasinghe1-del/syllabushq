import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { googleAi, FAST_MODEL } from "./ai-gateway.server";

const QuestionSchema = z.object({
  prompt: z.string(),
  type: z.enum(["mcq", "short", "structured"]),
  choices: z.array(z.string()).optional(),
  answer: z.string(),
  markingScheme: z.string(),
  totalMarks: z.number().min(1).max(20),
  topic: z.string(),
  command: z.string().optional(),
});

const PaperSchema = z.object({
  paperTitle: z.string(),
  questions: z.array(QuestionSchema).min(1).max(40),
});

export type GeneratedQuestion = z.infer<typeof QuestionSchema>;
export type GeneratedPaper = z.infer<typeof PaperSchema>;

function hashPaperKey(input: object) {
  const str = JSON.stringify(input);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return `pap_${(h >>> 0).toString(36)}`;
}

const PAPER_TEMPLATES: Record<string, { kind: "mcq" | "structured" | "short"; perItemMarks: number; commands: string[]; description: string }> = {
  "business-p1": {
    kind: "mcq",
    perItemMarks: 1,
    commands: ["State", "Identify", "Define", "Select"],
    description: "Sri Lankan O/L Business & Accounting Studies Paper 1 — multiple choice with 4 options.",
  },
  "business-p2": {
    kind: "structured",
    perItemMarks: 6,
    commands: ["Explain", "Describe", "Calculate", "Analyse", "Justify"],
    description: "Sri Lankan O/L Business & Accounting Studies Paper 2 — structured questions with sub-parts (a), (b), (c). Include marking scheme bullets per mark.",
  },
  "science-p1": {
    kind: "mcq",
    perItemMarks: 1,
    commands: ["Which", "What", "Identify", "Select"],
    description: "Sri Lankan O/L Science Paper 1 — multiple choice with 4 options. Mix of Physics, Chemistry, Biology.",
  },
  "science-p2": {
    kind: "structured",
    perItemMarks: 6,
    commands: ["Explain", "Describe", "State the law of", "Calculate", "Draw"],
    description: "Sri Lankan O/L Science Paper 2 — structured short and extended response.",
  },
};

export const generatePaper = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        templateId: z.enum(["business-p1", "business-p2", "science-p1", "science-p2"]),
        subject: z.string(),
        topics: z.array(z.string()).min(1),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        count: z.number().min(1).max(20).default(5),
        seed: z.number().int().nonnegative().default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const template = PAPER_TEMPLATES[data.templateId];
    const key = hashPaperKey(data);

    // Cache hit
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cached } = await supabaseAdmin
      .from("generated_questions")
      .select("payload")
      .eq("hash", key)
      .maybeSingle();
    if (cached?.payload) {
      return { cached: true, key, paper: cached.payload as GeneratedPaper };
    }

    const provider = googleAi();
    const { object } = await generateObject({
      model: provider(FAST_MODEL),
      schema: PaperSchema,
      system:
        "You write 100% ORIGINAL practice questions in the exact style of the Sri Lankan G.C.E. Ordinary Level English-medium papers. " +
        "Never copy from any real past paper. Use Sri Lankan names, currency (Rs.), and contexts where appropriate. " +
        "Math must use LaTeX between $...$ (e.g. $\\\\sqrt{16}\\\\div 2$). Never use ASCII like sqrt(x) or x^2. " +
        "Each question must include a precise markingScheme written as bullet points, one bullet per mark.",
      prompt:
        `Template: ${template.description}\n` +
        `Topics to cover: ${data.topics.join(", ")}\n` +
        `Difficulty: ${data.difficulty}\n` +
        `Questions to produce: ${data.count} (each worth ~${template.perItemMarks} marks)\n` +
        `Allowed command words: ${template.commands.join(", ")}\n` +
        `Seed (variation token): ${data.seed}\n\n` +
        (template.kind === "mcq"
          ? "Produce MCQs with exactly 4 choices each. The answer field is the exact text of the correct choice."
          : "Produce structured questions. If multi-part, label parts (a), (b), (c) inside prompt and reflect marks per part in markingScheme."),
    });

    await supabaseAdmin
      .from("generated_questions")
      .insert({
        hash: key,
        subject: data.subject,
        topic: data.topics.join(","),
        mode: data.templateId,
        difficulty: data.difficulty,
        payload: object,
      })
      .select()
      .maybeSingle();

    return { cached: false, key, paper: object };
  });