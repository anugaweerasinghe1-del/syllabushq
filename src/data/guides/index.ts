import { PAST_PAPER_GUIDES } from "./past-papers";
import { STRATEGY_GUIDES } from "./strategy";
import { STUDY_GUIDES } from "./study";
import type { Guide } from "./types";

export * from "./types";

export const GUIDES: Guide[] = [...PAST_PAPER_GUIDES, ...STRATEGY_GUIDES, ...STUDY_GUIDES];

export const GUIDE_UPDATED = "2026-10-06";

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
