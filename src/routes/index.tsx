import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { subjectsQuery, questionsQuery, countBySubject } from "@/lib/content";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { MODES } from "@/lib/modes";
import { ActivityRings } from "@/components/ActivityRings";
import { ZeigarnikResume } from "@/components/ZeigarnikResume";
import { getStudyDays, computeStreaks } from "@/lib/streak";

const SITE = "https://syllabushq.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SyllabusHQ — Mastery, measured. Free O/L exam practice." },
      {
        name: "description",
        content:
          "AI-graded Sri Lankan G.C.E. O/L practice papers. Original questions, instant feedback, real marking schemes. Mathematics, Science, Business & Accounting — English medium. Free.",
      },
      { name: "keywords", content: "O/L past papers, Sri Lanka O/L, G.C.E. Ordinary Level, O/L Mathematics, O/L Science, O/L Business Studies, O/L Accounting, English medium, MCQ practice, structured questions, model answers" },
      { property: "og:title", content: "SyllabusHQ — Mastery, measured." },
      { property: "og:description", content: "AI-graded O/L practice papers. Original questions. Instant feedback. Built for Sri Lanka's sharpest." },
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
        <section className="mb-14 sm:mb-20">
          <p className="rise text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Sri Lankan G.C.E. O/L · English medium · Exam intelligence
          </p>
          <h1 className="rise-2 mt-5 font-display text-[44px] leading-[1.02] text-foreground sm:text-[80px] text-balance">
            Mastery, <span className="italic text-muted-foreground">measured.</span>
          </h1>
          <p className="rise-3 mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            AI-graded O/L practice papers. Original questions, instant feedback,
            real marking schemes. Built for Sri Lanka's sharpest.
          </p>
          <div className="rise-3 mt-8 flex flex-wrap gap-3 text-sm">
            <Link to="/practice" className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 font-semibold text-background transition hover:brightness-110 animate-pulse-glow">
              Begin a paper →
            </Link>
            <Link to="/practice/$mode" params={{ mode: "exam" }} className="inline-flex items-center justify-center rounded-lg border border-hairline-strong px-6 py-3 font-medium text-foreground transition hover:bg-surface-2">
              Full exam simulation
            </Link>
          </div>
        </section>

        <div className="mb-8">
          <ZeigarnikResume />
        </div>

        <ProgressSection />

        <Suspense fallback={<div className="h-44 animate-pulse rounded-2xl bg-surface" />}>
          <StreakHeatmap />
        </Suspense>

        <section id="modes" className="mt-16 scroll-mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">Four ways to practise.</h2>
            <Link to="/practice" className="text-xs text-muted-foreground hover:text-foreground">All modes →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODES.map((m, i) => (
              <Link key={m.slug} to="/practice/$mode" params={{ mode: m.slug }}>
                <PremiumCard className="p-5 h-full">
                  <p className="font-num text-[10px] text-muted-foreground">0{i + 1}</p>
                  <h3 className="mt-3 font-display text-xl text-foreground">{m.name}</h3>
                  <p className="mt-1 text-[12px] text-muted-foreground">{m.tagline}</p>
                </PremiumCard>
              </Link>
            ))}
          </div>
        </section>

        <section id="subjects" className="mt-16 scroll-mt-20">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">Three subjects.</h2>
            <span className="text-xs text-muted-foreground">All English medium</span>
          </div>
          <SubjectGrid />
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          <Feature title="Marked like a chief examiner." body="Type your answer. An AI grades it against a real marking scheme, point by point, in seconds." />
          <Feature title="Papers that never repeat." body="Every question is generated fresh in the exact style of the Sri Lankan O/L English-medium papers." />
          <Feature title="Progress you can feel." body="Apple-style rings, an honest 24-hour streak, and topic mastery badges that earn themselves." />
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

function ProgressSection() {
  const [data, setData] = useState({ daily: 0, accuracy: 0, streak: 0 });

  useEffect(() => {
    const days = getStudyDays();
    const { currentStreak } = computeStreaks(days);
    const today = new Date().toISOString().slice(0, 10);
    const daily = days.has(today) ? 1 : 0;
    // Accuracy fallback when no attempts yet: use 0.
    let accuracy = 0;
    try {
      const raw = localStorage.getItem("shq:accuracy");
      if (raw) accuracy = Math.max(0, Math.min(1, Number(JSON.parse(raw))));
    } catch {}
    setData({
      daily,
      accuracy,
      streak: Math.min(1, currentStreak / 7),
    });
  }, []);

  return (
    <section className="mb-10">
      <PremiumCard className="p-6 sm:p-8" hover={false}>
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Today
            </p>
            <h2 className="mt-2 font-display text-3xl text-foreground">Three rings. One discipline.</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Close the rings every day. Daily question, rolling accuracy, weekly streak.
            </p>
          </div>
          <ActivityRings
            rings={[
              { label: "Daily", value: data.daily, color: "#6ee7b7" },
              { label: "Accuracy", value: data.accuracy, color: "#fbbf24" },
              { label: "Streak (week)", value: data.streak, color: "#e8ecf3" },
            ]}
          />
        </div>
      </PremiumCard>
    </section>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <PremiumCard className="p-5" hover={false}>
      <h3 className="font-display text-xl text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </PremiumCard>
  );
}

function SubjectGrid() {
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const counts = countBySubject(questions);
  const meta = ["Numeric", "Conceptual", "Applied"];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((s, i) => {
        const count = counts.get(s.slug) ?? 0;
        return (
          <Link
            key={s.slug}
            to="/practice/$mode/$subject"
            params={{ mode: "mcq", subject: s.slug }}
          >
            <PremiumCard className="p-6 h-full">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{meta[i % 3]}</p>
              <h3 className="mt-3 font-display text-2xl text-foreground">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.topics.length} topics</p>
              <div className="mt-8 flex items-baseline justify-between">
                <span className="text-sm text-foreground">Start practice →</span>
                <span className="font-num text-xs text-muted-foreground">{count} Qs</span>
              </div>
            </PremiumCard>
          </Link>
        );
      })}
    </div>
  );
}
