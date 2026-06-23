## Goal

Transform SyllabusHQ into a premium AI-graded exam ecosystem for Sri Lankan GCSE O/L students — focused first on **Business & Accounting** and **Science (Combined)** — with on-the-fly original paper generation, AI marking against schemes, Apple-grade UI, retention loops, and ~500 programmatic SEO landing pages.

## Phase 1 — AI Engineering

**Bring-your-own free key.** I'll request `GOOGLE_AI_API_KEY` (Google AI Studio — free Gemini 2.5 Flash tier, 1500 req/day). One server-side helper `src/lib/ai-gateway.server.ts` wraps it via the AI SDK's `@ai-sdk/google` provider so we can hot-swap later.

**Real-time AI Grading (`gradeAnswer.functions.ts`)**
- Input: `{ question, studentAnswer, markingScheme, totalMarks, subject }`
- Returns structured JSON via AI SDK `Output.object`: `{ marksAwarded, breakdown[{point,awarded,evidence}], misconceptions[], modelAnswer, nextStepHint }`
- System prompt enforces Cambridge/Edexcel-style marking: award per scheme point, no double-credit, accept synonyms.
- Streams partial feedback for perceived speed.

**Original Paper Generation (`generatePaper.functions.ts`)**
- Templates per subject in `src/data/paper-templates/`: each declares exact Paper 1 / Paper 2 structure (item count, marks, command words, topic distribution).
  - Business Paper 1: 40 MCQ × 1 mark
  - Business Paper 2: 5 structured (4–10 marks) + 1 case study
  - Science Paper 1: 40 MCQ
  - Science Paper 2: structured short + extended response
- Generator calls Gemini with template + topic + difficulty + seed → returns LaTeX-rendered, scheme-attached questions.
- **Cache layer**: hash(template+topic+difficulty+seed) → Lovable Cloud `generated_questions` table. Reuse on repeat, regenerate on miss. Keeps cost near zero and load instant.
- Originality guard: prompt rewrites in own words, randomized names/numbers, banned-phrases list.

**Math notation**: keep existing KaTeX `<MathText>`. Force generator to emit `$...$` / `$$...$$`. Add post-processor to validate.

## Phase 2 — UI/UX (Apple Standard)

**Style guide additions to `src/styles.css`**
- Palette (dark luxe + light counterpart):
  - bg `#07080B` / fg `#F5F5F7`
  - surface glass `rgba(255,255,255,0.04)` + `backdrop-blur-2xl` + 1px `rgba(255,255,255,0.08)` border
  - accent platinum `#C9CDD4`, focus glow `oklch(0.78 0.05 250)`
  - subject hues: Business `#D4AF37`, Science `#5BC0BE`, Math `#9D8DF1`
- Typography: keep `Instrument Serif` display, swap UI to **Geist Sans** + `Geist Mono` for marks/timer.
- Motion tokens: ease `cubic-bezier(0.22, 1, 0.36, 1)`, durations 180/280/420ms. Page transitions via `framer-motion` (`AnimatePresence`, `layoutId` on cards).
- Parallax: lightweight scroll-linked transforms on landing hero (no library — `useScroll` from framer-motion already installed).

**Topic selection (Step 3) redesign**
- 12-col responsive grid, glass cards with subject-tinted icon, hover lift + glow, multi-select chips, "Mix all" hero card spans 2 columns. Icons from `lucide-react`.

**Global polish pass**
- Buttons → unified `<GlowButton>` variants (primary/ghost/destructive).
- Inputs/textareas → frosted with focus ring.
- Loading screens use existing premium loader; add skeleton glassmorphism.

## Phase 3 — Retention

