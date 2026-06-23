import { createGoogleGenerativeAI } from "@ai-sdk/google";

// User-provided free-tier Google AI Studio key. Server-only.
let _provider: ReturnType<typeof createGoogleGenerativeAI> | null = null;

export function googleAi() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error("GOOGLE_AI_API_KEY is not configured");
  if (!_provider) _provider = createGoogleGenerativeAI({ apiKey: key });
  return _provider;
}

// Free-tier friendly defaults.
export const FAST_MODEL = "gemini-2.5-flash-lite";
export const SMART_MODEL = "gemini-2.5-flash";