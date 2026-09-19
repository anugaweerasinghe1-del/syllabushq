import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { MathText } from "@/components/MathText";
import { subjectsQuery, questionsQuery, resolveSubject, type Question } from "@/lib/content";
import { NotFoundShell } from "@/components/NotFoundShell";
import structuredData from "@/data/structured.json";
import { markStudiedToday } from "@/lib/streak";
import { logSession } from "@/lib/logSession";
import { StructuredAnswerInput } from "@/components/StructuredAnswerInput";
import { ExamTimer } from "@/components/ExamTimer";
import { loadExamConfig } from "@/lib/exam-config";
import { pickQuestions, shuffle, mulberry32 } from "@/lib/pickQuestions";
import { getStructuresFor } from "@/lib/paper-structures";
import { useBankTopUp } from "@/hooks/useBankTopUp";
import type { McqItem, StructuredItem } from "@/lib/bank-types";
import { PAST_PAPERS } from "@/lib/past-papers";

type StructuredPart = { label: string; prompt: string; answer: string; marks: number };
type StructuredQ = { subject: string; topic: string; context: string; parts: StructuredPart[] };

const STRUCTURED = structuredData as StructuredQ[];

export const Route = createFileRoute("/exam/full/$subject")({
  loader: async ({ params, context }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = resolveSubject(subjects, params.subject);
    if (!subject) throw notFound();
    if (subject.slug !== params.subject) {
      throw redirect({ to: "/exam/full/$subject", params: { subject: subject.slug } });
    }
    const paper = PAST_PAPERS.filter((item) => item.subject === subject.slug).sort((a, b) =>
      b.year.localeCompare(a.year),
    )[0];
    if (paper) {
      throw redirect({ to: "/past-papers/$paper", params: { paper: paper.slug } });
    }
    throw redirect({ to: "/past-papers" });
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Full Exam Simulation — ${loaderData.subject.name} · SyllabusHQ` },
          { name: "robots", content: "noindex" },
        ]
      : [],
  }),
  component: FullExam,
  notFoundComponent: () => <NotFoundShell />,
  errorComponent: ({ error }) => (
    <NotFoundShell title="This exam didn't load" message={error.message} />
  ),
});

function FullExam() {
  const { subject } = Route.useLoaderData();
  const { data: allQuestions } = useSuspenseQuery(questionsQuery);

  const [cfg, setCfg] = useState<{ count: number; timeLimitSec: number; topics: string[] } | null>(
    null,
  );
  useEffect(() => {
    setCfg(loadExamConfig("exam", subject.slug, { count: 30, timeLimitSec: 120 * 60, topics: [] }));
  }, [subject.slug]);

  const [section, setSection] = useState<1 | 2>(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // ---- Paper I: MCQ ----------------------------------------------------
  const localMcq = useMemo<Question[]>(() => {
    if (!cfg) return [];
    return pickQuestions({
      pool: allQuestions.filter((q) => q.subject === subject.slug),
      topics: cfg.topics,
      count: cfg.count,
      balanced: true,
      seed: [...subject.slug].reduce((a, c) => a + c.charCodeAt(0), 0),
    });
  }, [allQuestions, subject.slug, cfg]);

  const mcqNeed = cfg ? Math.max(0, cfg.count - localMcq.length) : 0;
  const { extra: mcqExtra, loading: mcqLoading } = useBankTopUp({
    mode: "mcq",
    subject: subject.slug,
    topics: cfg?.topics ?? [],
    need: mcqNeed,
    avoid: localMcq.slice(0, 12).map((q) => q.question),
    enabled: !!cfg && mcqNeed > 0,
  });

  const paper1 = useMemo<Question[]>(
    () => [...localMcq, ...(mcqExtra as McqItem[]).map((q) => ({ ...q, subject: subject.slug }))],
    [localMcq, mcqExtra, subject.slug],
  );

  // ---- Paper II: structured -------------------------------------------
  const structuredWanted = Math.max(2, Math.round((cfg?.count ?? 30) / 8));
  const localStructured = useMemo<StructuredQ[]>(() => {
    if (!cfg) return [];
    const base = STRUCTURED.filter((q) => q.subject === subject.slug);
    const filtered = cfg.topics.length ? base.filter((q) => cfg.topics.includes(q.topic)) : base;
    const seed = [...subject.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
    return shuffle(filtered, mulberry32(seed)).slice(0, structuredWanted);
  }, [subject.slug, cfg, structuredWanted]);

  const strNeed = cfg ? Math.max(0, structuredWanted - localStructured.length) : 0;
  const { extra: strExtra } = useBankTopUp({
    mode: "structured",
    subject: subject.slug,
    topics: cfg?.topics ?? [],
    need: strNeed,
    avoid: localStructured.slice(0, 6).map((q) => q.context),
    enabled: !!cfg && strNeed > 0,
  });

  const paper2 = useMemo<StructuredQ[]>(
    () => [
      ...localStructured,
      ...(strExtra as StructuredItem[]).map((q) => ({ ...q, subject: subject.slug })),
    ],
    [localStructured, strExtra, subject.slug],
  );

  const structure = getStructuresFor(subject.slug);
  const durationMin = cfg && cfg.timeLimitSec > 0 ? Math.round(cfg.timeLimitSec / 60) : 150;

  if (!cfg || (mcqLoading && paper1.length === 0)) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">
          Preparing your full exam simulation…
        </main>
      </div>
    );
  }

  const score = paper1.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);
  const p2Marks = paper2.reduce((a, q) => a + q.parts.reduce((s, p) => s + p.marks, 0), 0);

  function submit() {
    setSubmitted(true);
    markStudiedToday();
    void logSession({
      subject: subject.slug,
      topic: null,
      mode: "exam",
      marksAwarded: score,
      totalMarks: paper1.length,
      detail: { paper2Marks: p2Marks },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link
            to="/practice/$mode/$subject"
            params={{ mode: "exam", subject: subject.slug }}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Exit simulation
          </Link>
          <ExamTimer
            storageKey={`ol-full-${subject.slug}`}
            durationSec={durationMin * 60}
            onExpire={submit}
          />
        </div>

        <PremiumCard className="mb-6 p-7 text-center sm:p-10 rise" hover={false}>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Sri Lankan G.C.E. O/L · Full Exam Simulation
          </p>
          <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">{subject.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {structure[0]?.name ?? "Paper I"} + {structure[1]?.name ?? "Paper II"} · English Medium
            · {durationMin} minutes
          </p>
        </PremiumCard>

        {submitted && (
          <PremiumCard className="mb-6 p-6" hover={false}>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Result</p>
            <p className="mt-2 font-display text-3xl text-foreground">
              Paper I: <span className="font-num">{score}</span> / {paper1.length}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Paper II is marked per part by the AI examiner — open Section II and press “Mark my
              answer” on each part for feedback ({p2Marks} marks available).
            </p>
          </PremiumCard>
        )}

        <div className="mb-6 flex gap-2">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`rounded-full border px-4 py-1.5 text-xs transition ${
                section === s
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-hairline text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === 1
                ? `Paper I · MCQ (${paper1.length})`
                : `Paper II · Structured (${paper2.length})`}
            </button>
          ))}
        </div>

        {section === 1 &&
          paper1.map((q, i) => (
            <PremiumCard key={i} className="mb-4 p-5 sm:p-6" hover={false}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-foreground">
                  <span className="mr-2 font-num text-muted-foreground">{i + 1}.</span>
                  <MathText>{q.question}</MathText>
                </p>
                <span className="shrink-0 font-num text-[11px] text-muted-foreground">[1]</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, j) => {
                  const chosen = answers[i] === j;
                  const reveal = submitted && j === q.correct;
                  return (
                    <button
                      key={j}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                        reveal
                          ? "border-mint/60 bg-mint/10 text-foreground"
                          : chosen
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-hairline text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {String.fromCharCode(65 + j)}
                      </span>
                      <MathText>{opt}</MathText>
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="mt-3 text-xs text-muted-foreground">
                  <MathText>{q.explanation}</MathText>
                </p>
              )}
            </PremiumCard>
          ))}

        {section === 2 &&
          (paper2.length === 0 ? (
            <PremiumCard className="p-8 text-center" hover={false}>
              <p className="text-muted-foreground">
                Structured questions for this selection are still being written. Paper I is fully
                available.
              </p>
            </PremiumCard>
          ) : (
            paper2.map((q, idx) => (
              <PremiumCard key={idx} className="mb-6 p-6 sm:p-8" hover={false}>
                <div className="flex items-start justify-between">
                  <p className="font-display text-xl text-foreground">Question {idx + 1}</p>
                  <span className="font-num text-xs text-muted-foreground">
                    [{q.parts.reduce((s, p) => s + p.marks, 0)} marks]
                  </span>
                </div>
                {q.context && (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                    <MathText>{q.context}</MathText>
                  </p>
                )}
                <ol className="mt-5 space-y-5">
                  {q.parts.map((p, j) => (
                    <li key={j} className="rounded-xl border border-hairline bg-white/[0.015] p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm text-foreground">
                          <span className="font-mono text-muted-foreground">({p.label})</span>{" "}
                          <MathText>{p.prompt}</MathText>
                        </p>
                        <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                          [{p.marks}]
                        </span>
                      </div>
                      <StructuredAnswerInput
                        key={`full-${subject.slug}-${idx}-${j}`}
                        question={`${q.context ? q.context + "\n\n" : ""}(${p.label}) ${p.prompt}`}
                        markingScheme={`Award up to ${p.marks} marks. Model answer (marking reference):\n${p.answer}`}
                        totalMarks={p.marks}
                        subject={subject.name}
                        storageKey={`ol-full-${subject.slug}-${idx}-${j}`}
                        expectsDiagram={/graph|diagram|sketch|draw|plot/i.test(p.prompt)}
                      />
                    </li>
                  ))}
                </ol>
              </PremiumCard>
            ))
          ))}

        <div className="mt-8 flex justify-end">
          <button
            onClick={submit}
            disabled={submitted}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            {submitted ? "Submitted ✓" : "Submit full paper"}
          </button>
        </div>
      </main>
    </div>
  );
}
