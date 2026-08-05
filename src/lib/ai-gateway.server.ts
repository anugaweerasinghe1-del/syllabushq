import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

// User-provided free-tier Google AI Studio key. Server-only.
let _provider: ReturnType<typeof createGoogleGenerativeAI> | null = null;
let _gateway: ReturnType<typeof createOpenAICompatible> | null = null;

export function googleAi() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error("GOOGLE_AI_API_KEY is not configured");
  if (!_provider) _provider = createGoogleGenerativeAI({ apiKey: key });
  return _provider;
}

/**
 * Second free pool: the Lovable AI Gateway. Used only when the Google
 * free-tier key errors or hits its daily quota, roughly doubling the
 * number of AI actions the site can serve in a day.
 */
export function lovableAi() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  if (!_gateway)
    _gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
    });
  return _gateway;
}

// Free-tier friendly defaults.
export const FAST_MODEL = "gemini-2.5-flash-lite";
export const SMART_MODEL = "gemini-2.5-flash";

const GATEWAY_FAST = "google/gemini-2.5-flash-lite";
const GATEWAY_SMART = "google/gemini-2.5-flash";

/**
 * Ordered list of models to try for one AI action. Google free tier first,
 * Lovable AI Gateway second. Callers loop and use the first that succeeds.
 */
export function modelChain(kind: "fast" | "smart" = "fast"): LanguageModel[] {
  const out: LanguageModel[] = [];
  if (process.env.GOOGLE_AI_API_KEY) {
    const g = googleAi();
    out.push(g(kind === "fast" ? FAST_MODEL : SMART_MODEL));
    if (kind === "fast") out.push(g(SMART_MODEL));
  }
  if (process.env.LOVABLE_API_KEY) {
    const l = lovableAi();
    out.push(l(kind === "fast" ? GATEWAY_FAST : GATEWAY_SMART));
  }
  return out;
}

/** Run `fn` against each model in the chain until one succeeds. */
export async function withModels<T>(
  kind: "fast" | "smart",
  fn: (model: LanguageModel) => Promise<T>,
): Promise<T> {
  const chain = modelChain(kind);
  if (!chain.length) throw new Error("No AI provider configured");
  let last: unknown;
  for (const model of chain) {
    try {
      return await fn(model);
    } catch (err) {
      last = err;
      console.warn("[ai] model failed, trying next:", err);
    }
  }
  throw last instanceof Error ? last : new Error("All AI providers failed");
}
