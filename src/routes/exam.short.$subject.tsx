import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { MathText } from "@/components/MathText";
import { subjectsQuery, type Subject } from "@/lib/content";
import shortData from "@/data/short-answer.json";
import { markStudiedToday } from "@/lib/streak";
import { StructuredAnswerInput } from "@/components/StructuredAnswerInput";
import { ExamTimer } from "@/components/ExamTimer";
import { loadExamConfig } from "@/lib/exam-config";
import { shuffle, mulberry32 } from "@/lib/pickQuestions";

type ShortQ = {
  subject: string; topic: string;
  question: string; modelAnswer: string;
  markingPoints: string[]; marks: number;
};

const ALL = shortData as ShortQ[];

export const Route = createFileRoute("/exam/short/$subject")({
  loader: async ({ params, context }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s: Subject) => s.slug === params.subject);
    if (!subject) throw notFound();
    return { subject };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `Short Answer Drill — ${loaderData.subject.name} · SyllabusHQ` },
      { name: "robots", content: "noindex" },
    ] : [],
  }),
  component: ShortAnswerRunner,
});

function ShortAnswerRunner() {
  const { subject } = Route.useLoaderData();
  const [cfg, setCfg] = useState<{ count: number; timeLimitSec: number; topics: string[] } | null>(null);
  useEffect(() => {
    setCfg(loadExamConfig("short", subject.slug, { count: 15, timeLimitSec: 0, topics: [] }));
  }, [subject.slug]);

  const pool = useMemo(() => {
    const base = ALL.filter((q) => q.subject === subject.slug);
    if (!cfg) return base.slice(0, 15);
    const filtered = cfg.topics.length ? base.filter((q) => cfg.topics.includes(q.topic)) : base;
    // Deterministic per-subject shuffle so the same session order sticks.
    const seed = [...subject.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
    const shuffled = shuffle(filtered.length ? filtered : base, mulberry32(seed));
    return shuffled.slice(0, Math.max(1, cfg.count));
  }, [subject.slug, cfg]);

  const [i, setI] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (!cfg) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading…</main>
      </div>
    );
  }

  if (pool.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground">Coming soon</h1>
          <p className="mt-3 text-muted-foreground">Short-answer questions for {subject.name} are still being written.</p>
          <Link to="/practice" className="mt-6 inline-block rounded-lg border border-hairline px-4 py-2 text-sm text-foreground">← Back to modes</Link>
        </main>
      </div>
    );
  }

  const q = pool[i];
  const total = pool.length;

  function next() {
    if (i + 1 < total) setI(i + 1);
    else setSubmitted(true);
    markStudiedToday();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link to="/practice/$mode/$subject" params={{ mode: "short", subject: subject.slug }} className="text-muted-foreground hover:text-foreground">← Exit</Link>
          <div className="flex items-center gap-3">
            {cfg.timeLimitSec > 0 && (
              <ExamTimer
                storageKey={`ol-short-timer-${subject.slug}`}
                durationSec={cfg.timeLimitSec}
                onExpire={() => setSubmitted(true)}
              />
            )}
            <span className="text-muted-foreground font-num">{i + 1} / {total}</span>
          </div>
        </div>

        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
          <div className="h-full bg-foreground transition-all" style={{ width: `${((i + 1) / total) * 100}%` }} />
        </div>

        {submitted && (
          <div className="mb-4 rounded-xl border border-mint/40 bg-mint/10 p-4 text-sm text-foreground">
            Paper submitted. Review your marked answers below or start a new set.
          </div>
        )}

        <PremiumCard className="p-6 sm:p-8 rise" hover={false}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Short answer · {subject.name}</p>
            <span className="font-num text-xs text-muted-foreground">[{q.marks} marks]</span>
          </div>
          <h1 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">
            <MathText>{q.question}</MathText>
          </h1>

          <StructuredAnswerInput
            key={`${subject.slug}-${i}`}
            question={q.question}
            markingScheme={q.markingPoints.map((p) => `- ${p}`).join("\n") + `\n\nReference model answer:\n${q.modelAnswer}`}
            totalMarks={q.marks}
            subject={subject.name}
            storageKey={`ol-short-${subject.slug}-${i}`}
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={next}
              className="rounded-lg border border-hairline px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {i + 1 < total ? "Next question →" : "Finish paper"}
            </button>
          </div>
        </PremiumCard>
      </main>
    </div>
  );
}