import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  subjectsQuery,
  resolveSubject,
  resolveTopic,
  type Subject,
  type Topic,
} from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { NotFoundShell } from "@/components/NotFoundShell";
import { MathText } from "@/components/MathText";

type ResultItem = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic?: string;
  chosen: number;
};

type Results = {
  subject: string;
  topic: string;
  score: number;
  total: number;
  mode?: string;
  durationSec?: number;
  items: ResultItem[];
};

export const Route = createFileRoute("/$subject/$topic/results")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = resolveSubject(subjects, params.subject);
    if (!subject) throw notFound();
    // "mix" is the pseudo-topic used by the multi-topic practice picker.
    const topic =
      params.topic === "mix"
        ? ({ slug: "mix", name: "Mixed topics" } as Topic)
        : resolveTopic(subject, params.topic);
    if (!topic) throw notFound({ data: { subjectSlug: subject.slug } });
    if (
      subject.slug !== params.subject ||
      (params.topic !== "mix" && topic.slug !== params.topic)
    ) {
      throw redirect({
        to: "/$subject/$topic/results",
        params: { subject: subject.slug, topic: topic.slug },
      });
    }
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
  notFoundComponent: () => (
    <NotFoundShell
      title="Results not found"
      message="Finish a practice paper to see your score here."
    />
  ),
  errorComponent: ({ error }) => (
    <NotFoundShell title="Couldn't load your results" message={error instanceof Error ? error.message : String(error)} />
  ),
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
          <p className="mt-2 text-muted-foreground">Start a practice set to see your score here.</p>
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
  const message =
    pct >= 90
      ? "Exam-ready performance. Lock it in with one more pass."
      : pct >= 75
        ? "You're in the top band. Sharpen the misses below."
        : pct >= 50
          ? "Foundation is there. Focus the next session on the wrong answers."
          : pct >= 25
            ? "Keep going — most students improve 30%+ in their second attempt."
            : "Every expert started here. Re-read the topic, then retry.";

  const wrong = results.items.filter((it) => it.chosen !== it.correct);
  const correctCount = results.total - wrong.length;
  const unanswered = results.items.filter((it) => it.chosen < 0).length;

  // Per-topic accuracy, weakest first.
  const topicName = (slug: string) =>
    subject.topics.find((t) => t.slug === slug)?.name ?? (slug === "mix" ? "Mixed" : slug);
  const tally = new Map<string, { right: number; total: number }>();
  for (const it of results.items) {
    const k = it.topic ?? topic.slug;
    const row = tally.get(k) ?? { right: 0, total: 0 };
    row.total++;
    if (it.chosen === it.correct) row.right++;
    tally.set(k, row);
  }
  const topicRows = [...tally.entries()]
    .map(([slug, r]) => ({ slug, name: topicName(slug), ...r, pct: Math.round((r.right / r.total) * 100) }))
    .sort((a, b) => a.pct - b.pct);
  const weakest = topicRows.filter((r) => r.pct < 70 && r.slug !== "mix").slice(0, 3);

  const recs: string[] = [];
  if (unanswered > 0)
    recs.push(`Answer all ${results.total} questions next time — ${unanswered} were left blank.`);
  if (pct < 70) recs.push(`Re-read ${topic.name} in your textbook before retrying.`);
  if (wrong.length >= 3)
    recs.push(`Drill the ${wrong.length} questions you missed — review explanations below.`);
  if (results.durationSec && results.durationSec < results.total * 20)
    recs.push("Slow down — you finished faster than 20s per question.");
  if (recs.length === 0) recs.push("Try a harder topic or a Full Exam Simulation to push further.");

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="glass-panel rounded-2xl p-6 sm:p-8 rise">
          <p className="text-xs font-medium uppercase tracking-wider text-orange">
            {subject.name} · {topic.name}
          </p>
          <div className="mt-2 flex items-end gap-6 flex-wrap">
            <h1 className="text-5xl sm:text-6xl">
              <span className="font-num">{results.score}</span>
              <span className="text-muted-foreground">/{results.total}</span>
            </h1>
            <div className="pb-1">
              <p className="text-2xl font-num text-orange">{pct}%</p>
              <p className="text-sm text-muted-foreground">{tone}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Stat label="Correct" value={correctCount} tone="mint" />
            <Stat label="Incorrect" value={wrong.length - unanswered} tone="coral" />
            <Stat label="Blank" value={unanswered} tone="muted" />
          </div>

          <p className="mt-6 text-charcoal text-balance italic">{message}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/$subject/$topic/practice"
              params={{ subject: subject.slug, topic: topic.slug }}
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90"
            >
              Retry
            </Link>
            <Link
              to="/$subject/$topic"
              params={{ subject: subject.slug, topic: topic.slug }}
              className="inline-flex items-center justify-center rounded-lg border border-hairline px-5 py-3 text-sm font-medium hover:bg-surface-2"
            >
              New configuration
            </Link>
            <Link
              to="/$subject"
              params={{ subject: subject.slug }}
              className="inline-flex items-center justify-center rounded-lg border border-hairline px-5 py-3 text-sm font-medium hover:bg-surface-2"
            >
              Another topic
            </Link>
          </div>
        </section>

        {topicRows.length > 0 && (
          <section className="mt-6 glass-panel rounded-2xl p-6 rise-2">
            <h2 className="text-xl">Your weak topics</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Accuracy per topic in this paper — weakest first.
            </p>
            <ul className="mt-4 space-y-3">
              {topicRows.map((r) => (
                <li key={r.slug}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-foreground">{r.name}</span>
                    <span className="font-num text-muted-foreground">
                      {r.right}/{r.total} · {r.pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(4, r.pct)}%`,
                        background:
                          r.pct >= 70 ? "var(--sage)" : r.pct >= 40 ? "var(--orange)" : "var(--clay)",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {weakest.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {weakest.map((r) => (
                  <Link
                    key={r.slug}
                    to="/$subject/$topic"
                    params={{ subject: subject.slug, topic: r.slug }}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Drill {r.name} →
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="mt-6 glass-panel rounded-2xl p-6 rise-3">
          <h2 className="text-xl">Improvement recommendations</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-charcoal">
            {recs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-xl">Review</h2>
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
                      <p className="font-medium text-ink">
                        <MathText>{it.question}</MathText>
                      </p>
                      <p className="mt-2 text-sm text-foreground/90">
                        <span className="text-muted-foreground">Correct:</span>{" "}
                        <MathText>{it.options[it.correct]}</MathText>
                      </p>
                      {!ok && it.chosen >= 0 && (
                        <p className="mt-1 text-sm text-foreground/90">
                          <span className="text-muted-foreground">Your answer:</span>{" "}
                          <MathText>{it.options[it.chosen]}</MathText>
                        </p>
                      )}
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        <MathText>{it.explanation}</MathText>
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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "mint" | "coral" | "muted";
}) {
  const color =
    tone === "mint" ? "var(--mint)" : tone === "coral" ? "var(--coral)" : "var(--muted-foreground)";
  return (
    <div className="hairline rounded-xl p-3">
      <p className="font-num text-2xl" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
