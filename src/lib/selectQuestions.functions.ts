import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  subject: z.string().min(1),
  topics: z.array(z.string()).default([]),
  difficulty: z.enum(["all", "easy", "medium", "hard"]).default("all"),
  need: z.number().int().min(1).max(20),
  avoid: z.array(z.string()).default([]),
});

export type TopUpQuestion = {
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

/**
 * Hybrid selector: the client always fills a paper from the local bank first
 * and only calls this when it is short of questions. Cached + throttled so a
 * burst of concurrent students collapses into very few upstream AI calls.
 */
export const topUpQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(
    async ({ data }): Promise<{ questions: TopUpQuestion[]; source: "ai" | "cache" | "none" }> => {
      const mod = await import("./selectQuestions.server");
      const key = mod.cacheKey(data);
      const cached = mod.readCache(key);
      if (cached) {
        return { questions: cached.map((q) => ({ ...q, subject: data.subject })), source: "cache" };
      }
      if (mod.throttled(data.subject)) return { questions: [], source: "none" };

      const items = await mod.generateTopUp(data);
      if (!items.length) return { questions: [], source: "none" };
      mod.writeCache(key, items);
      return { questions: items.map((q) => ({ ...q, subject: data.subject })), source: "ai" };
    },
  );
