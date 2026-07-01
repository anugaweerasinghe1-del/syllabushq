## Scope (this plan only)

You picked **Stability + domain swap** with the **Editorial Minimal** aesthetic. UI redesign, content/exam-correctness audit, and the competitor/SEO teardown will each be their own follow-up plan so nothing ships half-done.

## 1. Domain swap → `https://app.syllabushq.workers.dev`

Repoint every hardcoded reference in one pass. Files touched:

- `public/robots.txt` — update `Sitemap:` line
- `src/routes/sitemap[.]xml.ts` — `BASE_URL`
- `src/routes/index.tsx`, `practice.index.tsx`, `structured.tsx`, `reviews.tsx`, `suggest.tsx`, `learn.$subject.$topic.$slug.tsx` — canonical, `og:url`, JSON-LD `url` fields
- `src/routes/__root.tsx` — any absolute references (og:site_name is fine, but if og:url is set here, swap it)
- Add a single `src/lib/site.ts` exporting `SITE_URL = "https://app.syllabushq.workers.dev"` and refactor call-sites to import it, so we never drift again.

Also update `.lovable/plan.md` note only if it references the domain (docs, not code).

Not touched: `syllabushq.lovable.app` in Lovable's own hosting DNS — that's platform-side. We only control what the app emits.  
  
EXTRA: ADD THE LOGO THROUGHOUT THE ENTIRE SITE!

## 2. Stability & "Topic not found" fixes

Global scrutiny of the resolver + every route that can 404:

- **Audit `src/data/subjects.json` vs `src/data/questions.json**` — dump every distinct `(subject, topic)` pair in questions and diff against the subjects list. Any orphan topic (question refers to a topic slug that isn't in subjects.json, or vice versa) is a guaranteed "Topic not found". Add the missing slugs to subjects.json OR remap the questions, whichever preserves content.
- **Extend `TOPIC_ALIASES**` in `src/lib/content.ts` with every drifted slug found in the audit, so old shared links keep resolving.
- **Fix wrong exam structures** in `src/lib/paper-structures.ts` — verified count/mark per NIE spec:
  - Maths Paper I: Part A = 25×2, Part B = answer 5 of 10 ×10 ✓ (keep)
  - Maths Paper II: confirm Part B is 5 of 10 (not 5 of 7 as currently)
  - Science Paper II: confirm Part A = 4 structured of 6 (not "all 10 × 7")
  - Business Paper II: confirm section counts against 2023/2024 papers
  - I'll cross-check against the NIE syllabus PDFs already in the project and fix any that are wrong.
- **Every route with a `loader` gets a `notFoundComponent` + `errorComponent**` using `NotFoundShell`, not the generic root 404. Currently only `$subject.$topic.tsx` has it — extend to `$subject.tsx`, `$subject.index.tsx`, `$subject.$topic.index.tsx`, `$subject.$topic.practice.tsx`, `practice.$mode.tsx`, `practice.$mode.$subject.tsx`, `exam.short.$subject.tsx`, `exam.structured.$subject.tsx`, `learn.$subject.$topic.$slug.tsx`.
- **Kill the "glitch"** — audit any remaining `Math.random()` at render time in question-picking paths; if found, move to session-seeded `pickQuestions`.
- **Run `bun run build` and `tsgo` after each batch** to keep the tree green.

## 3. Editorial-minimal design pass (light-touch — full redesign is the next plan)

Just enough to make the site look coherent with the chosen palette so nothing looks broken while the deeper redesign lands next turn:

- Update `src/styles.css` tokens:
  - `--background: #0a0a0a`
  - `--foreground: #f5f5f4`
  - `--muted: #292524`
  - `--accent: #c9a961` (warm brass)
  - Retire aurora orb colors from `AmbientBackground` — replace with a single subtle vignette + grain, editorial not gamer.
- Keep Instrument Serif for display, Inter for body (already loaded).
- Remove `animate-pulse-glow` on the "Begin Exam" button (feels cheap for editorial); replace with a simple hairline hover.
- No layout rewrites yet — that's the next plan.

## 4. Verification

- `bun run build` clean
- Grep `syllabushq.lovable.app` returns zero matches
- Manually visit `/`, `/practice`, `/mathematics`, `/mathematics/algebra`, `/reviews`, `/sitemap.xml` in the sandbox preview via Playwright to confirm no "Topic not found" and canonicals point at workers.dev.

## What's NOT in this plan (queued for follow-up)

1. Full editorial redesign of every page (hero, practice setup, exam shell, results, structured runtime, reviews, suggest).
2. Deep competitor teardown (SaveMyExams, Tutopiya, e-thaksalawa, pastpapers.wiki) + programmatic SEO landing pages + schema/internal-linking pass to actually rank page 1 in LK.
3. Content depth audit: question quality, syllabus coverage per sub-topic, AI-marked past-paper walkthroughs, model-answer library.

Say "go" and I'll execute this plan; the next two follow-up plans will land right after.