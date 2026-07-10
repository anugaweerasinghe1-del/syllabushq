import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { MathText } from "@/components/MathText";
import { subjectsQuery, type Subject } from "@/lib/content";
import structuredData from "@/data/structured.json";
import { markStudiedToday } from "@/lib/streak";
import { StructuredAnswerInput } from "@/components/StructuredAnswerInput";
import { ExamTimer } from "@/components/ExamTimer";
import { getStructuresFor } from "@/lib/paper-structures";
import { loadExamConfig } from "@/lib/exam-config";
import { shuffle, mulberry32 } from "@/lib/pickQuestions";

type StructuredPart = { label: string; prompt: string; answer: string; marks: number };
type StructuredQ = { subject: string; topic: string; context: string; parts: StructuredPart[] };

const ALL = structuredData as StructuredQ[];

export const Route = createFileRoute("/exam/structured/$subject")({
  loader: async ({ params, context }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s: Subject) => s.slug === params.subject);
    if (!subject) throw notFound();
    return { subject };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `Structured Paper — ${loaderData.subject.name} · SyllabusHQ` },
      { name: "robots", content: "noindex" },
    ] : [],
  }),
  component: StructuredRunner,
});

function StructuredRunner() {
  const { subject } = Route.useLoaderData();
  const [cfg, setCfg] = useState<{ count: number; timeLimitSec: number; topics: string[] } | null>(null);
  useEffect(() => {
    // Structured papers are heavy — default to 4 questions if setup didn't run.
    setCfg(loadExamConfig("structured", subject.slug, { count: 4, timeLimitSec: 60 * 60, topics: [] }));
  }, [subject.slug]);

  const items = useMemo(() => {
    const base = ALL.filter((q) => q.subject === subject.slug);
    if (!cfg) return base;
    const filtered = cfg.topics.length ? base.filter((q) => cfg.topics.includes(q.topic)) : base;
    const pool = filtered.length ? filtered : base;
    const seed = [...subject.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
    return shuffle(pool, mulberry32(seed)).slice(0, Math.max(1, cfg.count));
  }, [subject.slug, cfg]);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!cfg) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading…</main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground">Coming soon</h1>
          <p className="mt-3 text-muted-foreground">Structured papers for {subject.name} are being prepared.</p>
          <Link to="/practice" className="mt-6 inline-block rounded-lg border border-hairline px-4 py-2 text-sm text-foreground">← Back to modes</Link>
        </main>
      </div>
    );
  }

  const totalMarks = items.reduce((a, q) => a + q.parts.reduce((s, p) => s + p.marks, 0), 0);
  const structure = getStructuresFor(subject.slug).find((p) => p.name.includes("II")) ?? getStructuresFor(subject.slug)[0];
  const durationMin = cfg.timeLimitSec > 0 ? Math.round(cfg.timeLimitSec / 60) : (structure?.durationMinutes ?? 120);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link to="/practice/$mode/$subject" params={{ mode: "structured", subject: subject.slug }} className="text-muted-foreground hover:text-foreground">← Exit paper</Link>
          <div className="flex items-center gap-3">
            <ExamTimer
              storageKey={`ol-structured-${subject.slug}`}
              durationSec={durationMin * 60}
              onExpire={() => { setSubmitted(true); markStudiedToday(); }}
            />
            <span className="text-muted-foreground font-num">Total: {totalMarks}</span>
          </div>
        </div>

        {/* Paper header — exam-style */}
        <PremiumCard className="p-7 sm:p-10 mb-8 text-center rise" hover={false}>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Sri Lankan G.C.E. O/L · Specimen Paper · {structure?.name ?? subject.name}</p>
          <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">{subject.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Structured Questions · English Medium</p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-5 text-left text-xs text-muted-foreground sm:grid-cols-4">
            <div><p className="uppercase tracking-[0.18em]">Candidate</p><p className="mt-1 text-foreground">__________</p></div>
            <div><p className="uppercase tracking-[0.18em]">Index No.</p><p className="mt-1 text-foreground">__________</p></div>
            <div><p className="uppercase tracking-[0.18em]">Duration</p><p className="mt-1 text-foreground">{Math.floor(durationMin / 60)}h {durationMin % 60 ? `${durationMin % 60}m` : ""}</p></div>
            <div><p className="uppercase tracking-[0.18em]">Total</p><p className="mt-1 text-foreground">{totalMarks} marks</p></div>
          </div>
        </PremiumCard>

        <div className="mb-6 rounded-xl border border-hairline bg-white/[0.02] px-4 py-3 text-xs text-muted-foreground">
          <p className="mb-1 uppercase tracking-[0.22em] text-foreground">Section A · Answer all questions</p>
          <p>
            <span className="text-foreground">Can't draw a graph or diagram?</span> Describe it
            precisely in words — axes, intercepts, gradient, shape — and the AI examiner will award
            full credit. You can also <span className="text-foreground">snap a photo of your written working</span>{" "}
            using the camera button.
          </p>
        </div>

        {items.map((q, idx) => {
          const qMarks = q.parts.reduce((s, p) => s + p.marks, 0);
          return (
            <PremiumCard key={idx} className="mb-6 p-6 sm:p-8" hover={false}>
              <div className="flex items-start justify-between">
                <p className="font-display text-xl text-foreground">Question {idx + 1}</p>
                <span className="font-num text-xs text-muted-foreground">[{qMarks} marks total]</span>
              </div>
              {q.context && <p className="mt-3 text-sm leading-relaxed text-foreground/90"><MathText>{q.context}</MathText></p>}
              <ol className="mt-5 space-y-5">
                {q.parts.map((p, j) => (
                  <li key={j} className="rounded-xl border border-hairline bg-white/[0.015] p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm text-foreground">
                        <span className="font-mono text-muted-foreground">({p.label})</span>{" "}
                        <MathText>{p.prompt}</MathText>
                      </p>
                      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">[{p.marks}]</span>
                    </div>
                    <StructuredAnswerInput
                      key={`${subject.slug}-${idx}-${j}`}
                      question={`${q.context ? q.context + "\n\n" : ""}(${p.label}) ${p.prompt}`}
                      markingScheme={`Award up to ${p.marks} marks. Model answer (use as the marking reference):\n${p.answer}`}
                      totalMarks={p.marks}
                      subject={subject.name}
                      storageKey={`ol-structured-${subject.slug}-${idx}-${j}`}
                      expectsDiagram={/graph|diagram|sketch|draw|plot/i.test(p.prompt)}
                    />
                  </li>
                ))}
              </ol>
            </PremiumCard>
          );
        })}

        <div className="flex justify-end">
          <button
            onClick={() => { setSubmitted(true); markStudiedToday(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background hover:brightness-110"
          >
            {submitted ? "Submitted ✓" : "Submit paper"}
          </button>
        </div>
      </main>
    </div>
  );
}