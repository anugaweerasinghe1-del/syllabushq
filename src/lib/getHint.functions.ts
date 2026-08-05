import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { withModels } from "./ai-gateway.server";

/**
 * Returns ONE short Socratic hint for a question — never the answer.
 * Free-tier friendly: ~80 tokens out, fast model.
 */
export const getHint = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        subject: z.string().max(64),
        topic: z.string().max(64),
        question: z.string().min(1).max(2000),
        options: z.array(z.string()).max(8).optional(),
        explanation: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const prompt = [
      "You are a Sri Lankan G.C.E. O/L tutor.",
      `Subject: ${data.subject}. Topic: ${data.topic}.`,
      "Give ONE short Socratic hint (≤ 28 words) that nudges the student toward the answer without revealing it.",
      "Do NOT name the correct option. Do NOT solve the question. Use plain English.",
      "",
      `Question: ${data.question}`,
      data.options?.length
        ? `Options: ${data.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(" | ")}`
        : "",
    ].join("\n");

    try {
      const { text } = await withModels("fast", (model) =>
        generateText({ model, prompt, temperature: 0.4 }),
      );
      return { hint: text.trim().slice(0, 240), source: "ai" as const };
    } catch (err) {
      console.warn("[getHint] all providers failed, using written fallback:", err);
      return { hint: writtenHint(data.explanation, data.topic), source: "fallback" as const };
    }
  });

/**
 * Quota-proof fallback: build a nudge from the question's own explanation
 * without revealing the answer.
 */
function writtenHint(explanation: string | undefined, topic: string): string {
  const clean = (explanation ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return `Re-read the question and write down what ${topic} formula or rule applies first.`;
  const first = clean.split(/(?<=[.!?])\s/)[0] ?? clean;
  const words = first.split(" ");
  const nudge = words.slice(0, Math.max(6, Math.ceil(words.length * 0.45))).join(" ");
  return `Start here: ${nudge}…`;
}
