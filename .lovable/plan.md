## Goal

Run a Semrush backlink teardown on the three main LK O/L competitors, then translate the findings into concrete on-site changes that make SyllabusHQ *linkable* — so the referring-domain types that already point at competitors will point at us too.

## Phase 1 — Competitive backlink teardown (research, no code)

Run `semrush--backlink_analysis` on each:

- `tutopiya.com`
- `savemyexams.com`
- `pastpapers.wiki`

For each, capture: Authority Score, total backlinks, referring domains, follow/nofollow split, top 10 referring domains, anchor-text distribution. Then bucket the top referring domains into the taxonomy from the last message (school `.edu`/`.ac.lk`, news, Reddit/forums, YouTube, teacher blogs, directories, GitHub, aggregators). Output a shortlist of ~20 real referring domains we should target.

Also run `semrush--domain_analysis` on `app.syllabushq.workers.dev` for a baseline (likely near-zero — that's fine, it sets the "before" number).

Deliverable: a short teardown written into `docs/backlink-teardown.md` in the repo so it's versioned and referable.

## Phase 2 — Make the site *linkable* (on-site changes)

Backlinks only happen if there's something worth linking to. Concrete additions:

1. `**/resources` hub** — a single high-signal page listing: NIE syllabus links, past-paper archives, marking schemes, exam-day checklist. This is the page teachers and journalists actually link to.
2. `**/for-teachers` page** — "Free classroom resources, printable question packs, embed our daily question widget." Gives school sites and tutors a reason to link.
3. **Embeddable Daily Question widget** — a copy-paste `<iframe>` snippet + a public `/embed/daily` route. Every embed is a followed backlink from a student/teacher blog.
4. **Shareable results card** — after a practice session, generate an OG image ("I scored 18/20 on O/L Maths Algebra") with a link back. Drives Reddit/Facebook shares → natural links.
5. `**/press` page** — one-paragraph project story, founder quote, brand assets (logo, screenshots, colors), contact email. Journalists won't cover you without this.
6. `**llms.txt` + rich `Article` schema on `/learn/*` pages** — makes the programmatic SEO pages citable by Perplexity/ChatGPT and by aggregator sites that scrape structured data.

## Phase 3 — Outreach assets (content, not code)

Draft into `docs/outreach/`:

- Teacher email template (for `.ac.lk` school resource pages)
- Reddit r/srilanka intro post draft (value-first, not spammy)
- Product Hunt launch copy + tagline
- One 1200-word guest post pitching Sri Lankan edtech blogs

These are user-executed but I'll write them.

## Phase 4 — Measurement

Add to the teardown doc: baseline Authority Score, backlink count, referring domains. Re-run `semrush--backlink_analysis` after 30/60/90 days and log deltas.

## What's NOT in this plan

- Full editorial redesign of every page (still queued)
- Programmatic SEO landing pages for high-intent LK keywords (still queued)
- Content depth / NIE structure audit (still queued)

## Tech notes

- `/embed/daily` route: pathless layout that skips `SiteHeader`, sets `X-Frame-Options: ALLOWALL` via response headers, minimal CSS.
- OG image generation: TanStack server route under `/api/public/og/results` using `@vercel/og` or a hand-rolled SVG→PNG (Worker-compatible; no `sharp`).
- `/resources`, `/for-teachers`, `/press`: static route files, each with proper `head()` (title, description, canonical, og:*, JSON-LD).
- `llms.txt` already exists at `public/llms.txt` — audit and expand.

Say "go" and I'll run Phase 1 first, then implement Phase 2 in one build pass.  
  
after implementing phase 2, continue programmatic seo and rest of it in this plan, try atleast without 0 errors