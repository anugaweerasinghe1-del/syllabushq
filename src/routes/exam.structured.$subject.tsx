import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { MathText } from "@/components/MathText";
import { subjectsQuery, type Subject } from "@/lib/content";
import structuredData from "@/data/structured.json";
import { markStudiedToday } from "@/lib/streak";

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
  const items = useMemo(() => ALL.filter((q) => q.subject === subject.slug), [subject.slug]);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

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

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex items-center justify-between text-sm">
          <Link to="/practice/$mode/$subject" params={{ mode: "structured", subject: subject.slug }} className="text-muted-foreground hover:text-foreground">← Exit paper</Link>
          <span className="text-muted-foreground font-num">Total marks: {totalMarks}</span>
        </div>

        {/* Paper header — exam-style */}
        <PremiumCard className="p-7 sm:p-10 mb-8 text-center rise" hover={false}>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">National O/L Style · Specimen Paper</p>
          <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">{subject.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Structured Questions · English Medium</p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-5 text-left text-xs text-muted-foreground sm:grid-cols-4">
            <div><p className="uppercase tracking-[0.18em]">Candidate</p><p className="mt-1 text-foreground">__________</p></div>
            <div><p className="uppercase tracking-[0.18em]">Index No.</p><p className="mt-1 text-foreground">__________</p></div>
            <div><p className="uppercase tracking-[0.18em]">Duration</p><p className="mt-1 text-foreground">2 hours</p></div>
            <div><p className="uppercase tracking-[0.18em]">Total</p><p className="mt-1 text-foreground">{totalMarks} marks</p></div>
          </div>
        </PremiumCard>

        <p className="mb-6 text-xs uppercase tracking-[0.22em] text-muted-foreground">Section A · Answer all questions</p>

        {items.map((q, idx) => {
          const qMarks = q.parts.reduce((s, p) => s + p.marks, 0);
          const show = revealed[idx] || submitted;
          return (
            <PremiumCard key={idx} className="mb-6 p-6 sm:p-8" hover={false}>
              <div className="flex items-start justify-between">
                <p className="font-display text-xl text-foreground">Question {idx + 1}</p>
                <span className="font-num text-xs text-muted-foreground">[{qMarks} marks total]</span>
              </div>
              {q.context && <p className="mt-3 text-sm leading-relaxed text-foreground/90"><MathText>{q.context}</MathText></p>}
              <ol className="mt-5 space-y-5">
                {q.parts.map((p, j) => (
                  <li key={j} className="grid grid-cols-[2rem_1fr_auto] gap-3">
                    <span className="font-num text-sm text-muted-foreground">({p.label})</span>
                    <div>
                      <p className="text-sm text-foreground"><MathText>{p.prompt}</MathText></p>
                      <textarea className="mt-2 w-full min-h-[80px] resize-y rounded-lg border border-hairline bg-surface-2 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none" placeholder="Your working here…" />
                      {show && (
                        <div className="mt-2 rounded-lg border border-hairline bg-surface-3 p-3 text-xs text-muted-foreground">
                          <span className="text-[10px] uppercase tracking-[0.22em] text-foreground">Model answer</span>
                          <p className="mt-1"><MathText>{p.answer}</MathText></p>
                        </div>
                      )}
                    </div>
                    <span className="font-num text-xs text-muted-foreground">[{p.marks}]</span>
                  </li>
                ))}
              </ol>
              {!submitted && (
                <button
                  onClick={() => setRevealed({ ...revealed, [idx]: !revealed[idx] })}
                  className="mt-5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {revealed[idx] ? "Hide answers" : "Reveal answers for this question"}
                </button>
              )}
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