import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { subjectsQuery, type Subject, type Topic } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";

type ResultItem = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  chosen: number;
};

type Results = {
  subject: string;
  topic: string;
  score: number;
  total: number;
  items: ResultItem[];
};

export const Route = createFileRoute("/$subject/$topic/results")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s: Subject) => s.slug === params.subject);
    if (!subject) throw notFound();
    const topic = subject.topics.find((t: Topic) => t.slug === params.topic);
    if (!topic) throw notFound();
    return { subject, topic } as { subject: Subject; topic: Topic };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `Results — ${loaderData.topic.name} · ${loaderData.subject.name}`,
          },
          { name: "robots", content: "noindex" },
        ]
      : [],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { subject, topic } = Route.useLoaderData();
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ol-last-results");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Results;
      if (parsed.subject === subject.slug && parsed.topic === topic.slug) {
        setResults(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [subject.slug, topic.slug]);

  if (!results) {
    return (
      <div className="min-h-screen bg-paper">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-ink">No recent results</h1>
          <p className="mt-2 text-muted-foreground">
            Start a practice set to see your score here.
          </p>
          <Link
            to="/$subject/$topic/practice"
            params={{ subject: subject.slug, topic: topic.slug }}
            className="mt-6 inline-block rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-paper"
          >
            Start practice
          </Link>
        </main>
      </div>
    );
  }

  const pct = Math.round((results.score / results.total) * 100);
  const tone =
    pct >= 80 ? "Strong work." : pct >= 50 ? "Solid. Keep going." : "Worth another pass.";

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-marigold">
            {subject.name} · {topic.name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">
            <span className="font-num">{results.score}</span>
            <span className="text-muted-foreground"> / </span>
            <span className="font-num">{results.total}</span>
          </h1>
          <p className="mt-1 text-lg text-charcoal">
            <span className="font-num text-marigold">{pct}%</span>{" "}
            <span className="text-muted-foreground">— {tone}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/$subject/$topic/practice"
              params={{ subject: subject.slug, topic: topic.slug }}
              className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-paper hover:opacity-90"
            >
              Retry topic
            </Link>
            <Link
              to="/$subject"
              params={{ subject: subject.slug }}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-ink hover:bg-secondary"
            >
              Pick another topic
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-ink hover:bg-secondary"
            >
              Home
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-ink">Review</h2>
          <ol className="space-y-3">
            {results.items.map((it, idx) => {
              const ok = it.chosen === it.correct;
              return (
                <li
                  key={idx}
                  className="rounded-xl border border-border bg-card p-4"
                  style={{
                    borderColor: ok ? "var(--sage)" : "var(--clay)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: ok ? "var(--sage)" : "var(--clay)" }}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{it.question}</p>
                      <p className="mt-2 text-sm text-charcoal">
                        <span className="text-muted-foreground">Correct:</span>{" "}
                        {it.options[it.correct]}
                      </p>
                      {!ok && it.chosen >= 0 && (
                        <p className="mt-1 text-sm text-charcoal">
                          <span className="text-muted-foreground">Your answer:</span>{" "}
                          {it.options[it.chosen]}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground">
                        {it.explanation}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
    </div>
  );
}
