import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { subjectsQuery, questionsQuery, countByTopic, type Subject, type Topic } from "@/lib/content";
import { lastScoreFor } from "@/lib/scores";
import { SiteHeader } from "@/components/SiteHeader";

const SITE = "https://syllabushq.lovable.app";

export const Route = createFileRoute("/$subject/$topic/")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s: Subject) => s.slug === params.subject);
    if (!subject) throw notFound();
    const topic = subject.topics.find((t: Topic) => t.slug === params.topic);
    if (!topic) throw notFound();
    await context.queryClient.ensureQueryData(questionsQuery);
    return { subject, topic } as { subject: Subject; topic: Topic };
  },
  head: ({ params, loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.topic.name} — O/L ${loaderData.subject.name} practice` },
          { name: "description", content: `Free Sri Lankan O/L practice on ${loaderData.topic.name} (${loaderData.subject.name}). 10-question MCQ sets, instant feedback, explanations.` },
          { property: "og:title", content: `${loaderData.topic.name} — O/L ${loaderData.subject.name}` },
          { property: "og:url", content: `${SITE}/${params.subject}/${params.topic}` },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `${SITE}/${params.subject}/${params.topic}` }] : [],
  }),
  component: TopicPage,
});

function TopicPage() {
  const { subject, topic } = Route.useLoaderData();
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const counts = countByTopic(questions);
  const available = counts.get(`${subject.slug}::${topic.slug}`) ?? 0;

  const [last, setLast] = useState<ReturnType<typeof lastScoreFor>>(null);
  useEffect(() => { setLast(lastScoreFor(subject.slug, topic.slug)); }, [subject.slug, topic.slug]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-6 text-sm">
          <Link to="/$subject" params={{ subject: subject.slug }} className="text-muted-foreground hover:text-foreground">← {subject.name}</Link>
        </nav>

        <header className="mb-10 rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">{subject.name}</p>
          <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl text-balance">{topic.name}</h1>
          <p className="mt-3 text-muted-foreground">
            <span className="font-num text-foreground">{available}</span> MCQs in the bank. Each session pulls 10 at random and saves progress to your browser.
          </p>
        </header>

        {last && (
          <div className="mb-8 rounded-xl border border-hairline bg-surface p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Last attempt</p>
            <p className="mt-1 text-foreground">
              <span className="font-num text-2xl">{last.score}</span>
              <span className="text-muted-foreground"> / </span>
              <span className="font-num text-2xl">{last.total}</span>
              <span className="ml-2 text-sm text-muted-foreground">({Math.round((last.score / last.total) * 100)}%)</span>
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/$subject/$topic/practice"
            params={{ subject: subject.slug, topic: topic.slug }}
            className="group rounded-xl border border-amber/40 bg-gradient-to-br from-amber/10 to-transparent p-5 transition hover:border-amber"
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber">MCQ practice</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">10-question quiz</h2>
            <p className="mt-1 text-sm text-muted-foreground">Original O/L-style MCQs with instant feedback and explanations.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-amber">Start →</span>
          </Link>
          <Link
            to="/structured"
            className="group rounded-xl border border-hairline bg-surface p-5 transition hover:border-foreground/30"
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Structured paper</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">Past-paper style</h2>
            <p className="mt-1 text-sm text-muted-foreground">Multi-part structured questions with full model answers.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-foreground/80 group-hover:text-foreground">Open papers →</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
