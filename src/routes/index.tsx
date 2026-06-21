import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { subjectsQuery, questionsQuery, countBySubject } from "@/lib/content";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { SiteHeader } from "@/components/SiteHeader";

const SITE = "https://syllabushq.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SyllabusHQ — Free O/L practice for Sri Lankan students" },
      {
        name: "description",
        content:
          "Master Sri Lankan G.C.E. O/L Mathematics, Science, and Business & Accounting Studies. 325+ MCQs, structured papers, short-answer practice, and instant feedback. English medium. Free.",
      },
      { name: "keywords", content: "O/L past papers, Sri Lanka O/L, G.C.E. Ordinary Level, O/L Mathematics, O/L Science, O/L Business Studies, O/L Accounting, English medium, MCQ practice, structured questions, model answers" },
      { property: "og:title", content: "SyllabusHQ — Master the syllabus. Own the exam." },
      { property: "og:description", content: "Free Sri Lankan O/L practice in English medium — MCQs, structured papers, and short-answer drills." },
      { property: "og:url", content: SITE + "/" },
    ],
    links: [{ rel: "canonical", href: SITE + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "SyllabusHQ",
          url: SITE,
          description: "Free practice platform for the Sri Lankan G.C.E. O/L exam in English medium.",
          areaServed: "LK",
          educationalCredentialAwarded: "G.C.E. Ordinary Level",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Is SyllabusHQ free for Sri Lankan O/L students?", acceptedAnswer: { "@type": "Answer", text: "Yes. Every quiz, structured paper, and short-answer drill is free with no login required." } },
            { "@type": "Question", name: "Which O/L subjects are covered?", acceptedAnswer: { "@type": "Answer", text: "Mathematics, Science, and Business & Accounting Studies — all in English medium and aligned to the official syllabus." } },
            { "@type": "Question", name: "Are the questions taken from past papers?", acceptedAnswer: { "@type": "Answer", text: "No. Every question is original and written in the style of real O/L papers to avoid copyright while keeping difficulty and phrasing realistic." } },
            { "@type": "Question", name: "How does the study streak work?", acceptedAnswer: { "@type": "Answer", text: "Complete any practice and today lights up. If 24 hours pass without practice, the streak resets to zero." } },
          ],
        }),
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(subjectsQuery),
      context.queryClient.ensureQueryData(questionsQuery),
    ]),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <section className="mb-12 sm:mb-16">
          <p className="rise text-[11px] font-medium uppercase tracking-[0.28em] text-amber">
            Sri Lankan G.C.E. O/L · English medium
          </p>
          <h1 className="rise-2 mt-4 font-display text-[44px] leading-[1.05] text-foreground sm:text-[72px] text-balance">
            Master the syllabus.
            <br />
            <span className="italic text-amber">Own</span> the exam.
          </h1>
          <p className="rise-3 mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Original O/L-style practice across Mathematics, Science, and Business
            &amp; Accounting Studies. MCQs, structured papers, and short-answer
            drills — built for the real paper, not for cramming.
          </p>
          <div className="rise-3 mt-7 flex flex-wrap gap-3 text-sm">
            <a href="#subjects" className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-3 font-semibold text-[color:var(--bg)] transition hover:brightness-110">
              Start practising →
            </a>
            <Link to="/structured" className="inline-flex items-center justify-center rounded-lg border border-hairline px-5 py-3 font-medium text-foreground transition hover:bg-secondary">
              Structured papers
            </Link>
          </div>
        </section>

        <Suspense fallback={<div className="h-44 animate-pulse rounded-2xl bg-surface" />}>
          <StreakHeatmap />
        </Suspense>

        <section id="subjects" className="mt-14 scroll-mt-20">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">Pick a subject</h2>
            <span className="text-xs text-muted-foreground">3 subjects · 22 topics each</span>
          </div>
          <SubjectGrid />
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          <Feature title="Original questions" body="Every question is written for SyllabusHQ — never lifted from past papers." />
          <Feature title="Three formats" body="MCQs for recall, structured papers for the real exam, short answer for written practice." />
          <Feature title="Honest streak" body="24-hour rolling streak. Miss a day, it resets. No fake gamification." />
        </section>
      </main>

      <footer className="mt-20 border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground sm:px-6">
          Built for Sri Lankan O/L students · English medium ·{" "}
          <Link to="/reviews" className="hover:text-foreground">Reviews</Link> ·{" "}
          <Link to="/suggest" className="hover:text-foreground">Suggest a feature</Link>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <h3 className="font-display text-xl text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function SubjectGrid() {
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const counts = countBySubject(questions);
  const meta = [
    { tag: "Numeric", glow: "rgba(245,165,36,0.25)" },
    { tag: "Conceptual", glow: "rgba(61,220,151,0.22)" },
    { tag: "Applied", glow: "rgba(255,107,92,0.2)" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((s, i) => {
        const count = counts.get(s.slug) ?? 0;
        const m = meta[i % meta.length];
        return (
          <Link
            key={s.slug}
            to="/$subject"
            params={{ subject: s.slug }}
            className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface p-6 transition hover:-translate-y-0.5 hover:border-amber/40"
            style={{ boxShadow: `0 0 0 0 ${m.glow}` }}
          >
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: m.glow }}
            />
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {m.tag}
            </p>
            <h3 className="mt-3 font-display text-2xl text-foreground">{s.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.topics.length} topics</p>
            <div className="mt-8 flex items-baseline justify-between">
              <span className="text-sm text-foreground/80 group-hover:text-amber">Start practice →</span>
              <span className="font-num text-xs text-muted-foreground">{count} Qs</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
