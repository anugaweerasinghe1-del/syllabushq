import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  subjectsQuery,
  questionsQuery,
  countByTopic,
  resolveSubject,
  resolveTopic,
  type Subject,
  type Topic,
} from "@/lib/content";
import { lastScoreFor } from "@/lib/scores";
import { SiteHeader } from "@/components/SiteHeader";
import { NotFoundShell } from "@/components/NotFoundShell";
import { startNew, type QuizConfig } from "@/lib/quiz-session";
import { getQuestionsFor } from "@/lib/content";
import { Slider } from "@/components/ui/slider";
import { useServerFn } from "@tanstack/react-start";
import { ensureQuestions } from "@/lib/bank.functions";
import { savePickedPool } from "@/lib/quiz-session";

export const Route = createFileRoute("/$subject/$topic/")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = resolveSubject(subjects, params.subject);
    if (!subject) throw notFound();
    const topic =
      params.topic === "mix"
        ? ({ slug: "mix", name: "Mixed topics" } as Topic)
        : (resolveTopic(subject, params.topic) ?? subject.topics[0]);
    if (!topic) throw notFound();
    await context.queryClient.ensureQueryData(questionsQuery);
    return { subject, topic } as { subject: Subject; topic: Topic };
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
  notFoundComponent: () => <NotFoundShell />,
  errorComponent: ({ error }) => (
    <NotFoundShell title="Couldn't load that topic" message={error.message} />
  ),
  component: TopicPage,
});

type Mode = "mcq" | "structured" | "short" | "exam";

const MODES: { id: Mode; name: string; tag: string; blurb: string }[] = [
  {
    id: "mcq",
    name: "Multiple Choice",
    tag: "Quickfire",
    blurb: "Instant feedback, 1 mark each. Best for daily drilling.",
  },
  {
    id: "structured",
    name: "Structured Paper",
    tag: "Paper II style",
    blurb: "Multi-part questions with model answers. Self-graded.",
  },
  {
    id: "short",
    name: "Short Answer",
    tag: "Typed responses",
    blurb: "Open-ended prompts. Compare against marking points.",
  },
  {
    id: "exam",
    name: "Full Exam Simulation",
    tag: "Timed",
    blurb: "Long timed paper. No feedback until the end.",
  },
];

const TIPS = [
  "Read every option before you commit.",
  "Mark allocation tells you how much to write.",
  "Underline the command word: define, explain, evaluate.",
  "Time per mark ≈ total minutes ÷ total marks.",
  "Bring back wrong answers — that's where growth lives.",
  "Past papers > random questions. Repeat them.",
  "Sleep before exam day. Cramming taxes recall.",
];

