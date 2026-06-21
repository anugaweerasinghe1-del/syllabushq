import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  subjectsQuery,
  questionsQuery,
  getQuestionsFor,
  pickRandom,
  type Question,
} from "@/lib/content";
import { markStudiedToday } from "@/lib/streak";
import { recordScore } from "@/lib/scores";
import { SiteHeader } from "@/components/SiteHeader";

const QUIZ_LEN = 10;

export const Route = createFileRoute("/$subject/$topic/practice")({
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
            title: `Practice: ${loaderData.topic.name} — ${loaderData.subject.name}`,
          },
          {
            name: "description",
            content: `10-question practice quiz for ${loaderData.topic.name}.`,
          },
        ]
      : [],
  }),
  component: PracticePage,
});

function PracticePage() {
  const { subject, topic } = Route.useLoaderData();
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const navigate = useNavigate();

  const pool = useMemo(
    () => getQuestionsFor(questions, subject.slug, topic.slug),
    [questions, subject.slug, topic.slug],
  );

  const [set, setSet] = useState<Question[]>(() => pickRandom(pool, QUIZ_LEN));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  // Re-seed when topic changes
  useEffect(() => {
    setSet(pickRandom(pool, QUIZ_LEN));
    setI(0);
    setPicked(null);
    setScore(0);
    setAnswers([]);
  }, [pool]);

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (set.length === 0) return;
      const q = set[i];
      if (!q) return;
      if (picked === null && /^[1-4]$/.test(e.key)) {
        choose(Number(e.key) - 1);
      } else if (picked !== null && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (pool.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-ink">
            No questions yet for this topic
          </h1>
          <Link
            to="/$subject"
            params={{ subject: subject.slug }}
            className="mt-4 inline-block text-marigold hover:underline"
          >
            ← Back to {subject.name}
          </Link>
        </main>
      </div>
    );
  }

  const q = set[i];
  const progress = ((i + (picked !== null ? 1 : 0)) / set.length) * 100;

  function choose(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    setAnswers((a) => [...a, idx]);
    if (idx === q.correct) setScore((s) => s + 1);
  }

  function next() {
    if (picked === null) return;
    if (i + 1 >= set.length) {
      finish();
      return;
    }
    setI((x) => x + 1);
    setPicked(null);
  }

  function finish() {
    const final = score; // already incremented
    markStudiedToday();
    recordScore(subject.slug, topic.slug, final, set.length);
    sessionStorage.setItem(
      "ol-last-results",
      JSON.stringify({
        subject: subject.slug,
        topic: topic.slug,
        score: final,
        total: set.length,
        items: set.map((it, idx) => ({
          question: it.question,
          options: it.options,
          correct: it.correct,
          explanation: it.explanation,
          chosen: answers[idx] ?? -1,
        })),
      }),
    );
    navigate({
      to: "/$subject/$topic/results",
      params: { subject: subject.slug, topic: topic.slug },
    });
  }

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
          <Link
            to="/$subject/$topic"
            params={{ subject: subject.slug, topic: topic.slug }}
            className="hover:text-ink"
          >
            ← Exit
          </Link>
          <span className="font-num">
            {i + 1} / {set.length}
          </span>
        </div>

        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-marigold transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <p className="text-xs font-medium uppercase tracking-wider text-marigold">
            {subject.name} · {topic.name}
          </p>
          <h1 className="mt-2 text-lg font-semibold leading-snug text-ink sm:text-xl">
            {q.question}
          </h1>

          <ul className="mt-5 space-y-2">
            {q.options.map((opt, idx) => {
              const isCorrect = picked !== null && idx === q.correct;
              const isWrongPick =
                picked !== null && idx === picked && idx !== q.correct;
              let cls =
                "flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition";
              if (picked === null) {
                cls += " border-border bg-paper hover:border-ink";
              } else if (isCorrect) {
                cls += " border-[color:var(--sage)] bg-[color:var(--sage)]/10";
              } else if (isWrongPick) {
                cls += " border-[color:var(--clay)] bg-[color:var(--clay)]/10";
              } else {
                cls += " border-border bg-paper opacity-60";
              }
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => choose(idx)}
                    disabled={picked !== null}
                    className={cls}
                  >
                    <span className="font-num text-xs text-muted-foreground">
                      {idx + 1}
                    </span>
                    <span className="text-charcoal">{opt}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {picked !== null && (
            <div
              className="mt-5 rounded-lg p-4 text-sm"
              style={{
                background:
                  picked === q.correct
                    ? "color-mix(in srgb, var(--sage) 12%, transparent)"
                    : "color-mix(in srgb, var(--clay) 12%, transparent)",
              }}
            >
              <p
                className="font-semibold"
                style={{
                  color: picked === q.correct ? "var(--sage)" : "var(--clay)",
                }}
              >
                {picked === q.correct ? "Correct" : "Not quite"}
              </p>
              <p className="mt-1 text-charcoal">{q.explanation}</p>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Score: <span className="font-num text-ink">{score}</span>
            </span>
            <button
              type="button"
              onClick={next}
              disabled={picked === null}
              className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {i + 1 >= set.length ? "See results" : "Next"}
            </button>
          </div>
        </article>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Tip: press 1–4 to answer, Enter for next.
        </p>
      </main>
    </div>
  );
}
