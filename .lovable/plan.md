
# SyllabusHQ execution queue

Ordered so blockers ship first, cosmetics last. Every step ends verified.

---

## Phase A — Bug fixes & functionality (highest priority)

### A1. Fix "we couldn't find that topic" completely (issue 4)
Root cause audit across all 3 subjects × all modes. Rewrite `pickQuestions()` and topic-resolution logic so:
- Any valid subject+topic slug always resolves (fallback to any question in that subject if topic is empty).
- Mode routes (`/exam/short/*`, `/exam/structured/*`, `/$subject/$topic/*`) never render the not-found shell when the user came from a valid picker.
- Add graceful degradation: if bank is thin, borrow from adjacent topics before showing empty state.
- Add unit test-style assertions in-code (dev-only warn) for every subject/topic combination.

### A2. Question count is ignored (issue 6)
`pickQuestions` / session start currently returns full pool for short/structured. Fix so `count` slider is honored across all modes (mcq, exam, short, structured). Verify by starting each mode with count=5 and asserting session length.

### A3. Timer not showing (issue 7)
Audit `ExamTimer` mount conditions on `/$subject/$topic/practice`, short, and structured routes. It's probably gated on `mode === "exam"`. Show it whenever `timeLimitSec > 0` regardless of mode. Visible top-right sticky.

### A4. Attach handwriting upload broken (issue 5)
`StructuredAnswerInput` file input works, but the base64 encode via `btoa(String.fromCharCode(...))` blows the stack on large images and the "Attach photo" button is inside a flex that hides feedback. Rewrite with `FileReader.readAsDataURL`, show a real thumbnail preview, and confirm gateway grading receives `imageBase64` + `imageMime`.

### A5. Remove "Toggle model answer" from MCQ (issue 3)
Strip `ModelAnswerToggle` usage from MCQ result cards; keep on short/structured only. Hints stay.

### A6. Math renders as "lo (16) + lo (1/2)" instead of log₂ (issue 10)
`MathText` isn't parsing bare `log_2(16)` — the bank stores plain text. Two fixes:
- Update `MathText` to detect `log_N(x)` and `sqrt(x)` outside `$...$` and wrap them in KaTeX.
- Backfill the questions JSON: run a one-off script pass to convert `log_2(16)` → `$\log_2(16)$`, `sqrt(x)` → `$\sqrt{x}$`, `x^2` → `$x^2$`, fractions `1/2` inside math contexts → `$\frac{1}{2}$`.

### A7. Fix Resources page links (issue 8)
Every "Official syllabi" link is guessed/wrong. Replace with verified URLs:
- NIE (nie.lk) actual syllabus PDF landing pages per subject
- Department of Examinations (doenets.lk) past papers portal
- MOE (moe.gov.lk) circulars
Verify each URL returns 200 via fetch_website before committing.

---

## Phase B — Hybrid AI question selection (issue 11)

Chosen approach: **AI picks from existing bank; generates fresh only when bank is thin.**

- New server fn `selectQuestions.functions.ts`:
  1. Filter bank by subject+topic+difficulty locally.
  2. If ≥ `count` matches → shuffle deterministically by session seed, return.
  3. If < `count` → call Gemini Flash Lite (cheapest) with the filtered bank + user selection; ask it to pick the most relevant subset and, only if still short, generate the missing questions in the same call.
- Fallback chain (on 429/402/timeout): Gemini Flash Lite → Gemini 2.5 Flash Lite → static deterministic pick from adjacent topics. Log which tier served.
- In-memory LRU cache keyed by `(subject, topic, difficulty, count)` for 10 min → 100+ concurrent students share cache hits, keeping free-tier credit usage minimal.
- Expected free-tier cost: <5 requests/min under normal load. Safe.

Wire into `startNew()` so mcq/exam/short/structured all route through it.

---

## Phase C — Teacher page pivot (issue 9)

Rebuild `/for-teachers` around two things user picked:
1. **Printable question packs** — teacher selects subject/topic/count/difficulty → server generates a print-styled HTML page (`/for-teachers/pack/[id]`) with questions on page 1 and marking scheme on page 2. `@media print` styles. No auth needed.
2. **Free resources hub for teachers** — curated: lesson-plan templates, past-paper analyses per subject, exam tips, downloadable worksheets (link to printable packs).

Remove: embeddable widget code snippet, "developer" language, iframe copy-paste UI. Keep `/embed/daily` route itself (still useful for LMS embeds) but don't foreground it.

---

## Phase D — Light editorial theme (issue 1)

Full switch from dark aesthetic to Apple-like light editorial. Scope:
- Rewrite `src/styles.css` tokens: background `oklch(0.99 0 0)`, foreground near-black, hairlines `oklch(0.92 0 0)`, aurora accent kept but muted.
- Update `PremiumCard`, `AmbientBackground`, `SiteHeader`, `DailyQuestion`, all question/option surfaces, exam pages, results pages.
- Keep font stack (display serif + sans body).
- Test contrast on every question type against WCAG AA.

This alone addresses issue 1 (readability) since questions now sit on white.

---

## Phase E — Homepage redesign (issue 2, lowest priority)

Reorganize `/` into Apple-product-page structure:
- Hero: single sentence + Daily Question CTA
- Section 2: "One question. Every morning." — Daily Question card, huge
- Section 3: "Practice like the paper" — 3-mode grid (MCQ / Short / Structured) with mini previews
- Section 4: "Every subject on the syllabus" — subject grid with topic counts
- Section 5: Streak + activity rings social proof
- Section 6: Teacher / press strip
- Footer

Uses Phase D tokens. Type-driven, generous whitespace, no gradients.

---

## Technical details

- **Files touched (rough):** `src/lib/pickQuestions.ts`, `src/lib/quiz-session.ts`, `src/lib/selectQuestions.functions.ts` (new), `src/components/StructuredAnswerInput.tsx`, `src/components/ExamTimer.tsx`, `src/components/MathText.tsx`, `src/routes/$subject.$topic.practice.tsx`, `src/routes/exam.short.$subject.tsx`, `src/routes/exam.structured.$subject.tsx`, `src/routes/practice.$mode.$subject.tsx`, `src/routes/resources.tsx`, `src/routes/for-teachers.tsx`, `src/routes/for-teachers.pack.$id.tsx` (new), `src/routes/index.tsx`, `src/styles.css`, `src/data/questions.json` (math backfill script).
- **Verification per phase:** shell curl of URLs (A7), Playwright screenshots at each mode (A2, A3, A4, D), math rendering visual check (A6), 5-req burst against `selectQuestions` to confirm cache + fallback (B).
- **No schema changes.** No new secrets. `LOVABLE_API_KEY` already provisioned.

---

## Execution order (single build pass per phase)

1. A1–A7 (bug fixes) — one build
2. B (AI question selector) — one build
3. C (teachers pivot) — one build
4. D (light theme) — one build, largest visual diff
5. E (homepage) — one build

After each phase I'll verify and only proceed if clean. Approve to start Phase A.
