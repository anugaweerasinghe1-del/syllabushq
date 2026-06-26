# SyllabusHQ Overhaul — Analysis + Build Plan

Per your instruction, **Section A is the brutal analysis you asked to review first**. Sections B–F are the build plan I will only start after you confirm A (and answer the 3 questions at the bottom).

---

## A. Brutal competitor + retention analysis (no sycophancy)

Benchmarks: **savemyexams.com**, **physicsandmathstutor.com**, **tutopiya.com**, **senior.lk**, **Khan Academy**, **Quizlet**.

**Where SyllabusHQ currently loses:**

1. **Trust collapses on first click.** "Topic not found" fires from at least 5 routes (`$subject.$topic.*`, `exam.structured.$subject`, etc.) because topic slugs in the question bank don't match the slugs the cards link to. A student who hits this on question 1 never comes back. This is the single biggest retention leak — bigger than any design issue.
2. **No "why am I here today" loop.** SaveMyExams hooks users with topic-question-mark-scheme in 3 clicks. We force a 4-step setup wizard before a single question appears. Friction kills daily return.
3. **No proof of progress.** Streak exists but there's no XP, no per-topic mastery %, no "you're 62% ready for Paper 1" signal. Students grind only when they can see the bar move.
4. **Content depth is shallow vs claim.** ~325 MCQs across 3 subjects ≈ 12 questions per sub-topic. SaveMyExams ships 60–150 per sub-topic. Claim of "pass O/L using only this site" is not yet defensible.
5. **No spaced repetition / wrong-answer queue.** Every top competitor re-surfaces missed questions. We throw results away after the session.
6. **No social proof on landing.** Reviews tab is buried. Tradinghq-style hero shows live numbers ("12,438 questions answered today") — we show nothing.
7. **SEO surface is thin.** Programmatic `/learn/...` pages exist but aren't internally linked from subject hubs, so Google won't crawl them deeply.

**5 retention levers I will build (ranked by ROI):**

1. **Daily Question hero on `/**` — one curated question, streak-eligible only if attempted. Single biggest re-open driver.
2. **Per-topic mastery rings** (0–100%) computed from last 10 attempts. Visible on every subject hub.
3. **Wrong-answer queue** auto-built from every session; surfaced as "Fix 7 mistakes" CTA.
4. **Exam-readiness score** per subject (weighted by topic coverage × accuracy × recency) shown as the headline number.
5. **Streak freeze (1/week)** + milestone badges (7/30/100 days). Loss aversion > gain motivation.

---

## B. Critical bug fixes (Phase 1, blocking)

- Audit every `notFound()` call site listed above. Root cause is slug mismatch between `subjects.json` topic slugs and `questions.json` `topic` field. Fix: normalize both at load time via a single `resolveTopic(subjectSlug, topicSlug)` helper in `src/lib/content.ts` with fuzzy fallback (slugify + case-insensitive + alias map for renamed topics).
- Replace bare `notFound()` UI with a branded `<NotFoundShell>` (glass card, "Browse topics" CTA, related-topic suggestions) — keeps users in funnel.
- Add a route-level `errorComponent` on every dynamic route + a top-level error boundary in `__root.tsx` so a thrown error never blanks the screen.

## C. Model Answers + Rate-Limited Hints (Phase 2)

- `<ModelAnswerToggle>` component, collapsed by default, framer-style height+opacity transition. Lives in MCQ runner, short-answer runner, structured runner.
- `<HintButton>` with 4/24h rolling-window quota stored in `localStorage` under `hints:v1` as `{ timestamps: number[] }`. On click: prune > 24h, check length < 4, reveal next hint, push timestamp. Server-generated hints (one-shot via Lovable AI Gateway, cached per question id in IndexedDB so repeat views are free). When exhausted: show countdown to oldest-timestamp + 24h.

## D. Content expansion to 100+ per sub-topic (Phase 3)

- Run a one-time build script (`scripts/generate-bank.ts`) using Lovable AI Gateway (`google/gemini-3-flash-preview`) that, per sub-topic, generates batches of 25 until ≥100 exist, with strict JSON schema (subject, topic, sub-topic, difficulty, paper-style tag, question, options, answer, explanation, marking-points). Diversified across Easy/Medium/Hard buckets (40/40/20).
- Output written to `public/questions.json` (chunked per subject to keep payloads small: `public/banks/<subject>.json` lazy-loaded by route).
- Strict syllabus guardrail: prompt is grounded in the Sri Lankan NIE O/L syllabus text already attached, with explicit "reject Cambridge/Edexcel phrasing" instruction.

## E. Apple-grade redesign (Phase 4)

- Tokens in `src/styles.css`: deeper graphite base (`oklch(0.14 0.01 250)`), 1px hairline borders via `color-mix`, glass surfaces (`backdrop-blur-2xl bg-white/[0.03]`), accent gradient reserved for primary CTAs only.
- New `<GlassCard>`, `<HairlineDivider>`, `<ParallaxHero>` primitives.
- Homepage rebuilt to tradinghq cadence: oversized serif headline, live counter strip, Daily Question card, 3-subject grid, social-proof rail, footer. No purple, no generic gradients.
- Page transitions via `motion/react` (already viable) — fade+8px rise, 220ms, respecting `prefers-reduced-motion`.
- Performance budget: keep route JS < 180KB gz; lazy-load KaTeX and question banks.

## F. Programmatic SEO (Phase 5)

- 20 landing pages at `/learn/<subject>/<topic>/<slug>` targeting low-comp Sri Lankan O/L queries (I'll pull volume via the semrush tool before generating). Each page: H1 + 600-word topical primer + 5 example questions with worked solutions + internal links to 3 sibling topics + JSON-LD `LearningResource`.
- Internal linking: subject hub lists every sub-topic with link; sitemap.xml regenerated.
- Per-route `head()` with unique title/description/og — no template duplication.

---

## Technical sketch

```text
src/lib/content.ts          ← resolveTopic() + alias map, fuzzy fallback
src/lib/hints.ts            ← 4/24h quota, localStorage + IndexedDB cache
src/lib/mastery.ts          ← per-topic rolling accuracy
src/components/
  NotFoundShell.tsx
  ModelAnswerToggle.tsx
  HintButton.tsx
  GlassCard.tsx
  DailyQuestion.tsx
  MasteryRing.tsx
scripts/generate-bank.ts    ← one-shot AI bank expansion (build-time only)
public/banks/<subject>.json ← chunked lazy-loaded banks
src/routes/learn.$subject.$topic.$slug.tsx  ← upgraded SEO template
```

No live AI calls on the deployed app except the hint generator (cached per question, hard-rate-limited client-side).

---

## Before I build — 3 questions

1. **Hints — AI-generated or hand-authored?** AI-generated (cheap, scales to every question, cached) is my default. Hand-authored = higher quality but only on questions we curate.
2. **Content regeneration scope.** Full expansion to ~100/sub-topic across all 3 subjects is ~30–45 min of AI Gateway calls and will consume credits. OK to proceed, or cap at e.g. 50/sub-topic first?
3. **Daily Question source.** Rotate deterministically from existing bank (free, instant), or AI-curate a fresh one daily server-side (richer, costs credits)?

Confirm A + answer 1–3 and I'll execute B→F in order.  
  
1) AI generated  
2) Cap at 60 sub-topics first  
3) AI-curate a fresh one daily server-side   
IMPORTANT: ensure everything can be done for 100% free