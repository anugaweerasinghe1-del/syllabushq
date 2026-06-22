import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { MODE_BY_SLUG, type Mode } from "@/lib/modes";
import { subjectsQuery, questionsQuery, type Subject } from "@/lib/content";
import { PremiumCard } from "@/components/PremiumCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { startNew } from "@/lib/quiz-session";

export const Route = createFileRoute("/practice/$mode/$subject")({
  loader: async ({ params, context }) => {
    const mode = MODE_BY_SLUG[params.mode as Mode];
    if (!mode) throw notFound();
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s: Subject) => s.slug === params.subject);
    if (!subject) throw notFound();
    await context.queryClient.ensureQueryData(questionsQuery);
    return { mode, subject };
  },
  component: SetupPage,
});

function SetupPage() {
  const { mode, subject } = Route.useLoaderData();
  const { data: allQuestions } = useSuspenseQuery(questionsQuery);
  const navigate = useNavigate();

  const [topic, setTopic] = useState<string>("mix");
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [count, setCount] = useState(mode.defaults.count);
  const [time, setTime] = useState(mode.defaults.time);
  const [loading, setLoading] = useState(false);

  const subjectQs = useMemo(
    () => allQuestions.filter((q) => q.subject === subject.slug),
    [allQuestions, subject.slug],
  );
  const topicCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of subjectQs) m.set(q.topic, (m.get(q.topic) ?? 0) + 1);
    return m;
  }, [subjectQs]);

  function begin() {
    setLoading(true);
    setTimeout(() => {
      if (mode.slug === "mcq" || mode.slug === "exam") {
        const pool = topic === "mix" ? subjectQs : subjectQs.filter((q) => q.topic === topic);
        if (pool.length === 0) { setLoading(false); alert("No questions for this filter yet."); return; }
        const topicSlug = topic === "mix" ? (subject.topics[0]?.slug ?? "mix") : topic;
        startNew(subject.slug, topicSlug, pool, {
          count: Math.min(count, pool.length),
          timeLimitSec: time,
          difficulty,
          mode: mode.slug === "exam" ? "exam" : "mcq",
        });
        navigate({
          to: "/$subject/$topic/practice",
          params: { subject: subject.slug, topic: topicSlug },
        });
      } else if (mode.slug === "short") {
        navigate({ to: "/exam/short/$subject", params: { subject: subject.slug } });
      } else if (mode.slug === "structured") {
        navigate({ to: "/exam/structured/$subject", params: { subject: subject.slug } });
      }
    }, 1400);
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 rise">
          <Link to="/practice/$mode" params={{ mode: mode.slug }} className="text-xs text-muted-foreground hover:text-foreground">← Subject</Link>
          <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Step 3 of 3 · {mode.name} · {subject.name}</p>
          <h1 className="mt-2 font-display text-[36px] leading-[1.05] text-foreground sm:text-[48px] text-balance">
            Tune your <span className="italic text-muted-foreground">paper</span>.
          </h1>
        </div>

        <PremiumCard className="p-6 sm:p-8 rise-2" hover={false}>
          <Field label="Topic">
            <div className="flex flex-wrap gap-2">
              <Chip active={topic === "mix"} onClick={() => setTopic("mix")}>Mix of everything · {subjectQs.length}</Chip>
              {subject.topics.map((t) => {
                const c = topicCounts.get(t.slug) ?? 0;
                if (c === 0) return null;
                return (
                  <Chip key={t.slug} active={topic === t.slug} onClick={() => setTopic(t.slug)}>
                    {t.name} · {c}
                  </Chip>
                );
              })}
            </div>
          </Field>

          {(mode.slug === "mcq" || mode.slug === "exam") && (
            <Field label="Difficulty">
              <div className="flex gap-2">
                {(["all", "easy", "medium", "hard"] as const).map((d) => (
                  <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>{d}</Chip>
                ))}
              </div>
            </Field>
          )}

          <Field label={`Questions: ${count}`}>
            <input
              type="range" min={5} max={50} step={5}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-foreground"
            />
          </Field>

          <Field label="Time limit">
            <div className="flex flex-wrap gap-2">
              {[
                { v: 0, l: "Untimed" },
                { v: 15 * 60, l: "15 min" },
                { v: 30 * 60, l: "30 min" },
                { v: 60 * 60, l: "60 min" },
                { v: 90 * 60, l: "90 min" },
                { v: 120 * 60, l: "2 h" },
              ].map((o) => (
                <Chip key={o.v} active={time === o.v} onClick={() => setTime(o.v)}>{o.l}</Chip>
              ))}
            </div>
          </Field>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {mode.slug === "exam" ? "Feedback hidden until submission." : "Resume anytime — session is saved."}
            </p>
            <button
              onClick={begin}
              className="rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:brightness-110 animate-pulse-glow"
            >
              Begin Exam →
            </button>
          </div>
        </PremiumCard>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? "border-foreground bg-foreground/10 text-foreground"
          : "border-hairline text-muted-foreground hover:border-hairline-strong hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}