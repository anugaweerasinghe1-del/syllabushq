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

const SITE = "https://app.syllabushq.workers.dev";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SyllabusHQ — Mastery, measured. Free O/L exam practice." },
      {
        name: "description",
        content:
          "Official Sri Lankan G.C.E. O/L past papers with live timers, plus practice for Mathematics, Science and Business & Accounting Studies in English medium.",
      },
      {
        name: "keywords",
        content:
          "O/L past papers, Sri Lanka O/L, G.C.E. Ordinary Level, O/L Mathematics, O/L Science, O/L Business Studies, O/L Accounting, English medium, MCQ practice, structured questions, model answers",
      },
      { property: "og:title", content: "SyllabusHQ — Mastery, measured." },
      {
        property: "og:description",
        content:
          "Official O/L past papers, live timers and saved answer sheets for Sri Lankan students.",
      },
      { property: "og:url", content: SITE + "/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
          description:
            "Free practice platform for the Sri Lankan G.C.E. O/L exam in English medium.",
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
            {
              "@type": "Question",
              name: "Is SyllabusHQ free for Sri Lankan O/L students?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Every quiz, structured paper, and short-answer drill is free with no login required.",
              },
            },
            {
              "@type": "Question",
              name: "Which O/L subjects are covered?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Mathematics, Science, and Business & Accounting Studies — all in English medium and aligned to the official syllabus.",
              },
            },
            {
              "@type": "Question",
              name: "Are the questions taken from past papers?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The Past Papers library uses supplied Department of Examinations papers unchanged. Generated practice is clearly separated from official papers.",
              },
            },
            {
              "@type": "Question",
              name: "How does SyllabusHQ O/L practice work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Choose a subject and topic, set a timer and question count, answer original syllabus practice, then review every answer and explanation. Official past papers remain in a separate unchanged library.",
              },
            },
            {
              "@type": "Question",
              name: "How does the study streak work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Complete any practice and today lights up. If 24 hours pass without practice, the streak resets to zero.",
              },
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to practise for the Sri Lankan G.C.E. O/L with SyllabusHQ",
          description:
            "Choose an English-medium O/L subject, configure a timed practice set, answer it, and use the review to plan the next session.",
          totalTime: "PT20M",
          step: [
            { "@type": "HowToStep", position: 1, name: "Choose a subject and topic" },
            { "@type": "HowToStep", position: 2, name: "Set the question count and timer" },
            { "@type": "HowToStep", position: 3, name: "Complete the practice or official paper" },
            { "@type": "HowToStep", position: 4, name: "Review answers and target weak topics" },
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
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <section className="relative mb-10 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
          <div className="rise inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_10px_2px_rgba(63,122,69,0.35)]" />
            <p className="text-[10.5px] font-medium uppercase tracking-[0.28em] text-foreground/70">
              G.C.E. O/L · English medium · Built in Sri Lanka
            </p>
          </div>

          <h1 className="rise-2 mt-7 max-w-4xl font-display text-[48px] font-extrabold leading-[1.02] sm:text-[76px] text-balance">
            <span className="text-gradient">Master your</span><br />
            <span className="text-aurora">knowledge.</span>
          </h1>

          <p className="rise-3 mt-7 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-[18px]">
             Train with real Department of Examinations papers, persistent timers, saved answer
             sheets, and focused practice that keeps every study session moving forward.
          </p>

          <div className="rise-4 mt-10 flex flex-wrap items-center gap-3 text-sm">
            <Link
              to="/practice"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Begin a paper
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              to="/past-papers"
              className="group inline-flex items-center gap-2 rounded-xl border border-hairline-strong bg-surface px-6 py-3.5 font-medium text-foreground backdrop-blur-md transition hover:bg-surface-2"
            >
              Official past papers
              <span className="text-muted-foreground transition group-hover:text-foreground">
                ↗
              </span>
            </Link>
          </div>

          {/* Stat strip */}
          <div className="rise-4 mt-12 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-hairline bg-surface backdrop-blur-md">
            <Stat n="4" l="Official papers" />
            <Stat n="3" l="O/L subjects" />
            <Stat n="AI" l="Grading engine" />
          </div>

          {/* Trust strip */}
          <p className="rise-4 mt-5 max-w-2xl text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
            Aligned with NIE syllabi · Trusted by Sri Lankan O/L students · No account required
          </p>
          </div>

          <div className="lg:col-span-5">
            <ProgressSection />
          </div>
        </section>

        <div className="mb-10">
          <ZeigarnikResume />
        </div>

        <section className="mb-6 rise-2">
          <DailyQuestion />
        </section>

        <Suspense fallback={<div className="h-44 animate-pulse rounded-2xl bg-surface-2" />}>
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
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
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
              body="Type your answer. AI feedback is shown as guidance and never mislabelled as an official marking scheme."
            />
            <Feature
              n="B"
              title="Official papers stay official."
              body="Past papers retain their exact pages, diagrams, numbering and local examination wording."
            />
            <Feature
              n="C"
              title="Progress you can feel."
              body="Apple-style rings, honest 24-hour streaks, and topic mastery that earns itself."
            />
          </div>
        </section>

        <section className="mt-24" aria-labelledby="how-it-works">
          <SectionHeader kicker="How it works" title="From practice to progress." />
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            SyllabusHQ separates unchanged official papers from original practice. Practice questions
            follow the Sri Lankan NIE Grade 10–11 syllabus and Department of Examinations conventions;
            they are screened to exclude Cambridge, Edexcel, IGCSE and other foreign-board formats.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HowStep n="01" title="Choose precisely" body="Pick Mathematics, Science, or Business & Accounting Studies, then select one topic or a balanced mix." />
            <HowStep n="02" title="Set exam conditions" body="Choose 5–50 questions and a live timer, or open an unchanged official paper from the library." />
            <HowStep n="03" title="Answer actively" body="Work through MCQs, short answers, or structured parts. Typed work and supported handwriting can be marked." />
            <HowStep n="04" title="Review the marks" body="See the correct answer, a readable explanation, weak areas, and a clear recommendation for the next session." />
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link to="/practice" className="font-semibold text-green hover:text-foreground">Build a practice set →</Link>
            <Link to="/past-papers" className="font-semibold text-blue hover:text-foreground">Open official past papers →</Link>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24">
          <PremiumCard
            className="overflow-hidden p-10 text-center sm:p-16"
            variant="deep"
            hover={false}
          >
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
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 animate-pulse-glow"
              >
                Begin →
              </Link>
              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 rounded-xl border border-hairline-strong px-6 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2"
              >
                See reviews
              </Link>
            </div>
          </PremiumCard>
        </section>
      </main>

      <footer className="mt-20 border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-10 text-xs text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} SyllabusHQ — Built for Sri Lankan O/L students.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-foreground">
              About
            </Link>
            <Link to="/reviews" className="hover:text-foreground">
              Reviews
            </Link>
            <Link to="/suggest" className="hover:text-foreground">
              Suggest a feature
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="bg-surface p-5">
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
    } catch {
      /* storage unavailable */
    }
    setData({
      daily,
      accuracy,
      streak: Math.min(1, current / 7),
    });
  }, []);

  return (
    <section className="mb-10">
      <PremiumCard className="h-full bg-surface-2 p-6 sm:p-8" hover={false} variant="deep">
        <div className="flex h-full flex-col items-start justify-between gap-7">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Today
            </p>
            <h2 className="mt-2 font-display text-3xl text-foreground">
              Your study pulse.
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Close the rings every day. Daily question, rolling accuracy, weekly streak.
            </p>
          </div>
          <ActivityRings
            className="w-full justify-between"
            rings={[
              { label: "Daily", value: data.daily, color: "var(--green)" },
              { label: "Accuracy", value: data.accuracy, color: "var(--amber)" },
              { label: "Streak (week)", value: data.streak, color: "var(--blue)" },
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
      {n && <p className="font-num text-[10px] tracking-widest text-muted-foreground">{n}</p>}
      <h3 className="mt-4 font-display text-xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </PremiumCard>
  );
}

function HowStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border-t border-hairline-strong pt-5">
      <p className="font-num text-[10px] text-amber">{n}</p>
      <h3 className="mt-3 font-display text-lg text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
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
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {meta[i % 3]}
              </p>
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
