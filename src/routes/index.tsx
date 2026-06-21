import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { subjectsQuery, questionsQuery, countBySubject } from "@/lib/content";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "O/L Practice — Free MCQ quizzes for Sri Lankan students" },
      {
        name: "description",
        content:
          "Free practice quizzes for the Sri Lankan G.C.E. Ordinary Level — Mathematics, Science, and Business & Accounting Studies. No login. Track your streak.",
      },
      { property: "og:title", content: "O/L Practice — Free MCQ quizzes" },
      {
        property: "og:description",
        content:
          "Free O/L practice quizzes in English medium. Mathematics, Science, Business & Accounting Studies.",
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
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mb-8 sm:mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-marigold">
            Sri Lankan G.C.E. O/L · English medium
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-5xl">
            Practice. Every day. <br className="hidden sm:block" />
            Crush the O/L.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-charcoal sm:text-lg">
            Free practice quizzes for Mathematics, Science, and Business & Accounting
            Studies. No login. No paywall. Just questions, answers, and a streak to keep
            you honest.
          </p>
        </section>

        <Suspense fallback={<div className="h-40 rounded-2xl bg-muted" />}>
          <StreakHeatmap />
        </Suspense>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">Pick a subject</h2>
            <span className="text-xs text-muted-foreground">3 subjects · tap to start</span>
          </div>
          <SubjectGrid />
        </section>
      </main>

      <footer className="mt-12 border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          Built for Sri Lankan O/L students. Question content is original and for
          practice only.
        </div>
      </footer>
    </div>
  );
}

function SubjectGrid() {
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const counts = countBySubject(questions);

  const accents = ["var(--ink)", "var(--sage)", "var(--clay)"];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((s, i) => {
        const count = counts.get(s.slug) ?? 0;
        return (
          <Link
            key={s.slug}
            to="/$subject"
            params={{ subject: s.slug }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: accents[i % accents.length] }}
            />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Subject {i + 1}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{s.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {s.topics.length} topics
            </p>
            <div className="mt-6 flex items-baseline justify-between">
              <span className="text-sm text-charcoal group-hover:text-ink">
                Start practice →
              </span>
              <span className="font-num text-sm text-muted-foreground">
                {count} Qs
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