function TopicPage() {
  const { subject, topic } = Route.useLoaderData();
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const navigate = useNavigate();
  const topUp = useServerFn(ensureQuestions);
  const counts = countByTopic(questions);
  const available = counts.get(`${subject.slug}::${topic.slug}`) ?? 0;
  const pool = useMemo(
    () => getQuestionsFor(questions, subject.slug, topic.slug),
    [questions, subject.slug, topic.slug],
  );

  const [last, setLast] = useState<ReturnType<typeof lastScoreFor>>(null);
  useEffect(() => {
    setLast(lastScoreFor(subject.slug, topic.slug));
  }, [subject.slug, topic.slug]);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<Mode>("mcq");
  const [count, setCount] = useState(10);
  const [timeMin, setTimeMin] = useState(0); // 0 = untimed
  const [difficulty, setDifficulty] = useState<QuizConfig["difficulty"]>("all");
  const [tipIdx, setTipIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  // Loading screen lifecycle
  useEffect(() => {
    if (step !== 3) return;
    setProgress(0);
    setTipIdx(Math.floor(Math.random() * TIPS.length));
    const tipTimer = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 2200);
    const start = Date.now();
    const DURATION = 2400;
    const tick = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / DURATION);
      setProgress(p);
      if (p >= 1) clearInterval(tick);
    }, 50);
    let cancelled = false;
    const launch = setTimeout(async () => {
      if (mode === "structured" || mode === "short") {
        navigate({ to: "/structured" });
        return;
      }
      // mcq or exam — start a fresh session with config. If the local bank is
      // short of the requested count, top it up with fresh AI questions.
      let picked = pool;
      if (picked.length < count) {
        try {
          const res = await topUp({
            data: {
              mode: "mcq",
              subject: subject.slug,
              topics: topic.slug === "mix" ? [] : [topic.slug],
              difficulty,
              need: Math.min(30, count - picked.length),
              avoid: picked.slice(0, 25).map((q) => q.question),
            },
          });
          const fresh = (res.items as typeof pool).map((q) => ({
            ...q,
            subject: subject.slug,
            topic: topic.slug,
          }));
          if (fresh.length) picked = [...picked, ...fresh];
        } catch {
          /* keep the local-only paper */
        }
      }
      if (cancelled) return;
      const cfg: QuizConfig = {
        count: Math.min(count, Math.max(1, picked.length)),
        timeLimitSec: timeMin * 60,
        difficulty,
        mode: mode === "exam" ? "exam" : "mcq",
      };
      if (picked.length > 0) {
        savePickedPool(subject.slug, topic.slug, picked);
        startNew(subject.slug, topic.slug, picked, cfg);
      }
      navigate({
        to: "/$subject/$topic/practice",
        params: { subject: subject.slug, topic: topic.slug },
      });
    }, DURATION + 200);
    return () => {
      cancelled = true;
      clearInterval(tipTimer);
      clearInterval(tick);
      clearTimeout(launch);
    };
  }, [step, mode, count, timeMin, difficulty, pool, subject.slug, topic.slug, navigate, topUp]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-4 text-sm">
          <Link
            to="/$subject"
            params={{ subject: subject.slug }}
            className="text-muted-foreground hover:text-foreground"
          >
            ← {subject.name}
          </Link>
        </nav>

        <header className="mb-8 rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-orange">
            {subject.name}
          </p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{topic.name}</h1>
          <p className="mt-3 max-w-xl text-charcoal text-balance">
            <span className="font-num text-foreground">{available}</span> questions in the bank. Set
            up your practice — choose how you want to be tested.
          </p>
        </header>

        {last && step === 1 && (
          <div className="mb-6 glass-panel rounded-xl p-4 rise-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Last attempt
            </p>
            <p className="mt-1 text-foreground">
              <span className="font-num text-lg">{last.score}</span>
              <span className="text-muted-foreground"> / </span>
              <span className="font-num text-lg">{last.total}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({Math.round((last.score / last.total) * 100)}%)
              </span>
            </p>
          </div>
        )}

        {/* Stepper */}
        {step !== 3 && (
          <ol className="mb-6 flex items-center gap-2 text-xs">
            {[1, 2].map((n) => (
              <li
                key={n}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${step === n ? "bg-primary/15 text-orange" : "text-muted-foreground"}`}
              >
                <span className="font-num">{n}</span>
                <span>{n === 1 ? "Mode" : "Customize"}</span>
              </li>
            ))}
          </ol>
        )}

        {step === 1 && (
          <section className="grid gap-3 sm:grid-cols-2 rise-2">
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`group text-left rounded-2xl p-5 transition hairline ${active ? "bg-primary/[0.06] border-primary/60" : "hover:border-primary/30"}`}
                  style={active ? { borderColor: "var(--primary)" } : undefined}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-orange">
                      {m.tag}
                    </p>
                    <span
                      className={`h-3 w-3 rounded-full border ${active ? "border-primary bg-primary" : "border-hairline"}`}
                      style={
                        active
                          ? { background: "var(--primary)", borderColor: "var(--primary)" }
                          : undefined
                      }
                    />
                  </div>
                  <h3 className="mt-2 text-xl font-medium text-foreground">{m.name}</h3>
                  <p className="mt-1 text-sm text-charcoal">{m.blurb}</p>
                </button>
              );
            })}

            <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
              <button
                onClick={() => setStep(2)}
                className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
              >
                Continue →
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5 rise-2">
            <div className="glass-panel rounded-2xl p-5 space-y-5">
              <Field label="Subject">
                <div className="text-foreground">{subject.name}</div>
              </Field>
              <Field label="Topic">
                <div className="text-foreground">{topic.name}</div>
              </Field>

              <Field label="Difficulty">
                <div className="flex flex-wrap gap-2">
                  {(["all", "easy", "medium", "hard"] as const).map((d) => (
                    <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                      {d}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label={`Number of questions (${count})`}>
                <Slider
                  value={[count]}
                  min={5}
                  max={50}
                  step={5}
                  onValueChange={(v) => setCount(v[0] ?? count)}
                  className="mt-1"
                />
                <div className="mt-2 flex justify-between text-[10px] font-num text-muted-foreground">
                  <span>5</span>
                  <span>20</span>
                  <span>35</span>
                  <span>50</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-3">
                  {[5, 10, 20, 30, 50].map((n) => (
                    <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                      {n}
                    </Chip>
                  ))}
                </div>
                {count > available && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {available} in the bank — the rest are generated fresh for you at start.
                  </p>
                )}
              </Field>

              <Field label={`Time limit (${timeMin === 0 ? "untimed" : timeMin + " min"})`}>
                <div className="flex flex-wrap gap-2">
                  {[0, 10, 20, 30, 45, 60].map((t) => (
                    <Chip key={t} active={timeMin === t} onClick={() => setTimeMin(t)}>
                      {t === 0 ? "Untimed" : `${t}m`}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-hairline px-5 py-2.5 text-sm font-medium hover:bg-surface-2"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold transition hover:brightness-110"
              >
                Start exam →
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="rise mt-4 flex flex-col items-center text-center">
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="var(--hairline)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="var(--primary)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={(1 - progress) * 2 * Math.PI * 44}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 80ms linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-num text-lg">
                {Math.round(progress * 100)}%
              </div>
            </div>
            <h2 className="mt-6 text-2xl">Preparing your personalised exam</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {subject.name} · {topic.name} ·{" "}
              {mode === "exam" ? "Full Simulation" : mode === "mcq" ? "MCQ" : mode}
            </p>
            <p key={tipIdx} className="mt-8 max-w-md text-charcoal italic rise">
              {TIPS[tipIdx]}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition border ${active ? "bg-primary text-primary-foreground border-primary" : "border-hairline text-charcoal hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}
