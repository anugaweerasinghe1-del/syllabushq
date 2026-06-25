import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { MathText } from "@/components/MathText";
import { subjectsQuery, type Subject } from "@/lib/content";
import shortData from "@/data/short-answer.json";
import { markStudiedToday } from "@/lib/streak";
import { StructuredAnswerInput } from "@/components/StructuredAnswerInput";

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
  const pool = useMemo(() => ALL.filter((q) => q.subject === subject.slug), [subject.slug]);
  const [i, setI] = useState(0);

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
    markStudiedToday();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-5 flex items-center justify-between text-sm">
          <Link to="/practice/$mode/$subject" params={{ mode: "short", subject: subject.slug }} className="text-muted-foreground hover:text-foreground">← Exit</Link>
          <span className="text-muted-foreground font-num">{i + 1} / {total}</span>
        </div>

        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
          <div className="h-full bg-foreground transition-all" style={{ width: `${((i + 1) / total) * 100}%` }} />
        </div>

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
              Next question →
            </button>
          </div>
        </PremiumCard>
      </main>
    </div>
  );
}