# Downloads, a real student dashboard, and an About page

## 1. Teacher pack: real downloads (not just print)

Today `/for-teachers/pack` only calls `window.print()`. Add a download row:

- **Download PDF** — generated in the browser so it stays free (no server, no AI). Same content as the print view: header block, numbered questions with A-D options, page break, then the marking scheme. Filename like `SyllabusHQ-Mathematics-Algebra-20Q.pdf`.
- **Download Word (.docx)** — same content as a real Word file teachers can edit before printing.
- Keep **Print / Save as PDF** as a third option.
- Math symbols: question text is stored with LaTeX-ish markup, so both exporters run it through the same normalisation the on-screen math renderer uses — `log_2 x`, fractions and powers read correctly instead of showing raw markup.
- Add a **paper only / paper + marking scheme** toggle so teachers can hand out the questions without the answers.

## 2. What signing in is for — rebuild the dashboard around the student

Right now the dashboard is a class-management screen: profile fields, "create class", "join a class with a code", assignments. That is a school-admin feature with no schools on it yet, and it makes signing in feel pointless.

**New direction: signing in = your progress, everywhere.**

The class / join-code / assignment tables stay in the database untouched (nothing is lost, classes can return later), but the UI is replaced. The dashboard becomes a personal progress hub:

- **Header** — name, greeting, current streak with the 24-hour countdown, total questions answered, overall accuracy.
- **Continue where you left off** — the last unfinished paper or practice session, one tap to resume.
- **Subject rings** — Mathematics / Science / Business, each with accuracy and questions attempted.
- **Weakest topics** — five lowest-accuracy topics, each linking straight into practice on that topic.
- **Paper history** — every completed MCQ set, structured paper, short-answer set and full simulation with date, score, mode and a link back to its results.
- **Streak calendar** — the existing heatmap, synced to the account instead of only the browser.
- **Your details** — name, school, grade (kept; used on printed papers).

Signing in then gives four things anonymous mode cannot: progress that survives a cleared browser or a new phone, long-term weak-topic analysis, saved paper history, and a streak that can't be lost. Sign-in stays optional — every mode keeps working signed out exactly as today.

## 3. About page

New `/about` route, added to the nav bar beside Practice, Resources, Teachers, Reviews (and the footer):

- What SyllabusHQ is and who it's for.
- **Founder: Anuga Weerasinghe** — student and independent developer; 2,000,000+ total views and 10,000+ combined followers across social platforms.
- Mission statement.
- **Live platform statistics** — questions in the bank, topics covered, subjects, papers practised, drawn from the real question bank and attempt counts rather than invented numbers.
- Contact: [anugaweerasinghe1@gmail.com](mailto:anugaweerasinghe1@gmail.com), WhatsApp +94 71 489 7346.
- Full SEO head tags plus `Person` and `Organization` structured data, which also helps Google tie the site to a real author.

## 4. AI usage limits — the honest answer

The site uses a free Google AI Studio key (Gemini 2.5 Flash / Flash-Lite) for four things: hints, marking written answers, the daily question, and topping up question banks when a topic is short.

Free-tier Gemini allows a few hundred requests per model per day, shared across everyone using the site at the same time. Practically that is a few hundred AI actions a day site-wide — fine now, but it will run out on a busy day, and today a quota failure just shows an error.

So the plan also adds resilience:

- **Cache everything AI produces.** Generated questions already persist; extend the same caching to the daily question and to hints so repeats cost nothing.
- **Graceful fallback** — at quota, hints fall back to a hint derived from the question's explanation, written-answer marking falls back to a keyword rubric clearly labelled "auto-marked", and bank top-up falls back to reshuffling local questions instead of erroring.
- **Never block practice on AI** — MCQ, structured and full papers must run entirely from the local bank.

## 5. Full-site verification pass

After the above, sweep every clickable path automatically: three subjects x four modes, every topic in the dropdown, mixed topics, timer on and off, handwriting upload, submit and results, the teacher pack at several question counts with both exports, reviews, suggestions, sign-in, sign-out, and the 404 route. Anything that breaks is fixed in the same build.

## Technical notes

- New browser-side dependencies for PDF and Word export; no server or AI cost.
- New `practice_sessions` table (user_id, subject, topic, mode, marks, total, detail) with row-level security scoped to the signed-in user plus grants. Existing anonymous attempt and mastery rows are attached to the account on first sign-in so nothing earned is lost.
- Class and assignment screens (`/dashboard` class panels, `/classes/$classId`) are removed from the UI; their tables, policies and server functions stay for a later school release.
- `src/routes/about.tsx` with its own `head()` metadata; `SiteHeader` nav gains the About link.  
  
can we add another model ai free tier model api key to handle some parts of the site instead of giving everything to gemini so we can get about 500-1000 requests a day completely fine?