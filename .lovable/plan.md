## SyllabusHQ v2 — Sri Lankan O/L Mastery Platform

A focused rebuild of content, marking, layout, and SEO so a student can pass O/L using this site alone — dark Apple-startup aesthetic, NIE-locked content, AI marking with strict-but-fair rubric grading.

---

### 1. Content foundation (NIE syllabus lock)

Build a **typed question-bank** under `src/data/bank/` per subject:

```text
bank/
  maths/         (Grade 10 + 11 NIE units)
  science/       (Bio, Chem, Phys, Earth strands)
  business-accounting/  (BS units + Accounting units)
```

Each topic file exports `{ mcq[], short[], structured[], essay[] }` with `difficulty: 'easy'|'medium'|'hard'`, `marks`, `markingScheme[]` (point-by-point), `acceptableAlternatives[]`, `medium: 'english'|'sinhala'|'tamil'`. Sourced/paraphrased from NIE syllabus + Dept. of Examinations past paper *structures* — no verbatim copies. Seed ~60 questions per topic (20 per difficulty), enough for the bank-first strategy.

A `generatePaper()` server fn samples from the bank first, only calling Gemini to top up when the bank can't supply diversity (cached into `generated_questions`). This kills the "MCQ-only full exam" bug.

### 2. Exam structures (replica of paper format)

`src/data/paper-structures/` defines the exact O/L structure per subject. Examples:

- **Maths Paper 1:** 25 short-answer (2 marks ea) — first 1hr, no calculator section noted.
- **Maths Paper 2:** Part A (5 structured ×10) + Part B (choose 5 of 7 essays ×12).
- **Science Paper 1:** 40 MCQ (1 mark).
- **Science Paper 2:** 10 structured + 2 essays.
- **Business & Accounting Paper 1:** 40 MCQ. **Paper 2:** structured + accounting problem (trial balance, trading/P&L, balance sheet).

Full exam simulation pulls the exact mix from these structures — never MCQ-only.

### 3. AI marking (strict-rubric, BYO Gemini key)

- New `secrets--add_secret` for `USER_GEMINI_API_KEY` (user provides their free AI Studio key; falls back to project `GOOGLE_AI_API_KEY`).
- `gradeAnswer.functions.ts` rewritten with a Cambridge-style **per-marking-point** rubric. System prompt: "Award the mark if the candidate's idea matches the marking point — even if wording differs, spelling is imperfect, or method is described in words. Do not penalise missing diagrams when the method is correctly described. Do NOT use self-grading."
- Returns `{ pointsAwarded: [{point, awarded, evidence}], totalMarks, modelAnswer, examinerNote, nextStep }`.
- Works for short, structured, **and essay** answers across all subjects. Accounting answers parse numeric ledger lines.
- Removes the existing "self-score" path entirely.

### 4. Structured paper UX (draw-free)

New `<StructuredQuestionCard>` with two input modes per question:

1. **Describe** — textarea with explicit helper: *"You don't need to draw. Describe your graph/diagram (axes, points, shape, trend) or explain your working in words — full marks if the reasoning is correct."*
2. **Photo** — optional image upload; Gemini Vision marks handwritten work via multimodal call.

Cleaner layout: question | scratch area | answer area in vertical stack, monospace for numeric work, KaTeX live-preview for math.

### 5. Topic selection redesign

Replace the current long chip rail (the "cheap reference image line") with a polished **Command-K style picker** + grouped accordion:

```text
[ Subject ▾ ]  [ Strand ▾ ]  [ Difficulty: ●●○ ]  [ # Questions: 20 ]
            ▼
  ⌘K search… "photosynthesis"
  ▸ Biology · Life Processes  (12)
  ▸ Biology · Ecosystems       (8)
```

- shadcn `Command` + `Accordion` + `Popover`.
- Multi-select with token chips, "Select all in strand", "Balanced mix" toggle (equal split per topic — fixes the "mix only has 100+ of everything" complaint).
- Mobile: full-screen sheet variant.

### 6. Timer (works everywhere)

Single `useExamTimer(durationSec, onExpire)` hook + `<ExamTimer>` component wired into **every** mode (practice, short, structured, full sim). Persists to `sessionStorage` so refresh doesn't reset. Auto-submits + locks inputs on expiry. Visible glass pill, color shift at <5min, <1min.

