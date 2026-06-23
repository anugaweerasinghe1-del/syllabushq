import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { googleAi, SMART_MODEL } from "./ai-gateway.server";

const GradeSchema = z.object({
  marksAwarded: z.number().min(0),
  totalMarks: z.number().min(1),
  verdict: z.enum(["correct", "partial", "incorrect"]),
  breakdown: z.array(
    z.object({
      point: z.string(),
      awarded: z.boolean(),
      evidence: z.string().optional(),
    }),
  ),
  misconceptions: z.array(z.string()).default([]),
  modelAnswer: z.string(),
  nextStepHint: z.string(),
});

export type GradeResult = z.infer<typeof GradeSchema>;

export const gradeAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        question: z.string().min(1).max(4000),
        studentAnswer: z.string().max(8000),
        markingScheme: z.string().min(1).max(6000),
        totalMarks: z.number().min(1).max(20),
        subject: z.string().max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const provider = googleAi();
    const { object } = await generateObject({
      model: provider(SMART_MODEL),
      schema: GradeSchema,
      system:
        "You are a Sri Lankan G.C.E. O/L Cambridge/Edexcel-style chief examiner. " +
        "Mark strictly to the scheme: award 1 mark per scheme point only when the student's answer demonstrates that point in their own words or equivalent working. " +
        "Never double-credit the same point. Accept synonyms and correct paraphrasing. Penalise vagueness. " +
        "Always return a concise modelAnswer (2-5 sentences) and one nextStepHint that tells the student exactly what to study next. " +
        "Math may appear in LaTeX (between $...$); accept equivalent numeric answers.",
      prompt:
        `SUBJECT: ${data.subject}\n` +
        `TOTAL MARKS: ${data.totalMarks}\n\n` +
        `QUESTION:\n${data.question}\n\n` +
        `MARKING SCHEME (one bullet = one mark):\n${data.markingScheme}\n\n` +
        `STUDENT ANSWER:\n${data.studentAnswer || "(blank)"}\n`,
    });
    return object;
  });