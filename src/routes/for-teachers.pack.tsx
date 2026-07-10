import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { subjectsQuery, questionsQuery } from "@/lib/content";
import { MathText } from "@/components/MathText";
import { pickQuestions } from "@/lib/pickQuestions";

const searchSchema = z.object({
  subject: fallback(z.string(), "mathematics").default("mathematics"),
  topic: fallback(z.string(), "mix").default("mix"),
  count: fallback(z.number().int(), 20).default(20),
  difficulty: fallback(z.string(), "all").default("all"),
});

export const Route = createFileRoute("/for-teachers/pack")({
  validateSearch: zodValidator(searchSchema),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(subjectsQuery);
    await context.queryClient.ensureQueryData(questionsQuery);
  },
  head: () => ({
    meta: [
      { title: "Printable question pack — SyllabusHQ" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PackPage,
});

function PackPage() {
  const { subject: subjectSlug, topic: topicSlug, count } = Route.useSearch();
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const { data: questions } = useSuspenseQuery(questionsQuery);

  const subject = subjects.find((s) => s.slug === subjectSlug) ?? subjects[0];
  const topicName =
    topicSlug === "mix"
      ? "Mixed topics"
      : subject.topics.find((t) => t.slug === topicSlug)?.name ?? "Mixed topics";

  const items = useMemo(() => {
    const base = questions.filter((q) => q.subject === subject.slug);
    return pickQuestions({
      pool: base,
      topics: topicSlug === "mix" ? [] : [topicSlug],
      count: Math.max(1, Math.min(50, count)),
      balanced: true,
    });
  }, [questions, subject.slug, topicSlug, count]);

  const dateStr = new Date().toLocaleDateString("en-LK", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="pack-root min-h-screen bg-white text-neutral-900">
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .pack-root { background: white !important; color: #111 !important; }
          .page-break { break-before: page; page-break-before: always; }
          a { color: inherit; text-decoration: none; }
        }
        @page { margin: 18mm 16mm; }
      `}</style>

      <div className="no-print sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 text-sm">
          <Link to="/for-teachers" className="text-neutral-500 hover:text-neutral-900">← Back to teacher tools</Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="border-b border-neutral-300 pb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            Sri Lankan G.C.E. Ordinary Level · Practice Paper
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">{subject.name}</h1>
          <p className="mt-2 text-sm text-neutral-600">{topicName}</p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-4 text-left text-xs text-neutral-600">
            <div><p className="uppercase tracking-widest">Candidate</p><p className="mt-1 border-b border-neutral-300 pb-1">&nbsp;</p></div>
            <div><p className="uppercase tracking-widest">Index No.</p><p className="mt-1 border-b border-neutral-300 pb-1">&nbsp;</p></div>
            <div><p className="uppercase tracking-widest">Date</p><p className="mt-1 border-b border-neutral-300 pb-1">{dateStr}</p></div>
          </div>
          <p className="mt-6 text-xs text-neutral-500">
            Answer all {items.length} questions. Each question carries 1 mark. Total: {items.length} marks.
          </p>
        </header>

        <section className="mt-8">
          <ol className="space-y-6">
            {items.map((q, i) => (
              <li key={i} className="rounded-md border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold text-neutral-500">Q{i + 1}.</p>
                  <p className="text-[11px] text-neutral-500">[1]</p>
                </div>
                <p className="mt-1 text-[15px] leading-relaxed text-neutral-900">
                  <MathText>{q.question}</MathText>
                </p>
                <ol className="mt-3 grid gap-1.5 sm:grid-cols-2" type="A">
                  {q.options.map((opt, j) => (
                    <li key={j} className="text-[13px] text-neutral-800">
                      <span className="mr-2 font-mono text-neutral-500">{String.fromCharCode(65 + j)}.</span>
                      <MathText>{opt}</MathText>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </section>

        {/* Marking scheme starts on a new page when printed */}
        <section className="page-break mt-14">
          <header className="border-b border-neutral-300 pb-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">Marking Scheme</p>
            <h2 className="mt-2 font-display text-2xl">{subject.name} · {topicName}</h2>
          </header>
          <ol className="mt-6 space-y-4">
            {items.map((q, i) => (
              <li key={i} className="border-b border-neutral-100 pb-3">
                <p className="text-[13px] font-semibold text-neutral-900">
                  Q{i + 1}. <span className="font-normal text-neutral-700"><MathText>{q.question}</MathText></span>
                </p>
                <p className="mt-1 text-[13px] text-neutral-800">
                  <span className="font-semibold">Answer:</span> {String.fromCharCode(65 + q.correct)} — <MathText>{q.options[q.correct]}</MathText>
                </p>
                <p className="mt-1 text-[12px] text-neutral-600">
                  <span className="font-semibold">Explanation:</span> <MathText>{q.explanation}</MathText>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-10 border-t border-neutral-200 pt-4 text-center text-[11px] text-neutral-400">
          Generated by SyllabusHQ · Free O/L practice for every Sri Lankan student · syllabushq.lovable.app
        </footer>
      </main>
    </div>
  );
}