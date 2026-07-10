import { createFileRoute, Link, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  subjectsQuery,
  questionsQuery,
  getQuestionsFor,
  resolveSubject,
  resolveTopic,
  type Question,
  type Subject,
  type Topic,
} from "@/lib/content";
import { markStudiedToday } from "@/lib/streak";
import { recordScore } from "@/lib/scores";
import { SiteHeader } from "@/components/SiteHeader";
import { NotFoundShell } from "@/components/NotFoundShell";
import { loadOrCreate, save, clear, startNew, defaultConfig, type Session } from "@/lib/quiz-session";
import { MathText } from "@/components/MathText";
import { ExamTimer } from "@/components/ExamTimer";
import { HintButton } from "@/components/HintButton";

export const Route = createFileRoute("/$subject/$topic/practice")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = resolveSubject(subjects, params.subject);
    if (!subject) throw notFound();
    // Allow "mix" pseudo-topic used by the multi-topic practice picker.
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
        to: "/$subject/$topic/practice",
        params: { subject: subject.slug, topic: topic.slug },
      });
    }
    await context.queryClient.ensureQueryData(questionsQuery);
    return { subject, topic } as { subject: Subject; topic: Topic };
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
  notFoundComponent: () => <NotFoundShell />,
  errorComponent: ({ error }) => (
    <NotFoundShell title="Couldn't start practice" message={error.message} />
  ),
  component: PracticePage,
});

