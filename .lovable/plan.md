# Full site audit + fix plan

I ran the real flows in a headless browser and queried the data files. Below is what is actually broken — no sugar-coating — then the fix.

## What I verified

Content bank, counted from the data files:

| Subject | MCQs | Short-answer topics covered | Structured topics covered |
|---|---|---|---|
| Mathematics | 766 | 20 / 22 | 3 / 22 |
| Science | 110 | 0 / 22 | 3 / 22 |
| Business & Accounting | 105 (topic `source-documents` has 0) | 10 / 22 | 3 / 22 |

Structured papers: only **3 questions exist per subject**, but the setup screen defaults to 6 and lets you ask for up to 50.

## Confirmed bugs

1. **Teacher question pack is completely dead.** `/for-teachers` is the parent route of `/for-teachers/pack`, but its component never renders `<Outlet />`. Clicking "Build & preview pack" changes the URL and then re-renders the same teacher page. Confirmed in the browser: zero questions rendered on the pack URL.
2. **"0 questions in the bank" / "Coming soon".** Science short-answer has no questions at all; Business is half-covered; structured is 3 per subject. Any selection outside the small covered set dead-ends.
3. **AI top-up only runs for MCQ.** Short-answer and structured modes never call the generator, so they hard-fail instead of filling the gap. The MCQ top-up is also capped at 20 and is per-request only — nothing is saved, so the same gap is regenerated forever.
4. **"Full Exam Simulation" is MCQ-only.** It routes to the same MCQ runner — no Paper I + Paper II sections, no structured part.
5. **Structured/short setup silently under-delivers.** Ask for 6 structured questions, get 3, with no explanation.
6. **Topic dead ends.** `source-documents` and any empty-bank topic behave like a missing topic; the "mix" pseudo-topic still has sharp edges on results/resume paths.
7. **Handwriting upload.** The upload itself works and AI marking works — verified live, a real answer came back with a mark breakdown. The real problems: a hard 2.4 MB limit that a normal phone photo exceeds, no direct camera capture on mobile, no compression, one image only, no upload on the short-answer/MCQ paths, and no clear error when marking fails.
8. **Wrong contact details.** `hello@syllabushq.app`, `press@syllabushq.app`, and the pack footer still says `syllabushq.lovable.app`.

## The fix: a self-growing question bank (free)

The Google AI Studio key already in the project works and is on the free tier — I tested a live call just now. Instead of one-off throwaway generation, questions get **generated on demand and then saved permanently** to the backend database, so the bank grows itself and each gap costs free-tier quota exactly once.

```text
student picks topics ->
  1. local JSON bank        (instant)
  2. saved AI bank in DB    (instant, grows over time)
  3. generate now via AI    (2-6s, with a real progress state)
  4. save results to DB     -> next student gets it instantly
```

Applies to all three content types: MCQ, short-answer, structured. Nothing is ever a dead end again — worst case the student waits a few seconds.

Free-tier safety: per-visitor and global daily caps, request collapsing so a burst becomes one call, cached reuse across students, and a graceful "at capacity, here's the local bank" fallback. No paid service is added.

## Work items

**A. Critical fixes**
- Render `<Outlet />` in `/for-teachers` so the pack works; verify print layout and the marking-scheme page break.
- Correct all contact addresses to `anugaweerasinghe1@gmail.com` and fix the pack footer domain.

**B. Question supply**
- Backend table for generated questions (mcq / short / structured), keyed by subject + topic + difficulty, with dedupe.
- One generation service covering all three types, syllabus-locked prompts per subject, quality validation before saving (4 options, exactly one correct answer, topic in-syllabus, no duplicates).
- Wire short-answer and structured runners to it; remove the 20-question cap; keep the local bank first.
- Backfill run now: Science short-answer, Business missing topics, and structured coverage across every topic — so the site is already full before a student hits it.

**C. Full Exam Simulation**
- Rebuild as a real sectioned paper following `paper-structures.ts`: Section A MCQ, Section B structured/short, one shared timer, no feedback until submit, then a combined marked result.

**D. Handwriting / photo answers**
- Client-side image compression so any phone photo fits, `capture="environment"` for direct camera use, multiple images per answer, clear per-stage errors, retry on transient AI failure.
- Enable photo answers on short-answer mode too.

**E. Full clickable sweep**
- Automated pass over every mode x every subject x mix/single topic x every difficulty x every timer option, plus reviews, suggest, resources, press, teachers, embed, sitemap and all 404 paths — asserting no dead ends, no 0-question states, working timers, working submit and results.
- Every failure that sweep finds gets fixed in the same build.

## Technical notes

- Generation uses the existing `@ai-sdk/google` provider (`gemini-2.5-flash-lite` primary, `gemini-2.5-flash` fallback) behind server functions — no keys reach the browser.
- Saved questions live in the backend database with row-level security: public read, server-only write.
- Existing JSON files stay as the instant-load base layer; nothing currently working is removed.