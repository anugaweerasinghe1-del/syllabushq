
## Goal

Rebuild SyllabusHQ into a premium, dark, cinematic exam simulator inspired by TradingHQ. Restructure navigation so **Mode comes first**, then Subject → Topic → Setup → Exam. Each mode is its own experience. Fix math rendering with KaTeX. Expand question banks to 50+ per subject/mode.

## 1. Information Architecture (route restructure)

Replace the current `/subject/topic` flow with a mode-first flow:

```
/                         Landing (premium hero, "Start Practicing")
/practice                 Mode selector (MCQ / Structured / Short Answer / Full Exam)
/practice/$mode           Subject selector (Math / Science / Business)
/practice/$mode/$subject  Topic + setup (topic or "Mix of everything", count, difficulty, time)
/exam/$sessionId          Active exam runtime (per-mode UI)
/exam/$sessionId/results  Results screen
/reviews, /suggest        Keep as-is
```

Delete the leftover broken routes (`..index.tsx`, `..practice.tsx`, `..results.tsx`, `.index.tsx`, and the old `$subject.*` files). Keep `structured.tsx` only if used; otherwise remove. The `/practice/$mode` URL guarantees no mode bleed-through (Structured page never shows MCQ tabs, etc.).

## 2. Design system — TradingHQ-inspired dark premium

Update `src/styles.css`:

- Base: near-black `oklch(0.14 0.01 260)` background, graphite surfaces, subtle radial glow accents
- Accent: single restrained accent (cool platinum/electric white with faint cyan glow) — drop the amber/mint/coral mix
- Glassmorphism cards: `backdrop-blur-xl`, 1px hairline borders in `white/8`, soft inset highlights
- Typography: keep `Instrument Serif` for editorial display, pair with `Geist` or `Inter Tight` for UI; tighten tracking on headlines
- New tokens: `--surface-1/2/3`, `--border-hairline`, `--glow-accent`, `--shadow-cinematic`
- Motion: subtle fade/slide-up on mount, no bouncy animations

Build a small primitive layer: `PremiumCard`, `GlowButton`, `SectionHeading`, `StatPill`, `ProgressRing` in `src/components/ui-premium/`.

## 3. Logo / branding

Create `src/components/BrandMark.tsx`: minimal monogram "S/HQ" set in Instrument Serif with a thin platinum underline and faint glow. Use everywhere (header, favicon SVG, OG image, loading screen). Generate a matching favicon and `/og.png` (1200×630).

## 4. Mode-specific experiences

### MCQ
- 1 question at a time, large answer cards, keyboard 1–4
- Instant correct/incorrect feedback + explanation (toggle off in Full Exam)
- Up to 50 questions, topic or Mix

### Structured Papers
- Pure exam-paper aesthetic: paper header ("National O/L Style — Specimen Paper"), candidate-number field (cosmetic), "Section A / B", bold mark allocations `[3]`
- Multi-part questions `(a) (i) (ii)`, free-response textareas, no MCQ tabs
- Reveal model answer + marking points after submit

### Short Answer
- 50 questions, one-at-a-time with progress bar
- Textarea + "Reveal answer" with marking points & self-grade (correct / partial / wrong)
- Score tallied from self-grade

### Full Exam Simulation
- Mixed paper: ~40 MCQ + 5 short + 2 structured (configurable)
- Hard timer (default 2 hours), section progression, no feedback until submission
- Final results: section-by-section breakdown, mark total, weak topics

## 5. Question bank expansion (50+ per subject per mode)

Reshape data files for fast lookups:

```
src/data/banks/
  mathematics.mcq.json        ≥50
  mathematics.short.json      ≥50
  mathematics.structured.json ≥10 multi-part papers
  science.*.json
  business-accounting.*.json
```

Each item: `{ id, topic, difficulty: 'easy'|'medium'|'hard', marks, question, ... }`.

Generation: run `scripts/generate-bank.mjs` using the Lovable AI Gateway in batches (per subject × mode), with strict O/L style prompts and JSON-schema validation. Cache to disk; never generate at runtime. Existing `questions.json` and `short-answer.json` content is merged in as the seed; we top up to ≥50 per (subject, mode).

Style rules baked into the prompt: real GCSE/O/L phrasing, varied command words (State / Explain / Calculate / Justify), explicit `[marks]`, and **math written in LaTeX** (`$\sqrt{16}\div 2$`) — never `sqrt(16)/2`.

`src/lib/bank.ts` exposes `getQuestions({ subject, mode, topic|'mix', difficulty, count, seed })` with deterministic sampling tied to the session.

## 6. Math rendering (KaTeX)

- `bun add katex react-katex` and import `katex/dist/katex.min.css` in `__root.tsx`
- `<MathText>` component: splits text on `$...$` / `$$...$$` and renders inline/block KaTeX, plain text otherwise
- Use `<MathText>` everywhere a question/option/explanation is rendered
- Migration pass on existing data: regex-replace `sqrt(x)` → `$\sqrt{x}$`, `x^y` → `$x^{y}$`, `*` → `\times`, `/` → `\div` (script `scripts/latexify-bank.mjs`, manual spot-check)

## 7. Setup wizard + loading screen

`/practice/$mode/$subject` shows a 1-page card stack:
1. Topic chips (incl. "Mix of everything")
2. Difficulty (Easy / Medium / Hard / Mixed)
3. Count slider (5–50)
4. Time limit (Off / 15 / 30 / 60 / 120 min) — auto-defaulted per mode
5. "Begin Exam" → loading screen (animated progress ring, rotating exam tips for ~1.2s) → `/exam/$sessionId`

Session persisted in `sessionStorage` (existing `quiz-session.ts` extended; deterministic seed prevents reshuffles on refresh — the prior glitch fix is preserved).

## 8. Results

Premium completion screen: big score ring, correct/incorrect/blank, per-topic weakness chart, 3 personalized recommendations, "Retry weak topics" CTA, share/permalink. Save attempt summary to `localStorage` for streak/heatmap continuity.

## 9. Cleanup / preservation

- Keep: streak heatmap, reviews, suggestions, Supabase wiring, SEO (sitemap/llms.txt/robots), admin delete password
- Remove: dead `..*.tsx` route files, legacy `structured.tsx` if superseded, unused `case-studies.json`
- Regenerate `sitemap.xml` for new URLs

## 10. Technical notes

- TanStack file routes: new files `practice.tsx` (layout), `practice.index.tsx`, `practice.$mode.tsx`, `practice.$mode.$subject.tsx`, `exam.$sessionId.tsx`, `exam.$sessionId.results.tsx`
- All data reads via `getQuestions()` — no per-render fetching from Supabase
- Reusable components: `<ModeCard>`, `<SubjectCard>`, `<TopicChip>`, `<ExamShell>`, `<QuestionRenderer mode=...>`, `<ResultsPanel>`
- No business-logic changes to Supabase tables; only UI + content additions

## Out of scope (ask if you want them)

- Server-side AI grading of short answers (currently self-graded)
- Login/accounts (still anonymous per-browser)
- Adding subjects beyond Math / Science / Business & Accounting
