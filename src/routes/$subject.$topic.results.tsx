import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { subjectsQuery, type Subject, type Topic } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { MathText } from "@/components/MathText";

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
  mode?: string;
  durationSec?: number;
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
  const message =
    pct >= 90 ? "Exam-ready performance. Lock it in with one more pass." :
    pct >= 75 ? "You're in the top band. Sharpen the misses below." :
    pct >= 50 ? "Foundation is there. Focus the next session on the wrong answers." :
    pct >= 25 ? "Keep going — most students improve 30%+ in their second attempt." :
    "Every expert started here. Re-read the topic, then retry.";

  const wrong = results.items.filter((it) => it.chosen !== it.correct);
  const correctCount = results.total - wrong.length;
  const unanswered = results.items.filter((it) => it.chosen < 0).length;

  // Topic weakness: bucket wrong questions by the first few keywords in the prompt
  const buckets = new Map<string, number>();
  for (const it of wrong) {
    const key = it.question.split(/[?.,:]/)[0].split(/\s+/).slice(0, 4).join(" ");
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const weaknesses = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const recs: string[] = [];
  if (unanswered > 0) recs.push(`Answer all ${results.total} questions next time — ${unanswered} were left blank.`);
  if (pct < 70) recs.push(`Re-read ${topic.name} in your textbook before retrying.`);
  if (wrong.length >= 3) recs.push(`Drill the ${wrong.length} questions you missed — review explanations below.`);
  if (results.durationSec && results.durationSec < results.total * 20) recs.push("Slow down — you finished faster than 20s per question.");
  if (recs.length === 0) recs.push("Try a harder topic or a Full Exam Simulation to push further.");

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="glass-panel rounded-2xl p-6 sm:p-8 rise">
          <p className="text-xs font-medium uppercase tracking-wider text-marigold">
            {subject.name} · {topic.name}
          </p>
          <div className="mt-2 flex items-end gap-6 flex-wrap">
            <h1 className="text-5xl sm:text-6xl">
              <span className="font-num">{results.score}</span>
              <span className="text-muted-foreground">/{results.total}</span>
            </h1>
            <div className="pb-1">
              <p className="text-2xl font-num text-amber">{pct}%</p>
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
              className="inline-flex items-center justify-center rounded-lg bg-amber text-background px-5 py-3 text-sm font-semibold hover:opacity-90"
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

        {weaknesses.length > 0 && (
          <section className="mt-6 glass-panel rounded-2xl p-6 rise-2">
            <h2 className="text-xl">Topic weaknesses</h2>
            <p className="mt-1 text-sm text-muted-foreground">Where you lost the most marks.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {weaknesses.map(([k, n]) => (
                <li key={k} className="flex items-center justify-between gap-3 rounded-lg border border-hairline px-3 py-2">
                  <span className="text-charcoal truncate">{k}…</span>
                  <span className="font-num text-coral">×{n}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6 glass-panel rounded-2xl p-6 rise-3">
          <h2 className="text-xl">Improvement recommendations</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-charcoal">
            {recs.map((r) => <li key={r}>{r}</li>)}
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
                      <p className="font-medium text-ink"><MathText>{it.question}</MathText></p>
                      <p className="mt-2 text-sm text-charcoal">
                        <span className="text-muted-foreground">Correct:</span>{" "}
                        <MathText>{it.options[it.correct]}</MathText>
                      </p>
                      {!ok && it.chosen >= 0 && (
                        <p className="mt-1 text-sm text-charcoal">
                          <span className="text-muted-foreground">Your answer:</span>{" "}
                          <MathText>{it.options[it.chosen]}</MathText>
                        </p>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground">
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

function Stat({ label, value, tone }: { label: string; value: number; tone: "mint" | "coral" | "muted" }) {
  const color = tone === "mint" ? "var(--mint)" : tone === "coral" ? "var(--coral)" : "var(--muted-foreground)";
  return (
    <div className="hairline rounded-xl p-3">
      <p className="font-num text-2xl" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
