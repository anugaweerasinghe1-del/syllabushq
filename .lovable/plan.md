## Priority plan

### Phase 0 — Enable Lovable Cloud + secure admin password
- Enable Lovable Cloud for shared reviews, feature suggestions, spam protection, and AI short-answer grading.
- Add a server-only `REVIEW_DELETE_PASSWORD` secret for deleting reviews.
- Explain Cloud-powered pieces after it is enabled.

### Phase 1 — Fix the glitch first
- Stop quiz questions from reshuffling on navigation/hydration by making each practice session deterministic and persisted for the active attempt.
- Replace the current `Math.random()` re-seed-on-render behavior with stable attempt IDs and stored question IDs/order.
- Fix streak UI flashing to zero by hydrating localStorage safely instead of rendering reset values first.
- Add a 24-hour streak rollover rule: if the last completed study activity is older than 24 hours without a new completion, current streak returns to zero while history remains accurate.
- Add storage validation/migration guards so corrupted localStorage cannot reset the UI or crash the app.

### Phase 2 — Upgrade content model beyond MCQs
- Extend static question data to support:
  - MCQs
  - typed short-answer questions with model answers and marking points
  - Business & Accounting case-study questions only where past-paper style supports them, written as original scenarios
  - structured paper sections with sub-questions and model answers
- Use one-time build generation only; no visitor-facing generation for static practice banks.
- Keep all generated content syllabus-aligned and O/L-style.

### Phase 3 — AI-graded short answers
- Add a runtime AI grading flow only for the user-selected short-answer grading feature.
- Use server functions so prompts/API access stay server-side.
- Validate typed answers, limit length, and return concise feedback, score bands, and improvement tips.
- Keep a self-grade/model-answer mode available when users do not want AI grading.

### Phase 4 — Premium dark redesign
- Rework the brand into a dark, premium Apple/Nike-like study product:
  - dark graphite/black surfaces
  - sharp editorial typography
  - controlled amber/electric accent highlights
  - glassy but restrained panels
  - refined hover states and motion
- Replace the slogan with a stronger premium line, e.g. “Master the syllabus. Own the exam.”
- Redesign home, subject, topic, quiz, results, streak, structured papers, reviews, and suggestions into a more polished layout comparable to leading study sites.
- Add neat, purposeful animations with reduced-motion support.

### Phase 5 — Better study streak
- Build a more professional streak widget with:
  - current streak
  - longest streak
  - last studied time
  - weekly activity strip
  - progress ring or compact calendar heatmap
  - stable loading state so it never flashes reset values
- Count completed MCQ quizzes, structured-paper attempts, and short-answer practice as study activity.

### Phase 6 — Reviews + feature suggestions
- Add a public Reviews tab/page with shared reviews stored in Cloud.
- Enforce one review per browser/device using a local visitor token plus server-side duplicate checks.
- Add feature suggestion submission so users can suggest improvements.
- Add password-protected delete for reviews using the server-only admin password.
- Add database grants/RLS policies correctly for public reads and controlled inserts/deletes.

### Phase 7 — Programmatic SEO + GEO
- Replace leftover generic metadata with branded metadata.
- Generate programmatic pages/metadata for subject, topic, MCQ practice, structured papers, and short-answer practice.
- Add FAQ blocks, Breadcrumb JSON-LD, WebSite/Organization JSON-LD, and subject/topic-specific descriptions.
- Update sitemap generation to include the new structured and review pages.
- Add Sri Lankan O/L keyword coverage naturally: English medium, G.C.E. O/L, Mathematics, Science, Business & Accounting Studies, model answers, structured questions, past-paper-style practice.
- Add answer-engine/GEO-friendly summaries and FAQ content without keyword stuffing.

## Technical notes
- I found the main glitch source in `src/routes/$subject.$topic.practice.tsx`: the quiz set is initialized with `pickRandom(pool, QUIZ_LEN)` and then re-seeded in an effect when `pool` identity changes. This can make questions switch during route navigation/hydration.
- I found the streak flash source in `src/components/StreakHeatmap.tsx`: it starts with an empty set, renders zero values, then reads localStorage in `useEffect`.
- Lovable Cloud is required for shared reviews, suggestions, one-review enforcement beyond local-only storage, and safe server-side delete password checks.
- I will not use Paper/cloud connector tooling; the provided Paper context does not apply to this web app implementation.