- **Zeigarnik resume**: home shows "Continue exam — Q14/40" card if `localStorage` has an incomplete session. Pulse animation, dismissable.
- **Apple-style progress rings**: 3 concentric rings (Daily questions / Accuracy / Streak) on home + results. Pure SVG component `<ActivityRings>`.
- **Mastery badges**: per topic accuracy ≥ 80% over ≥20 questions unlocks Bronze/Silver/Gold. Stored in `mastery` table. Subtle reveal animation on unlock.
- Keep 24h honest streak; redesign visualization to a minimalist 12-week heatmap with platinum cells.

**Copywriting rewrite (delivered in landing route)**
- Hero: "Mastery, measured." / sub: "AI-graded O/L practice papers. Original questions. Instant feedback. Built for Sri Lanka's sharpest."
- Three pillars: *Marked like a chief examiner.* / *Papers that never repeat.* / *Progress you can feel.*
- CTA: "Begin a paper" (not "Start practice").

## Phase 4 — Programmatic SEO (~500 pages)

Matrix: `subjects(2) × topics(~10 each) × difficulty(3) × cities(8 SL cities: Colombo, Kandy, Galle, Jaffna, Negombo, Matara, Kurunegala, Anuradhapura)` ≈ 480 pages.

- New dynamic route: `src/routes/learn.$subject.$topic.$slug.tsx` where slug encodes difficulty/city.
- Static generation list built from `src/data/seo-matrix.ts`.
- Each page renders: H1 (e.g. "Best Accounting Practice for O/L Students in Colombo"), 3 AI-pre-rendered original sample questions with worked solutions, study tips, FAQ schema, internal links to sibling topics + CTA to launch generator.
- Replace static `public/sitemap.xml` with **dynamic** `src/routes/sitemap[.]xml.ts` enumerating the matrix.
- `robots.txt` keeps `Allow: /` + Sitemap directive.
- JSON-LD: `EducationalOccupationalProgram` + `FAQPage` + `BreadcrumbList` per page.
- Per-route `head()` with unique title/description/canonical/og:url (no shared metadata).

## Logic Flow — AI Marking & Paper Generation

```text
[Setup Wizard] -> generatePaper({subject, paper, topics, difficulty, count, seed})
   |                |
   |                v
   |        hash() -> cache hit? -> return cached paper
   |                |  miss
   |                v
   |        Gemini (template + constraints) -> validate + cache -> return
   v
[Exam Runtime] each answer -> gradeAnswer({question, scheme, studentAnswer})
                              -> stream JSON marks + feedback
                              -> persist attempt -> update mastery
                              v
[Results] aggregate -> recommendations + ring animations + badge unlocks
```

## Technical Notes

- Stack stays: TanStack Start + Tailwind v4 + Lovable Cloud (Supabase) + KaTeX + framer-motion + lucide.
- New deps: `@ai-sdk/google`, `ai` (already), `@fontsource/geist-sans`, `@fontsource/geist-mono`.
- New tables (migration): `generated_questions(hash pk, subject, payload jsonb, created_at)`, `attempts(id, user_visitor, question_id, marks_awarded, total, created_at)`, `mastery(visitor, subject, topic, accuracy, attempts, tier)`. RLS + grants per project rules. Visitor-anon scoped (no auth in this pass).
- Secret: request `GOOGLE_AI_API_KEY` from user after plan approval.
- Image generation deferred — no OG images this pass to avoid placeholder penalty.

## Out of Scope (flagged)

- User accounts/login (still anonymous via `visitor.ts`).
- Math subject AI generator (templates exist but not prioritized this pass — kept on existing static bank).
- Local LLM / Ollama (not viable in production).

## Deliverable order on approval

1. Request `GOOGLE_AI_API_KEY` + provision migration & secrets.
2. AI gateway helper + `gradeAnswer` + `generatePaper` server fns with cache.
3. Style tokens + GlowButton/Glass primitives + redesigned topic picker.
4. ActivityRings + Zeigarnik resume + mastery badges.
5. Landing copy rewrite + parallax hero.
6. SEO matrix + dynamic routes + dynamic sitemap.
