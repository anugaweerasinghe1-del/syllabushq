# Make SyllabusHQ school-ready

Two builds, in order: fix everything first, then add the school layer (accounts, classes, assignments).

## What I verified just now

- TypeScript typecheck: clean, zero errors.
- Every public page returns 200: home, practice, exam, reviews, suggest, resources, press, for-teachers, structured, sitemap.xml, embed/daily, and the three subject pages.
- `/business-studies` returns 404. The real slug is `business-accounting`, so the obvious guess a teacher or student types is a dead end.
- Lint: 736 errors, all formatting (Prettier). No logic errors, but the codebase is unformatted and inconsistent.
- Content: 3 subjects, 22 topics each.

---

# Build 1 — Zero-defect pass

**Every clickable thing, driven for real**
An automated browser sweep over every route, every subject, every mode (MCQ, short answer, structured, full exam), every difficulty, every timer option, mix vs single topic, plus reviews, suggestions, teacher pack, embed and 404 paths. Each run asserts: page loads, questions appear, timer counts, submit works, results render, no console errors. Everything the sweep finds gets fixed in the same build.

**Known fixes going in**
- Slug aliases so `/business-studies`, `/business`, `/maths` and similar resolve instead of 404ing.
- Format the whole codebase and get lint to zero, so future changes stay clean.
- Real loading states everywhere the AI bank fills, so a 10-15s generation never looks like a broken page.
- Error boundaries with a retry action on every data-loading route — no blank screens.
- Accessibility pass: labels on icon-only buttons, keyboard navigation through the whole quiz flow, visible focus rings, text contrast.
- Mobile pass at 360px: tap targets, sticky timer, no horizontal scroll.
- Head metadata audit: unique title/description/OG on every route.

---

# Build 2 — The school layer

**Accounts**
Google sign-in plus email/password. Every user gets a profile (name, school, grade, role). Progress, streaks, attempts and results move off the device into the account, so a student can practise on a phone and a laptop and see one history. Anonymous practice keeps working exactly as today — sign-in is optional until a student joins a class.

**Classes**
A teacher creates a class, gets a short join code, and shares it. Students enter the code and they are on the roster. A teacher can run several classes; a student can be in several.

**Assignments**
A teacher builds an assignment from the existing engine — subject, topics, mode, question count, timer, due date — and sets it for a class. Students see it on their dashboard, sit it under exam conditions, and it marks automatically (AI marking for short-answer and structured, as today).

**Teacher dashboard**
Per class: completion rate, average mark, per-student marks, and the weakest topics across the class so a teacher knows what to reteach. Per student: attempt history and topic mastery. CSV export of any class's marks. The printable question pack stays and gains a "print this assignment" option.

**Student dashboard**
Assignments due, results with the marking breakdown, topic mastery rings and streak — all synced to the account.

**Roles and privacy**
Teacher vs student is a separate, server-checked role that cannot be self-granted from the browser. A teacher only sees data for students in their own classes. Students never see each other's marks.

**Design**
Same dark premium direction extended to the new surfaces: a proper dashboard shell, quiet data tables, restrained charts. No new palette, no new fonts.

---

## Technical notes

- Auth via Lovable Cloud: Google (managed OAuth) + email/password, with a `profiles` table auto-created by trigger on signup.
- Roles live in a dedicated `user_roles` table read through a security-definer `has_role()` function — never on the profile row.
- New tables: `profiles`, `user_roles`, `classes`, `class_members`, `assignments`, `assignment_submissions`. RLS on all, scoped through class membership, with explicit GRANTs in the same migration.
- Existing anonymous tables (`attempts`, `mastery`) gain an optional `user_id`, plus a one-time merge of the device's local history into the account on first sign-in.
- Protected pages live under an `_authenticated` layout; all reads/writes go through server functions with the auth middleware.
- The self-growing AI question bank stays as-is and now also serves assignments.