### 7. Balanced question distribution

`pickQuestions({ topics, count, difficulty, balanced })`:

- `balanced: true` → `Math.floor(count / topics.length)` per topic, remainder spread round-robin.
- Difficulty selector "Mix" → equal easy/med/hard split.
- Bank-first; only top up via AI when bank can't fulfil the slice.
- Applies to all 3 subjects.

### 8. Programmatic SEO — quality > quantity (~150 pages)

Three high-intent clusters, each page hand-templated with **real value** (notes + 3 worked examples + try-now CTA + FAQ schema):

**Cluster A — Model papers (~30 pages)**
`/o-level/{subject}/model-paper-2026` and `/{subject}/marking-scheme-2026`. High annual search, low competition.

**Cluster B — Topic short notes (~80 pages)**
`/o-level/{subject}/{topic}-short-notes-sinhala-medium` and `…-english-medium`. Long-tail study intent.

**Cluster C — District landing (~40 pages)**
`/o-level-tuition/{subject}/{district}` for Colombo, Kandy, Jaffna, Galle, Matara, Kurunegala, Negombo, Anuradhapura. Near-zero competition, geographic intent.

Each page: unique `<title>` <60ch + meta desc <160ch, H1, JSON-LD (`LearningResource` / `FAQPage` / `LocalBusiness`), internal links to practice routes, OG image derived from subject token. Sitemap.xml regenerates from the matrix. Removes thin auto-pages from prior 480-page approach.

### 9. UI/UX premium polish (dark Apple-startup)

- **Palette:** `#07080B` bg, `#0E1014` surface, `#F5F5F7` text, platinum `#C9CDD4`, restrained subject accents.
- **Type:** Geist Sans + Geist Mono; tight tracking on hero, generous line-height in notes.
- **Components:** glass cards with `backdrop-blur-xl bg-white/[0.03] border-white/[0.06]`, `<GlowButton>` w/ subtle radial sheen, frosted inputs, skeletons matching glass.
- **Motion:** Motion-for-React, 180/280/420ms cubic-bezier easing, parallax hero, soft entry stagger.
- **Header:** monogram + thin separator, no shouting.
- **Removes** the current thin progress-bar artefact under "Number of questions" (replaced with proper slider + numeric chip).
- **Activity rings + Zeigarnik resume + Mastery badges** kept, restyled to match.

### 10. Database additions

Migration adds:

- `attempts.answer_text`, `attempts.ai_feedback jsonb`, `attempts.medium`.
- `bank_overrides` (admin-curated corrections, optional).
- Index on `(visitor_token, subject, created_at desc)` for resume.

All RLS preserved (anon insert/select on `attempts`/`mastery`).

---

### Build order

1. Secrets prompt → `USER_GEMINI_API_KEY` (optional override).
2. Question-bank scaffolding + seed first 3 topics per subject (proof of pattern).
3. `pickQuestions` + balanced sampler + paper-structure runner → fix full-sim MCQ bug + timer everywhere.
4. New `gradeAnswer` (rubric-strict, multimodal-ready) + structured-paper UX with describe/photo modes.
5. Topic Command-K picker + slider + premium polish pass.
6. SEO matrix v2 (~150 pages, three clusters) + dynamic sitemap regen.
7. Activity rings/Zeigarnik restyle + mastery badge surfaces.

### Technical notes

- Stack stays TanStack Start + Lovable Cloud (Supabase) + AI SDK via Lovable AI Gateway (fallback) or user Gemini key.
- All grading server-only via `createServerFn` + `requireSupabaseAuth`-free (anon visitor token model).
- No copyrighted past-paper text reproduced — only structural format mirrored; questions paraphrased from NIE syllabus learning outcomes.
- Bundle of seed questions kept under ~120KB per subject (lazy-loaded per topic).

### Out of scope (this iteration)

- User accounts / cross-device sync.
- Sinhala/Tamil full-UI localisation (content medium toggle yes; chrome stays EN).
- Live tutor / chat.
- Mobile app shell.  
  
FIX ANY GLITCHES / SECURITY ISSUES / ERRORS IN THE WEBSITE.