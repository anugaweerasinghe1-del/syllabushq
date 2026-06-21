import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { subjectsQuery, type Subject, type Topic } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";

type ResultItem = { question: string; options: string[]; correct: number; explanation: string; chosen: number };
type Results = { subject: string; topic: string; score: number; total: number; items: ResultItem[] };

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
    meta: loaderData ? [{ title: `Results — ${loaderData.topic.name}` }, { name: "robots", content: "noindex" }] : [],
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
      if (parsed.subject === subject.slug && parsed.topic === topic.slug) setResults(parsed);
    } catch { /* ignore */ }
  }, [subject.slug, topic.slug]);

  if (!results) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground">No recent results</h1>
          <p className="mt-2 text-muted-foreground">Start a practice set to see your score here.</p>
          <Link to="/$subject/$topic/practice" params={{ subject: subject.slug, topic: topic.slug }} className="mt-6 inline-block rounded-lg bg-amber px-5 py-3 text-sm font-semibold text-[color:var(--bg)]">
            Start practice
          </Link>
        </main>
      </div>
    );
  }

  const pct = Math.round((results.score / results.total) * 100);
  const tone = pct >= 80 ? "Strong work." : pct >= 50 ? "Solid. Keep going." : "Worth another pass.";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="glass-panel rounded-2xl p-7 sm:p-10 rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">{subject.name} · {topic.name}</p>
          <h1 className="mt-3 font-display text-6xl text-foreground sm:text-7xl">
            <span className="font-num">{results.score}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-num">{results.total}</span>
          </h1>
          <p className="mt-2 text-lg text-charcoal">
            <span className="font-num text-amber">{pct}%</span>{" "}
            <span className="text-muted-foreground">— {tone}</span>
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/$subject/$topic/practice" params={{ subject: subject.slug, topic: topic.slug }} className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-3 text-sm font-semibold text-[color:var(--bg)] transition hover:brightness-110">
              Retry topic
            </Link>
            <Link to="/$subject" params={{ subject: subject.slug }} className="inline-flex items-center justify-center rounded-lg border border-hairline px-5 py-3 text-sm font-medium text-foreground transition hover:bg-secondary">
              Pick another topic
            </Link>
            <Link to="/" className="inline-flex items-center justify-center rounded-lg border border-hairline px-5 py-3 text-sm font-medium text-foreground transition hover:bg-secondary">
              Home
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl text-foreground">Review</h2>
          <ol className="space-y-3">
            {results.items.map((it, idx) => {
              const ok = it.chosen === it.correct;
              return (
                <li key={idx} className="rounded-xl border bg-surface p-4" style={{ borderColor: ok ? "color-mix(in srgb, var(--mint) 35%, var(--hairline))" : "color-mix(in srgb, var(--coral) 35%, var(--hairline))" }}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[color:var(--bg)]" style={{ background: ok ? "var(--mint)" : "var(--coral)" }}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{it.question}</p>
                      <p className="mt-2 text-sm text-charcoal"><span className="text-muted-foreground">Correct:</span> {it.options[it.correct]}</p>
                      {!ok && it.chosen >= 0 && (
                        <p className="mt-1 text-sm text-charcoal"><span className="text-muted-foreground">Your answer:</span> {it.options[it.chosen]}</p>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground">{it.explanation}</p>
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
