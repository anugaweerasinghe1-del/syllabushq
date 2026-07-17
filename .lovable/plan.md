
## Root-cause diagnosis of the 404 blocking final results

The practice flow finishes here:
```
finish() → navigate("/$subject/$topic/results", { topic: "mix" | <slug> })
```

`src/routes/$subject.$topic.results.tsx` loader does:
```ts
const topic = subject.topics.find((t) => t.slug === params.topic);
if (!topic) throw notFound();
```

`"mix"` is a **pseudo-topic** (used by the multi-topic practice picker) and never exists in `subject.topics`. It also does not use `resolveTopic`, so any drifted slug (case, alias, singular/plural) also 404s. This is why the user hits *"We couldn't find that topic"* right when trying to see their score.

Same issue exists in a couple of other places I want to sweep.

## Phase A-fix — 404 sweep (do first, small)

1. `src/routes/$subject.$topic.results.tsx` loader: mirror the practice route — accept `"mix"` as `{ slug: "mix", name: "Mixed topics" }`, use `resolveSubject` + `resolveTopic`, redirect on drift, add `notFoundComponent` + `errorComponent` using `NotFoundShell`.
2. Audit every `createFileRoute` under `/$subject/...` for the same anti-pattern; convert to `resolveSubject`/`resolveTopic` + mix support.
3. Make `NotFoundShell` show a "Return to results" CTA when session storage still has `ol-last-results` so a stray 404 never blocks the final score.

## Phase B — Hybrid AI question selection

New file `src/lib/selectQuestions.functions.ts` (`createServerFn`, `.inputValidator(zod)`, `.handler(...)`):

Pipeline:
1. Filter the local bank by `{subject, topics[], difficulty}`.
2. If `filtered.length >= count` → return a deterministic shuffle keyed by `{subject, topics, count, dayBucket}` (so 100 concurrent students get varied but reproducible papers, and the LRU cache hits).
3. If `filtered.length < count` → call Lovable AI Gateway:
   - Primary: `google/gemini-2.5-flash-lite`
   - Fallback 1: `google/gemini-flash-1.5-8b`
   - Fallback 2: `openai/gpt-5-nano`
   - Ask the model to *rank / dedupe / pad* from the existing bank first; only if still short, generate net-new MCQs in the same JSON schema.
4. In-memory LRU (`Map` capped at 200 entries, 10-min TTL) on the server function so the same setup for many students collapses to one call.
5. Hard budget guard: max 1 request per 3 s per subject, else fall back to local shuffle silently.

Client wiring:
- `practice.$mode.$subject.tsx` calls `selectQuestions(...)` via `useServerFn`, then hands the returned pool to `savePickedPool` + `startNew` unchanged.
- Same for `exam.short.$subject.tsx` and `exam.structured.$subject.tsx`.
- All local fallbacks preserved — the AI path is *additive*, never a hard dependency.

Expected free-tier cost: ~5 req/min under 100 concurrent students thanks to LRU + local-first.

## Phase D — Light editorial theme (full switch)

Rewrite `src/styles.css` tokens (keep names, flip values):
- `--bg: oklch(0.99 0 0)`, `--surface-1: #fff`, `--surface-2: oklch(0.97 0 0)`
- `--foreground: oklch(0.15 0 0)`, `--muted-foreground: oklch(0.45 0 0)`
- `--hairline: oklch(0.92 0 0)`, `--hairline-strong: oklch(0.82 0 0)`
- Accent kept (`--amber`, `--mint`, `--coral`) at slightly deeper values for AA contrast on white.
- Aurora background reduced to a soft cream gradient, opacity < 6%.
- `PremiumCard`, `SiteHeader`, `AmbientBackground`, `LoadingScreen`, `MathText` re-tinted (any hardcoded dark hex swapped for tokens).
- Verify AA contrast on body text, muted text, and hairline borders.

## Phase E — Homepage redesign (Apple-product-page cadence)

`src/routes/index.tsx` restructured to:
```
Nav (SiteHeader)
Hero            — headline + subhead + primary CTA (Start today's paper) + secondary (Browse practice)
Trust strip     — "Aligned with NIE syllabi · Trusted by X students"
Daily Question  — one editorial card
Modes           — 3-mode grid (MCQ · Timed exam · Structured)
Subjects        — 3-subject grid with topic counts
Streak / rings  — ActivityRings + StreakHeatmap side by side
For teachers    — pack builder teaser
Press strip     — case studies / reviews
Footer
```
Full-bleed sections, generous whitespace, single H1, semantic HTML, updated head metadata + og:image.

## Technical order in one build

1. Fix `$subject.$topic.results.tsx` + sibling audit (unblocks users NOW).
2. Add `selectQuestions.functions.ts` + wire the three setup routes.
3. Flip `src/styles.css` tokens; adjust the handful of components that hardcoded dark values.
4. Rewrite `src/routes/index.tsx`.
5. Build → check dev-server logs → fix any typecheck fallout → done.

## Files touched (approx)

- `src/routes/$subject.$topic.results.tsx` (fix)
- `src/components/NotFoundShell.tsx` (results-recovery CTA)
- `src/lib/selectQuestions.functions.ts` (new)
- `src/routes/practice.$mode.$subject.tsx`, `src/routes/exam.short.$subject.tsx`, `src/routes/exam.structured.$subject.tsx` (call AI picker)
- `src/styles.css` (theme flip)
- `src/components/PremiumCard.tsx`, `AmbientBackground.tsx`, `SiteHeader.tsx`, `LoadingScreen.tsx`, `MathText.tsx` (token cleanup)
- `src/routes/index.tsx` (homepage rewrite)
- `src/routes/__root.tsx` (metadata refresh)

Approve and I'll ship all four in one pass.
