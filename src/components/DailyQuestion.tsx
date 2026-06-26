import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { questionsQuery, subjectsQuery, type Question, type Subject } from "@/lib/content";
import { PremiumCard } from "@/components/PremiumCard";
import { MathText } from "@/components/MathText";

/**
 * Deterministic Daily Question — same for every visitor on a given day.
 * Free: rotates the static bank by day-of-year, no AI calls at runtime.
 */
function dayIndex(): number {
  const d = new Date();
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const now = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((now - start) / 86400000);
}

export function DailyQuestion() {
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const { data: subjects } = useSuspenseQuery(subjectsQuery);

  const pick = useMemo<{ q: Question; subject: Subject | undefined; topicName: string } | null>(() => {
    if (!questions.length) return null;
    const idx = dayIndex() % questions.length;
    const q = questions[idx];
    const subject = subjects.find((s) => s.slug === q.subject);
    const topicName = subject?.topics.find((t) => t.slug === q.topic)?.name ?? q.topic;
    return { q, subject, topicName };
  }, [questions, subjects]);

  if (!pick || !pick.subject) return null;
  const { q, subject, topicName } = pick;

  return (
    <PremiumCard className="p-6 sm:p-8" hover={false}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber">
          Daily Question · {new Date().toLocaleDateString("en-LK", { weekday: "long", day: "numeric", month: "short" })}
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {subject.name} · {topicName}
        </p>
      </div>
      <h2 className="mt-4 font-display text-2xl leading-snug text-foreground sm:text-3xl text-balance">
        <MathText>{q.question}</MathText>
      </h2>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {q.options.map((opt, i) => (
          <li
            key={i}
            className="rounded-xl border border-hairline px-4 py-3 text-sm text-foreground/90 backdrop-blur-sm"
          >
            <span className="mr-2 font-num text-xs text-muted-foreground">{String.fromCharCode(65 + i)}</span>
            <MathText>{opt}</MathText>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">
          Same question for every student today. Tap below to attempt it and keep your streak alive.
        </p>
        <Link
          to="/$subject/$topic"
          params={{ subject: subject.slug, topic: q.topic }}
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
        >
          Attempt now →
        </Link>
      </div>
    </PremiumCard>
  );
}