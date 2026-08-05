import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { withModels } from "./ai-gateway.server";

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

export type GradeSource = "ai" | "auto";

export type GradeResult = z.infer<typeof GradeSchema>;

/**
 * Strict AI marker for the Sri Lankan G.C.E. O/L English-medium papers.
 * - Awards 1 mark per scheme bullet when the idea / working is present.
 * - Accepts equivalent paraphrasing, alternative methods, and synonyms.
 * - Accepts text descriptions of graphs / diagrams in lieu of a drawing.
 * - Optionally accepts an uploaded image (base64) of handwritten working.
 * - Never self-scores. Returns deterministic, auditable breakdown.
 */
export const gradeAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        question: z.string().min(1).max(4000),
        studentAnswer: z.string().max(8000),
        markingScheme: z.string().min(1).max(6000),
        totalMarks: z.number().min(1).max(20),
        subject: z.string().max(64),
        imageBase64: z.string().max(2_500_000).optional(),
        imageMime: z.string().max(64).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const userText =
      `SUBJECT: ${data.subject}\n` +
      `TOTAL MARKS: ${data.totalMarks}\n\n` +
      `QUESTION:\n${data.question}\n\n` +
      `MARKING SCHEME (one bullet = one mark):\n${data.markingScheme}\n\n` +
      `STUDENT ANSWER (typed):\n${data.studentAnswer || "(blank)"}\n` +
      (data.imageBase64
        ? `\nSTUDENT ALSO SUBMITTED A HANDWRITTEN / DIAGRAM IMAGE. Inspect it carefully.\n`
        : "");

    const userContent: Array<
      { type: "text"; text: string } | { type: "image"; image: string; mediaType?: string }
    > = [{ type: "text", text: userText }];
    if (data.imageBase64) {
      userContent.push({
        type: "image",
        image: data.imageBase64,
        mediaType: data.imageMime ?? "image/jpeg",
      });
    }

    const system =
        "You are a Sri Lankan G.C.E. Ordinary Level (English medium) chief examiner. " +
        "You strictly follow the OFFICIAL Sri Lankan O/L marking scheme — NIE / Department of Examinations. " +
        "Award 1 mark per scheme bullet ONLY when the student's answer demonstrates that point — either in their own words, by equivalent working, by a clearly labelled diagram, or by a precise textual DESCRIPTION of a graph / diagram (axes, intercepts, gradient, shape). " +
        "Where the student cannot draw (this is a typed answer), accept descriptions like 'a straight line through the origin with gradient 2', 'a parabola opening upwards with vertex (0,-4)', or labelled coordinate lists, as full credit for that mark. " +
        "Accept alternative valid methods, synonyms, and equivalent numeric forms (fractions vs decimals, LaTeX vs prose). " +
        "Award marks for METHOD (M marks) even when the final answer is wrong, exactly as the real O/L scheme does. " +
        "Never double-credit the same point. Never invent marks beyond the scheme. Never self-score — produce a precise audit trail. " +
        "Always return a concise modelAnswer (2–5 sentences), a list of misconceptions if any, and one actionable nextStepHint naming the specific topic to revise. " +
      "Use only the local Sri Lankan O/L syllabus terminology — never Cambridge IGCSE or Edexcel.";

    try {
      const { object } = await withModels("smart", (model) =>
        generateObject({
          model,
          schema: GradeSchema,
          system,
          messages: [{ role: "user", content: userContent }],
        }),
      );
      return { ...object, source: "ai" as GradeSource };
    } catch (err) {
      console.warn("[gradeAnswer] all providers failed, auto-marking:", err);
      return { ...autoMark(data.studentAnswer, data.markingScheme, data.totalMarks), source: "auto" as GradeSource };
    }
  });

/**
 * Quota-proof keyword rubric. Each marking-scheme bullet is matched against
 * the student's answer on its distinctive terms. Clearly labelled as
 * auto-marked so students know an examiner model didn't see it.
 */
function autoMark(answer: string, scheme: string, totalMarks: number): GradeResult {
  const said = answer.toLowerCase();
  const bullets = scheme
    .split(/\n+/)
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, Math.max(1, totalMarks));
  const stop = new Set(["the", "and", "for", "with", "that", "this", "from", "into", "must", "each", "any", "are", "its", "was", "one", "mark", "marks"]);
  const breakdown = bullets.map((point) => {
    const keys = point
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stop.has(w));
    const hits = keys.filter((k) => said.includes(k)).length;
    const awarded = keys.length > 0 && hits / keys.length >= 0.5;
    return { point, awarded, evidence: awarded ? "Matched key terms in your answer." : undefined };
  });
  const marksAwarded = breakdown.filter((b) => b.awarded).length;
  const ratio = totalMarks ? marksAwarded / totalMarks : 0;
  return {
    marksAwarded,
    totalMarks,
    verdict: ratio >= 0.95 ? "correct" : ratio > 0 ? "partial" : "incorrect",
    breakdown,
    misconceptions: [],
    modelAnswer: scheme,
    nextStepHint:
      "Auto-marked: the AI examiner was unavailable, so this was scored by matching key terms against the marking scheme. Compare your answer with the scheme above.",
  };
}
