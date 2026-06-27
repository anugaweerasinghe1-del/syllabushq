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
import { DailyQuestion } from "@/components/DailyQuestion";

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
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20">
        {/* HERO */}
        <section className="relative mb-20 sm:mb-28">
          <div className="rise inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" />
            <p className="text-[10.5px] font-medium uppercase tracking-[0.28em] text-foreground/70">
              G.C.E. O/L · English medium · Built in Sri Lanka
            </p>
          </div>

          <h1 className="rise-2 mt-7 font-display text-[52px] leading-[0.98] sm:text-[112px] text-balance">
            <span className="text-gradient">Mastery,</span>{" "}
            <span className="italic text-aurora">measured.</span>
          </h1>

          <p className="rise-3 mt-7 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-[18px]">
            An exam simulator engineered like an Apple product. AI-graded
            papers, real marking schemes, and questions that never repeat —
            built for the sharpest O/L students in the country.
          </p>

          <div className="rise-4 mt-10 flex flex-wrap items-center gap-3 text-sm">
            <Link
              to="/practice"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-foreground px-7 py-3.5 font-semibold text-background transition hover:brightness-110"
            >
              <span className="absolute inset-0 -z-10 bg-foreground blur-xl opacity-40 transition group-hover:opacity-70" />
              Begin a paper
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              to="/practice/$mode"
              params={{ mode: "exam" }}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-6 py-3.5 font-medium text-foreground backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              Full exam simulation
              <span className="text-muted-foreground transition group-hover:text-foreground">↗</span>
            </Link>
          </div>

          {/* Stat strip */}
          <div className="rise-4 mt-14 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-md">
            <Stat n="900+" l="Original Qs" />
            <Stat n="3" l="O/L subjects" />
            <Stat n="AI" l="Grading engine" />
          </div>
        </section>

        <div className="mb-10">
          <ZeigarnikResume />
        </div>

        <section className="mb-14 rise-2">
          <DailyQuestion />
        </section>

        <ProgressSection />

        <Suspense fallback={<div className="h-44 animate-pulse rounded-2xl bg-white/[0.02]" />}>
          <StreakHeatmap />
        </Suspense>

        {/* MODES */}
        <section id="modes" className="mt-24 scroll-mt-24">
          <SectionHeader
            kicker="Modes"
            title="Four ways to practise."
            right={
              <Link to="/practice" className="text-xs text-muted-foreground hover:text-foreground">
                All modes →
              </Link>
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODES.map((m, i) => (
              <Link key={m.slug} to="/practice/$mode" params={{ mode: m.slug }} className="block">
                <PremiumCard className="h-full p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-num text-[10px] tracking-widest text-muted-foreground">
                      0{i + 1} / 04
                    </p>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                  </div>
                  <h3 className="mt-6 font-display text-[22px] text-foreground">{m.name}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {m.tagline}
                  </p>
                  <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-foreground/60">
                    Enter →
                  </p>
                </PremiumCard>
              </Link>
            ))}
          </div>
        </section>

        {/* SUBJECTS */}
        <section id="subjects" className="mt-24 scroll-mt-24">
          <SectionHeader
            kicker="Subjects"
            title="Three subjects, mastered."
            right={<span className="text-xs text-muted-foreground">All English medium</span>}
          />
          <div className="mt-8">
            <SubjectGrid />
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-24">
          <SectionHeader kicker="Engineered" title="Built like an instrument." />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Feature
              n="A"
              title="Marked like a chief examiner."
              body="Type your answer. AI grades against the real marking scheme, point by point, in seconds."
            />
            <Feature
              n="B"
              title="Papers that never repeat."
              body="Every question generated fresh in the exact style of Sri Lankan O/L English-medium papers."
            />
            <Feature
              n="C"
              title="Progress you can feel."
              body="Apple-style rings, honest 24-hour streaks, and topic mastery that earns itself."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24">
          <PremiumCard className="overflow-hidden p-10 text-center sm:p-16" variant="deep" hover={false}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Open. Free. Unlimited.
            </p>
            <h2 className="mt-4 font-display text-4xl text-gradient sm:text-6xl text-balance">
              The paper opens itself.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              No account. No paywall. Just sit down and crush the syllabus.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:brightness-110 animate-pulse-glow"
              >
                Begin →
              </Link>
              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-foreground transition hover:bg-white/5"
              >
                See reviews
              </Link>
            </div>
          </PremiumCard>
        </section>
      </main>

      <footer className="mt-20 border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-10 text-xs text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} SyllabusHQ — Built for Sri Lankan O/L students.</p>
          <div className="flex items-center gap-4">
            <Link to="/reviews" className="hover:text-foreground">Reviews</Link>
            <Link to="/suggest" className="hover:text-foreground">Suggest a feature</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="bg-white/[0.01] p-5">
      <p className="font-display text-2xl text-foreground sm:text-3xl">{n}</p>
      <p className="mt-1 text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">{l}</p>
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  right,
}: {
  kicker: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
          {kicker}
        </p>
        <h2 className="mt-2 font-display text-3xl text-gradient sm:text-5xl text-balance">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

function ProgressSection() {
  const [data, setData] = useState({ daily: 0, accuracy: 0, streak: 0 });

  useEffect(() => {
    const days = getStudyDays();
    const { current } = computeStreaks(days);
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
      streak: Math.min(1, current / 7),
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

function Feature({ n, title, body }: { n?: string; title: string; body: string }) {
  return (
    <PremiumCard className="p-6 h-full">
      {n && (
        <p className="font-num text-[10px] tracking-widest text-muted-foreground">{n}</p>
      )}
      <h3 className="mt-4 font-display text-xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
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
