import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { MathText } from "@/components/MathText";
import { subjectsQuery, type Subject } from "@/lib/content";
import shortData from "@/data/short-answer.json";
import { markStudiedToday } from "@/lib/streak";

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
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);
  const [grades, setGrades] = useState<Record<number, "correct" | "partial" | "wrong">>({});

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
  const score = Object.values(grades).reduce((acc, g) => acc + (g === "correct" ? 1 : g === "partial" ? 0.5 : 0), 0);

  function next() {
    setReveal(false); setDraft("");
    if (i + 1 < total) setI(i + 1);
    markStudiedToday();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-5 flex items-center justify-between text-sm">
          <Link to="/practice/$mode/$subject" params={{ mode: "short", subject: subject.slug }} className="text-muted-foreground hover:text-foreground">← Exit</Link>
          <span className="text-muted-foreground font-num">{i + 1} / {total} · Self-score {score}/{total}</span>
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

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={reveal}
            placeholder="Type your answer…"
            className="mt-6 w-full min-h-[140px] resize-y rounded-xl border border-hairline bg-surface-2 p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none"
          />

          {!reveal ? (
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setReveal(true)} className="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background">
                Reveal model answer
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-xl border border-hairline bg-surface-2 p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Model answer</p>
                <p className="mt-2 text-sm text-foreground/90"><MathText>{q.modelAnswer}</MathText></p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Marking points</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {q.markingPoints.map((p, k) => (
                    <li key={k}>· <MathText>{p}</MathText></li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <GradeBtn label="Correct" tone="mint" onClick={() => { setGrades({ ...grades, [i]: "correct" }); next(); }} />
                  <GradeBtn label="Partial" tone="amber" onClick={() => { setGrades({ ...grades, [i]: "partial" }); next(); }} />
                  <GradeBtn label="Wrong" tone="coral" onClick={() => { setGrades({ ...grades, [i]: "wrong" }); next(); }} />
                </div>
                <button onClick={next} className="text-xs text-muted-foreground hover:text-foreground">Skip →</button>
              </div>
            </>
          )}
        </PremiumCard>
      </main>
    </div>
  );
}

function GradeBtn({ label, tone, onClick }: { label: string; tone: "mint" | "amber" | "coral"; onClick: () => void }) {
  const c = tone === "mint" ? "border-[var(--mint)]/40 text-[var(--mint)] hover:bg-[color-mix(in_srgb,var(--mint)_10%,transparent)]"
         : tone === "amber" ? "border-[var(--amber)]/40 text-[var(--amber)] hover:bg-[color-mix(in_srgb,var(--amber)_10%,transparent)]"
         : "border-[var(--coral)]/40 text-[var(--coral)] hover:bg-[color-mix(in_srgb,var(--coral)_10%,transparent)]";
  return <button onClick={onClick} className={`rounded-lg border px-4 py-2 text-xs font-semibold ${c}`}>{label}</button>;
}