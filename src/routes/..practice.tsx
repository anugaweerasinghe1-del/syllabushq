import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  subjectsQuery,
  questionsQuery,
  getQuestionsFor,
  type Subject,
  type Topic,
} from "@/lib/content";
import { markStudiedToday } from "@/lib/streak";
import { recordScore } from "@/lib/scores";
import { SiteHeader } from "@/components/SiteHeader";
import {
  loadOrCreate,
  startNew,
  save as saveSession,
  clear as clearSession,
  type Session,
} from "@/lib/quiz-session";

export const Route = createFileRoute("/$subject/$topic/practice")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s: Subject) => s.slug === params.subject);
    if (!subject) throw notFound();
    const topic = subject.topics.find((t: Topic) => t.slug === params.topic);
    if (!topic) throw notFound();
    await context.queryClient.ensureQueryData(questionsQuery);
    return { subject, topic } as { subject: Subject; topic: Topic };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.topic.name} MCQ practice — ${loaderData.subject.name} O/L` },
          { name: "description", content: `Free 10-question O/L practice quiz on ${loaderData.topic.name} (${loaderData.subject.name}) with explanations.` },
          { name: "robots", content: "noindex" },
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

  // Persisted, deterministic session — fixes the "questions switch on
  // navigation / re-render" glitch by reading the same stored order instead
  // of re-rolling `Math.random()` on every mount.
  const [session, setSession] = useState<Session | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    if (pool.length === 0) return;
    initRef.current = true;
    setSession(loadOrCreate(subject.slug, topic.slug, pool));
  }, [pool, subject.slug, topic.slug]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!session) return;
      const q = pool[session.order[session.current]];
      if (!q) return;
      const answered = session.answers[session.current] !== null;
      if (!answered && /^[1-4]$/.test(e.key)) choose(Number(e.key) - 1);
      else if (answered && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (pool.length === 0) {
    return (
      <Shell>
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground">No questions yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">This topic's bank is empty.</p>
          <Link to="/$subject" params={{ subject: subject.slug }} className="mt-6 inline-block text-amber hover:underline">
            ← Back to {subject.name}
          </Link>
        </main>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <main className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-muted-foreground">
          Loading…
        </main>
      </Shell>
    );
  }

  const idx = session.current;
  const q = pool[session.order[idx]];
  const picked = session.answers[idx];
  const total = session.order.length;
  const score = session.answers.reduce(
    (acc, a, i) => acc + (a !== null && a === pool[session.order[i]].correct ? 1 : 0),
    0,
  );
  const progress = ((idx + (picked !== null ? 1 : 0)) / total) * 100;

  function choose(opt: number) {
    if (!session) return;
    if (session.answers[idx] !== null) return;
    const answers = [...session.answers];
    answers[idx] = opt;
    const next: Session = { ...session, answers };
    setSession(next);
    saveSession(next);
  }

  function next() {
    if (!session) return;
    if (session.answers[idx] === null) return;
    if (idx + 1 >= total) return finish();
    const n: Session = { ...session, current: idx + 1 };
    setSession(n);
    saveSession(n);
  }

  function finish() {
    if (!session) return;
    markStudiedToday();
    recordScore(subject.slug, topic.slug, score, total);
    sessionStorage.setItem(
      "ol-last-results",
      JSON.stringify({
        subject: subject.slug,
        topic: topic.slug,
        score,
        total,
        items: session.order.map((poolIdx, i) => {
          const it = pool[poolIdx];
          return {
            question: it.question,
            options: it.options,
            correct: it.correct,
            explanation: it.explanation,
            chosen: session.answers[i] ?? -1,
          };
        }),
      }),
    );
    clearSession(subject.slug, topic.slug);
    navigate({
      to: "/$subject/$topic/results",
      params: { subject: subject.slug, topic: topic.slug },
    });
  }

  function restart() {
    const s = startNew(subject.slug, topic.slug, pool);
    setSession(s);
  }

  return (
    <Shell>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
          <Link
            to="/$subject/$topic"
            params={{ subject: subject.slug, topic: topic.slug }}
            className="hover:text-foreground"
          >
            ← Exit
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="text-xs uppercase tracking-wider hover:text-foreground"
            >
              Restart
            </button>
            <span className="font-num">{idx + 1} / {total}</span>
          </div>
        </div>

        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: "var(--amber)" }}
          />
        </div>

        <article className="glass-panel rounded-2xl p-5 sm:p-7 rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">
            {subject.name} · {topic.name}
          </p>
          <h1 className="mt-3 font-display text-2xl leading-snug text-foreground sm:text-3xl text-balance">
            {q.question}
          </h1>

          <ul className="mt-6 space-y-2">
            {q.options.map((opt, oi) => {
              const isCorrect = picked !== null && oi === q.correct;
              const isWrongPick = picked !== null && oi === picked && oi !== q.correct;
              let cls = "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition";
              if (picked === null) {
                cls += " border-hairline bg-surface hover:border-amber/60 hover:bg-secondary";
              } else if (isCorrect) {
                cls += " border-[color:var(--mint)] bg-[color:var(--mint)]/10";
              } else if (isWrongPick) {
                cls += " border-[color:var(--coral)] bg-[color:var(--coral)]/10";
              } else {
                cls += " border-hairline bg-surface opacity-50";
              }
              return (
                <li key={oi}>
                  <button
                    type="button"
                    onClick={() => choose(oi)}
                    disabled={picked !== null}
                    className={cls}
                  >
                    <span className="font-num text-xs text-muted-foreground">{oi + 1}</span>
                    <span className="text-foreground">{opt}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {picked !== null && (
            <div
              className="mt-6 rounded-xl border p-4 text-sm"
              style={{
                borderColor: picked === q.correct ? "color-mix(in srgb, var(--mint) 40%, transparent)" : "color-mix(in srgb, var(--coral) 40%, transparent)",
                background: picked === q.correct
                  ? "color-mix(in srgb, var(--mint) 8%, transparent)"
                  : "color-mix(in srgb, var(--coral) 8%, transparent)",
              }}
            >
              <p className="font-semibold" style={{ color: picked === q.correct ? "var(--mint)" : "var(--coral)" }}>
                {picked === q.correct ? "Correct" : "Not quite"}
              </p>
              <p className="mt-1 text-charcoal">{q.explanation}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Score: <span className="font-num text-foreground">{score}</span>
            </span>
            <button
              type="button"
              onClick={next}
              disabled={picked === null}
              className="inline-flex items-center justify-center rounded-lg bg-amber px-6 py-2.5 text-sm font-semibold text-[color:var(--bg)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {idx + 1 >= total ? "See results" : "Next"}
            </button>
          </div>
        </article>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          1–4 to answer · Enter for next · progress saves automatically
        </p>
      </main>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {children}
    </div>
  );
}
