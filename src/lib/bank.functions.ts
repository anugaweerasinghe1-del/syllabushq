import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { BankItem } from "./bank-types";

const Input = z.object({
  mode: z.enum(["mcq", "short", "structured"]),
  subject: z.string().min(1),
  topics: z.array(z.string()).default([]),
  difficulty: z.string().default("all"),
  need: z.number().int().min(1).max(30),
  avoid: z.array(z.string()).default([]),
});

export type EnsureResult = {
  items: BankItem[];
  source: "bank" | "ai" | "mixed" | "none";
};

/**
 * Self-growing question supply.
 *  1. read anything already saved in the shared bank
 *  2. generate the shortfall with AI (free tier)
 *  3. persist it so the next student gets it instantly
 * Never throws — the caller always keeps its local-JSON paper as a fallback.
 */
export const ensureQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<EnsureResult> => {
    const bank = await import("./bank.server");
    let items = await bank.readBank({
      mode: data.mode,
      subject: data.subject,
      topics: data.topics,
      difficulty: data.difficulty,
      limit: data.need,
    });

    const fromBank = items.length;
    if (fromBank >= data.need) {
      return { items: items.slice(0, data.need), source: "bank" };
    }

    const key = `${data.mode}:${data.subject}`;
    if (bank.throttled(key)) {
      return { items, source: fromBank ? "bank" : "none" };
    }

    try {
      const fresh = await bank.generate({
        mode: data.mode,
        subject: data.subject,
        topics: data.topics,
        difficulty: data.difficulty,
        need: data.need - fromBank,
        avoid: data.avoid,
      });
      if (fresh.length) {
        await bank.writeBank(data.mode, data.subject, data.difficulty, fresh);
        items = [...items, ...fresh];
        return { items: items.slice(0, data.need), source: fromBank ? "mixed" : "ai" };
      }
    } catch {
      /* fall through to whatever the bank had */
    }
    return { items, source: fromBank ? "bank" : "none" };
  });
