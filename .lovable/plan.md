## Notes before we start

- **AI key**: I'll use Lovable's built-in AI Gateway (`google/gemini-3-flash-preview`) for Phase 0 — no need for the Gemini key you pasted. For safety, please rotate that key on Google AI Studio since it's now in chat history.
- **Syllabi mapping**: You uploaded 6 PDFs. I'll treat them as:
  - Mathematics → `mathsgr.9.pdf` + `mathspaper1.pdf` + `Practicing_Paper_Grade11_Eng math.pdf` (syllabus scope + format reference)
  - Science → `sci.gr.11.pdf` + `science teachers guide gr.10.pdf`
  - Business & Accounting Studies → `bsgr.11.pdf`
- **Stack**: TanStack Start, Tailwind v4, no backend, no auth, localStorage-only. Tailwind default breakpoints.
- **Data contract** (locked so swaps are code-free):
  - `public/questions.json` — array of `{ subject, topic, question, options[4], correct, explanation }`
  - `public/subjects.json` — `[{ slug, name, topics: [{ slug, name }] }]`
  - Loaders read these as static fetches; topics and subjects render dynamically from whatever's in the files.

---

## Phase 0 — Content generation (one-time build script)

Goal: produce `public/questions.json` with ≥100 original MCQs per subject, covering the full syllabus, matched to Sri Lankan O/L difficulty and phrasing.

1. Write a Node script at `scripts/generate-questions.ts` (not shipped to client).
2. Parse each syllabus PDF to extract the topic list per subject (pdf-parse).
3. For each subject, iterate topics and call Lovable AI Gateway (`google/gemini-3-flash-preview`) in batches of ~10 questions per topic with a strict JSON-schema prompt:
   - Original questions only (no reproduction/close paraphrase of past papers).
   - 4 options, exactly one correct, short explanation.
   - Distribute across all topics until ≥100 per subject.
4. Validate every item (shape, option count, correct index in 0–3, no duplicates by question text).
5. Write merged array to `public/questions.json`.
6. Also write `public/subjects.json` derived from the extracted topic lists.
7. Run once, commit outputs, then stop. No runtime AI calls in the deployed app.

Stop after Phase 0 and show counts per subject/topic for your approval before Phase 1.

---

## Phase 1 — Scaffold + Home

- Initialize design tokens in `src/styles.css` (Ink, Marigold, Paper, Charcoal, Sage, Clay).
- Load fonts via `<link>` in `__root.tsx`: Space Grotesk (headings), Inter (body), JetBrains Mono (numerals).
- Routes: `/` (home), `__root` head/meta defaults.
- Home page:
  - Hero with tagline and short value prop.
  - **Streak heatmap** (GitHub-style, last ~20 weeks) reading `localStorage` activity log; Marigold intensity scale.
  - Current streak + longest streak in JetBrains Mono.
  - Subject grid (3 cards) generated from `subjects.json`.
- Data layer: a tiny `lib/content.ts` that fetches and caches `subjects.json` / `questions.json` (TanStack Query).
- Streak utility: `lib/streak.ts` (record day, compute current/longest, build heatmap matrix).

---

## Phase 2 — Subject + Topic browsing

- Route `/$subject` — lists topics from `subjects.json`, shows per-topic question count from `questions.json`.
- Route `/$subject/$topic` — topic landing with "Start practice" CTA, short topic blurb, recent score (from localStorage).
- 404 + error boundaries wired per TanStack route rules.

---

## Phase 3 — Quiz engine

- Route `/$subject/$topic/practice`.
- Pick 10 random questions for the topic (deterministic per session, reshuffle on retry).
- One question at a time: 4 options, immediate feedback (Sage/Clay), explanation panel, "Next" button.
- Progress bar + question counter.
- Keyboard support (1–4, Enter).
- Persist in-progress state to localStorage so refresh resumes.

---

## Phase 4 — Results + streak update

- Route `/$subject/$topic/results` (state passed via router/localStorage).
- Score, %, time, per-question review list (your answer vs correct + explanation).
- Marks today as active in streak log; updates current/longest.
- CTAs: "Retry topic", "Pick another topic", "Back to subject".

---

## Phase 5 — Mobile responsiveness pass

- Audit Home, Subject, Topic, Quiz, Results on `sm`/`md`/`lg`/`xl` defaults only.
- Tap targets ≥44px, sticky question footer on mobile, heatmap horizontal scroll on `< sm`.

---

## Phase 6 — SEO pass

- Per-route `head()` with unique title + meta description for `/`, each `/$subject`, each `/$subject/$topic` (derived from data).
- JSON-LD: `EducationalOrganization` on home, `Quiz` / `LearningResource` on topic pages.
- FAQ block on each subject page (common O/L questions) with `FAQPage` JSON-LD.
- `public/robots.txt`, `public/llms.txt`, and a generated `public/sitemap.xml` script that walks `subjects.json`.
- Single H1 per page, semantic landmarks, alt text on any imagery, canonical tags.

---

## Deliverables checkpoint after each phase

I'll stop at the end of each phase so you can review before I continue. Approve this plan and I'll begin with Phase 0.
