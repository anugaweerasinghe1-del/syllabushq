import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  subjectsQuery,
  questionsQuery,
  countByTopic,
} from "@/lib/content";
import { lastScoreFor } from "@/lib/scores";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/$subject/$topic")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s) => s.slug === params.subject);
    if (!subject) throw notFound();
    const topic = subject.topics.find((t) => t.slug === params.topic);
    if (!topic) throw notFound();
    await context.queryClient.ensureQueryData(questionsQuery);
    return { subject, topic };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.topic.name} — ${loaderData.subject.name} practice`,
          },
          {
            name: "description",
            content: `Practice ${loaderData.topic.name} for the O/L ${loaderData.subject.name} exam. 10-question MCQ set with instant feedback.`,
          },
          {
            property: "og:title",
            content: `${loaderData.topic.name} — O/L ${loaderData.subject.name}`,
          },
          {
            property: "og:description",
            content: `Free O/L practice on ${loaderData.topic.name}. Instant feedback, explanations, streak tracking.`,
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink">Topic not found</h1>
        <Link to="/" className="mt-4 inline-block text-marigold hover:underline">
          Back to home
        </Link>
      </main>
    </div>
  ),
  component: TopicPage,
});

function TopicPage() {
  const { subject, topic } = Route.useLoaderData();
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const counts = countByTopic(questions);
  const available = counts.get(`${subject.slug}::${topic.slug}`) ?? 0;

  const [last, setLast] = useState<ReturnType<typeof lastScoreFor>>(null);
  useEffect(() => {
    setLast(lastScoreFor(subject.slug, topic.slug));
  }, [subject.slug, topic.slug]);

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-4 text-sm">
          <Link
            to="/$subject"
            params={{ subject: subject.slug }}
            className="text-muted-foreground hover:text-ink"
          >
            ← {subject.name}
          </Link>
        </nav>

        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-marigold">
            {subject.name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">
            {topic.name}
          </h1>
          <p className="mt-2 text-charcoal">
            <span className="font-num">{available}</span> questions in the bank. Each
            session pulls 10 at random with immediate feedback.
          </p>
        </header>

        {last && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Last attempt
            </p>
            <p className="mt-1 text-ink">
              <span className="font-num text-lg">{last.score}</span>
              <span className="text-muted-foreground"> / </span>
              <span className="font-num text-lg">{last.total}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({Math.round((last.score / last.total) * 100)}%)
              </span>
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            to="/$subject/$topic/practice"
            params={{ subject: subject.slug, topic: topic.slug }}
            className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:opacity-90"
          >
            Start practice
          </Link>
          <Link
            to="/$subject"
            params={{ subject: subject.slug }}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-ink transition hover:bg-secondary"
          >
            Pick another topic
          </Link>
        </div>
      </main>
    </div>
  );
}
