import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { googleAi, FAST_MODEL } from "./ai-gateway.server";

/**
 * Returns ONE short Socratic hint for a question — never the answer.
 * Free-tier friendly: ~80 tokens out, fast model.
 */
export const getHint = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      subject: z.string().max(64),
      topic: z.string().max(64),
      question: z.string().min(1).max(2000),
      options: z.array(z.string()).max(8).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const provider = googleAi();
    const prompt = [
      "You are a Sri Lankan G.C.E. O/L tutor.",
      `Subject: ${data.subject}. Topic: ${data.topic}.`,
      "Give ONE short Socratic hint (≤ 28 words) that nudges the student toward the answer without revealing it.",
      "Do NOT name the correct option. Do NOT solve the question. Use plain English.",
      "",
      `Question: ${data.question}`,
      data.options?.length ? `Options: ${data.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(" | ")}` : "",
    ].join("\n");

    const { text } = await generateText({
      model: provider(FAST_MODEL),
      prompt,
      temperature: 0.4,
    });
    return { hint: text.trim().slice(0, 240) };
  });