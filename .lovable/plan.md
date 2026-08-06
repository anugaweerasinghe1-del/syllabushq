# SyllabusHQ: Light Redesign + Full O/L Question Regeneration

Three workstreams. I'll be blunt about cost and risk on each.

## 1. New light design system (whole site)

Palette taken from your reference swatch:

- Paper `#F2F5EF` (off-white base) with pure white cards
- Green `#1E7A3C` — primary, correct answers, progress
- Blue `#3B72E8` — links, focus, secondary actions, timers
- Gold `#E8B10A` — attention: streaks, daily question, highlights
- Orange `#E2711D` — calls to action, used sparingly
- Red — reserved for wrong answers and destructive actions only

Typography: Carlito (free, metric-matched to Calibri) for body and headings,
with tabular numerals for scores and timers. Instrument Serif is dropped
entirely.

Structural changes, not just a recolour:

- Rewrite `src/styles.css` tokens: light surfaces, real ink-on-paper contrast,
  soft neutral hairlines, layered soft shadows instead of glass and glow
- Replace the `AmbientBackground` aurora orbs with a very subtle light wash
- `PremiumCard` becomes a white card with hairline border, soft elevation and a
  gentle hover lift — no backdrop blur, no dark glass
- Every route swept for dark-only classes: home, practice hub, mode and subject
  pickers, MCQ runner, results, structured paper, short answer, full exam
  simulation, dashboard, reviews, resources, teachers pack, about, press, auth,
  404 shell, embed widget
- MCQ pages get a real redesign pass: larger readable question type, generous
  spacing, clear option cards with green/red state, a calm progress rail

Honest note: this touches around 30 files. I'll do it in one build, but expect a
follow-up pass for stragglers I miss.

## 2. Unicode maths everywhere (no LaTeX)

Yes — this is free and simpler.

- Replace `MathText` internals with a Unicode formatter: `√ × ÷ ² ³ ⁿ ½ ¼ ¾ π °
  ≤ ≥ ≠ ≈ ±` and subscripts `₁₂₃`
- Remove KaTeX and `react-katex` plus the KaTeX CSS import
- Convert `$...$` markup already stored in the banks to Unicode
- Keep `mathPlain.ts` for PDF/Word exports, aligned to the same symbol table

Honest limitation: Unicode cannot render stacked fractions, long division, or a
root bar over a whole expression. Those become inline forms like `√(x + 3)`. For
O/L level maths this is acceptable and matches how questions are typed in most
Sri Lankan worksheets.

## 3. Full regeneration of the question banks (Sri Lankan O/L)

First I extract the real style from your four uploaded papers (Maths, Science,
Business & Accounting) — command words, marks weighting, question length, number
ranges, Rs. currency, local contexts, option phrasing. That style guide becomes
the generator spec, with a few sample items per subject as anchors. Nothing from
a real paper is copied into the app.

Then regenerate from scratch:

- 981 MCQs across 66 sub-topics (3 subjects × 22 topics), ~45 per sub-topic
- 120 short-answer items
- 9 structured papers matching real Paper 2 part structure and marks
- Replaces `src/data/questions.json`, `short-answer.json`, `structured.json`

Validation before writing: exactly 4 options, valid correct index, no duplicate
or near-duplicate stems, valid topic slug, no LaTeX, no `£`/`$` currency, no
Cambridge-only terminology.

Honest warnings:

- This is a long generation job (thousands of AI calls). It spans multiple build
  turns, not one. I'll run it subject by subject and report counts each time.
- The old bank is replaced. If a batch fails partway, that subject temporarily
  has fewer questions until the next pass.
- At this volume some imperfect items will slip through validation. I'd rather
  state that now than pretend otherwise.
- The live self-growing bank prompt gets the same style guide so runtime-
  generated questions match.

## Order of work

1. Design system, full-site light redesign, Carlito font
2. Unicode maths swap and KaTeX removal
3. Extract the style guide from the four PDFs
4. Regenerate Maths, then Science, then Business — one build each
5. Regenerate short-answer and structured banks
6. Click-through sweep of every route to catch redesign stragglers

## Technical notes

- Font via an `@fontsource` Carlito package import in `src/styles.css`, wired to
  `--font-sans` and `--font-display` in `@theme`
- All colours as semantic tokens; no hardcoded hex in components
- The `dark` variant stays defined but unused; the site ships light-only
- Generation runs as a Node script against the Lovable AI gateway at build time,
  writing static JSON — no new runtime AI cost