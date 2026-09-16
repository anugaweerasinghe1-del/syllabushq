# Sri Lankan O/L paper-bank correction

## Goal
Replace the generic Cambridge/Edexcel-like experience with a paper-grounded Sri Lankan G.C.E. O/L system, and make the uploaded official papers usable online and downloadable.

## Confirmed audit findings
- The current 2,222-question MCQ bank was AI-generated from broad topic prompts; it was not derived from the wording patterns, linked-question groups, local contexts, or weightage of the uploaded papers.
- The current structured bank has only 9 items and includes generic international-exam patterns.
- The current full-exam screen invents its paper mix from topic pools instead of loading a specific examination paper.
- Mathematics is structurally wrong: the uploaded 2020 paper confirms Paper I is 2 hours with Part A questions 1–25 and five compulsory Part B questions; Paper II is 3 hours plus 10 minutes reading time, with five questions selected from each part.
- Science 2021 confirms a 40-question, one-hour Paper I and a Paper II whose Part B requires three choices from questions 5–9.
- Business & Accounting Studies confirms 40 linked/contextual MCQs and a three-hour combined sitting; Paper II requires question 1 plus two questions from Business Studies and two from Accounting.
- The current PDF exporter uses Helvetica, which cannot reliably embed the required Unicode mathematics glyphs.

## Build

### 1. Create a first-class past-paper library
- Add a static paper manifest for the uploaded official examination papers:
  - Mathematics 2020 — Papers I and II
  - Science 2021 (2022) — Papers I and II
  - Business & Accounting Studies 2023 (2024) — Papers I and II
  - Business & Accounting Studies 2024 (2025) — Papers I and II
- Keep teaching guides and practice/model papers separate from official past papers and label their source accurately.
- Store year, session, subject, medium, paper number, duration, reading time, instructions, sections, selection rules, marks, and source PDF.
- Copy the uploaded source PDFs into the app so each official paper can be downloaded unchanged.

### 2. Add live past-paper pages
- Build a browsable Past Papers page with subject, year, and paper filters.
- Give every paper its own stable page and “Start live paper” and “Download original PDF” actions.
- Transcribe questions into typed static data, preserving question numbering, linked stimulus groups, tables, mark allocations, local Sri Lankan contexts, and paper instructions.
- Preserve essential diagrams as cropped source images with descriptive alt text; do not turn diagram-dependent questions into misleading text-only items.
- Support MCQ selection, typed structured answers, the existing handwriting attachment flow, timer persistence, section navigation, unanswered-question review, and final submission.
- Do not claim an answer key or marking scheme is official unless one is present in the supplied source material.

### 3. Correct the exam structures
- Replace the guessed structure definitions with structures verified from each uploaded paper.
- Make full simulation select a real year/paper, then reproduce that paper’s exact compulsory/optional rules, timing, numbering, and marks.
- Keep generated practice and official past papers visibly separated so students always know what they are attempting.

### 4. Replace the unsuitable generated bank
- Quarantine the current generated questions from student-facing drills rather than mixing them with verified content.
- Derive a Sri Lankan O/L style specification per subject from the uploaded papers: sentence patterns, local terminology, linked-question sets, calculation depth, section weightage, command words, and expected answer length.
- Regenerate original practice questions against those specifications and syllabus constraints, using the real papers only as structural/style references—never close paraphrases.
- Add automated rejection checks for out-of-syllabus concepts, Cambridge/Edexcel terminology, non-local conventions, malformed options, duplicate stems, implausible distractors, and invalid answers.
- Sample-review each subject and expose source/style metadata internally so unverified content cannot silently re-enter live exams.

### 5. Unicode-safe paper downloads
- For official papers, download the original supplied PDF to preserve its exact layout and notation.
- For generated/typed paper exports, embed a Unicode font and use the same normalization as the on-screen renderer for √, ×, ÷, ≤, ≥, π, θ, superscripts, subscripts, units, and chemical formulae.
- Add paper headers, section instructions, answer space, page numbering, and non-splitting question blocks.

### 6. Verification
- Validate every paper’s counts, section rules, duration, marks, and question order against the source PDF.
- Test every filter, paper link, start action, answer control, timer, section switch, upload control, submit flow, and PDF download on desktop and mobile.
- Render and inspect every page of each generated PDF for clipped text, broken symbols, missing diagrams, overflow, and incorrect pagination.
- Run type/build checks and a browser sweep of all changed pages before completion.

## Scope note
The immediate release will make the uploaded official papers live and downloadable, correct the simulator structures, and remove the unsuitable generated bank from use. Rebuilding thousands of original practice questions will run as a validated batch process and will only publish questions that pass the new Sri Lankan O/L checks.