function PracticePage() {
  const { subject, topic } = Route.useLoaderData();
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const navigate = useNavigate();

  const pool = useMemo(
    () =>
      topic.slug === "mix"
        ? questions.filter((q) => q.subject === subject.slug)
        : getQuestionsFor(questions, subject.slug, topic.slug),
    [questions, subject.slug, topic.slug],
  );

  // Hydrate the session deterministically (no Math.random in render).
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    if (pool.length === 0) return;
    setSession(loadOrCreate(subject.slug, topic.slug, pool));
  }, [pool, subject.slug, topic.slug]);

  const isExam = session?.config?.mode === "exam";
  const set: Question[] = useMemo(
    () => (session ? session.order.map((idx) => pool[idx]).filter(Boolean) : []),
    [session, pool],
  );
  const timeLimit = session?.config?.timeLimitSec ?? 0;

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!session || set.length === 0) return;
      const i = session.current;
      const picked = session.answers[i];
      if (/^[1-4]$/.test(e.key)) {
        choose(Number(e.key) - 1);
      } else if ((e.key === "Enter" || e.key === " ") && (isExam || picked !== null)) {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (pool.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl">No questions yet for this topic</h1>
          <Link to="/$subject" params={{ subject: subject.slug }} className="mt-4 inline-block text-amber hover:underline">← Back to {subject.name}</Link>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">Loading exam…</main>
      </div>
    );
  }

  const i = session.current;
  const q = set[i];
  const picked = session.answers[i];
  const answered = session.answers.filter((a) => a !== null).length;
  const completion = Math.round((answered / set.length) * 100);

  function update(patch: Partial<Session>) {
    if (!session) return;
    const next = { ...session, ...patch };
    setSession(next); save(next);
  }

  function choose(idx: number) {
    if (!session) return;
    // In MCQ mode: lock once answered. In exam mode: allow changing.
    if (!isExam && session.answers[i] !== null) return;
    const answers = [...session.answers];
    answers[i] = idx;
    update({ answers });
  }

  function next() {
    if (!session) return;
    if (i + 1 >= set.length) { finish(); return; }
    update({ current: i + 1 });
  }

  function prev() {
    if (!session || i === 0) return;
    update({ current: i - 1 });
  }

  function jumpTo(n: number) { update({ current: n }); }

  function finish() {
    if (!session) return;
    const final = session.answers.reduce<number>((acc, a, idx) => acc + (a === set[idx]?.correct ? 1 : 0), 0);
    markStudiedToday();
    recordScore(subject.slug, topic.slug, final, set.length);
    sessionStorage.setItem(
      "ol-last-results",
      JSON.stringify({
        subject: subject.slug,
        topic: topic.slug,
        score: final,
        total: set.length,
        mode: session.config?.mode ?? "mcq",
        durationSec: Math.floor((Date.now() - session.startedAt) / 1000),
        items: set.map((it, idx) => ({
          question: it.question,
          options: it.options,
          correct: it.correct,
          explanation: it.explanation,
          chosen: session.answers[idx] ?? -1,
        })),
      }),
    );
    clear(subject.slug, topic.slug);
    navigate({
      to: "/$subject/$topic/results",
      params: { subject: subject.slug, topic: topic.slug },
    });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Exam top bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <Link to="/$subject/$topic" params={{ subject: subject.slug, topic: topic.slug }} className="text-muted-foreground hover:text-foreground" title="Exit exam">← Exit</Link>
            <span className="text-muted-foreground">{subject.name} · {topic.name}</span>
          </div>
          <div className="flex items-center gap-4">
            {timeLimit > 0 && (
              <ExamTimer
                storageKey={`ol-timer-${subject.slug}-${topic.slug}-${session.attemptId}`}
                durationSec={timeLimit}
                onExpire={finish}
              />
            )}
            <span className="font-num text-muted-foreground">{answered}/{set.length} answered · {completion}%</span>
            <button onClick={() => { if (confirm("Submit exam now?")) finish(); }} className="rounded-md bg-amber text-background px-3 py-1.5 text-xs font-semibold">Submit</button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--hairline)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${completion}%`, background: "var(--amber)" }} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
          <article className="glass-panel rounded-2xl p-6 sm:p-8 rise">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">Question {i + 1} of {set.length}</p>
              <span className="text-[11px] text-muted-foreground">1 mark</span>
            </div>
            <h1 className="mt-3 text-xl font-medium leading-snug text-foreground sm:text-2xl"><MathText>{q.question}</MathText></h1>

            <ul className="mt-6 space-y-2.5">
              {q.options.map((opt, idx) => {
                const chosen = picked === idx;
                const reveal = !isExam && picked !== null;
                const isCorrect = reveal && idx === q.correct;
                const isWrongPick = reveal && chosen && idx !== q.correct;
                let cls = "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition";
                if (reveal) {
                  if (isCorrect) cls += " border-mint bg-mint/10";
                  else if (isWrongPick) cls += " border-coral bg-coral/10";
                  else cls += " border-hairline opacity-60";
                } else {
                  cls += chosen ? " border-amber bg-amber/[0.08]" : " border-hairline hover:border-foreground/40";
                }
                return (
                  <li key={idx}>
                    <button type="button" onClick={() => choose(idx)} className={cls}>
                      <span className={`font-num text-xs ${chosen ? "text-amber" : "text-muted-foreground"} pt-0.5`}>{String.fromCharCode(65 + idx)}</span>
                      <span className="text-charcoal"><MathText>{opt}</MathText></span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {!isExam && picked !== null && (
              <div className="mt-5 rounded-xl p-4 text-sm hairline" style={{ background: picked === q.correct ? "color-mix(in srgb, var(--mint) 8%, transparent)" : "color-mix(in srgb, var(--coral) 8%, transparent)" }}>
                <p className="font-semibold" style={{ color: picked === q.correct ? "var(--mint)" : "var(--coral)" }}>
                  {picked === q.correct ? "Correct" : "Not quite"}
                </p>
                <p className="mt-1 text-charcoal"><MathText>{q.explanation}</MathText></p>
              </div>
            )}

            {!isExam && (
              <HintButton
                subject={subject.slug}
                topic={topic.slug}
                question={q.question}
                options={q.options}
              />
            )}

            <div className="mt-6 flex items-center justify-between gap-2">
              <button onClick={prev} disabled={i === 0} className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-surface-2">← Prev</button>
              <div className="text-xs text-muted-foreground hidden sm:block">Keys: 1–4 answer · ←/→ navigate · Enter next</div>
              <button onClick={next} disabled={!isExam && picked === null} className="rounded-lg bg-foreground text-background px-5 py-2 text-sm font-semibold disabled:opacity-40">
                {i + 1 >= set.length ? "Finish" : "Next →"}
              </button>
            </div>
          </article>

          {/* Question navigation panel */}
          <aside className="glass-panel rounded-2xl p-4 h-fit lg:sticky lg:top-20">
            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Navigator</p>
            <div className="grid grid-cols-5 gap-1.5 lg:grid-cols-4">
              {set.map((_, n) => {
                const a = session.answers[n];
                const isCur = n === i;
                let cls = "h-8 w-full rounded-md border text-xs font-num transition ";
                if (isCur) cls += "border-amber bg-amber text-background";
                else if (a !== null) cls += "border-mint/50 bg-mint/15 text-foreground";
                else cls += "border-hairline text-muted-foreground hover:border-foreground/40";
                return <button key={n} onClick={() => jumpTo(n)} className={cls}>{n + 1}</button>;
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
              <Legend swatch="bg-amber" label="Current" />
              <Legend swatch="bg-mint/40" label="Answered" />
              <Legend swatch="bg-transparent border border-hairline" label="Unanswered" />
            </div>
            <button
              onClick={() => {
                if (!confirm("Reset this attempt with a new shuffle?")) return;
                const s = startNew(subject.slug, topic.slug, pool, session.config ?? defaultConfig());
                setSession(s);
              }}
              className="mt-4 w-full rounded-md border border-hairline px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Reshuffle attempt
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-3 w-3 rounded-sm ${swatch}`} />
      <span>{label}</span>
    </div>
  );
}
