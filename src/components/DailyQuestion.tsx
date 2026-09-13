import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDailyQuestion, type DailyOut } from "@/lib/dailyQuestion.functions";
import { PremiumCard } from "@/components/PremiumCard";
import { MathText } from "@/components/MathText";

export function DailyQuestion() {
  const fetchDaily = useServerFn(getDailyQuestion);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data, isLoading } = useQuery({
    queryKey: ["daily-question", new Date().toISOString().slice(0, 10)],
    queryFn: () => fetchDaily(),
    staleTime: 1000 * 60 * 60, // 1h
    refetchOnWindowFocus: false,
    enabled: mounted, // avoid SSR fetch that can crash Suspense boundary
    retry: 1,
  });

  if (!mounted || isLoading || !data) {
    return (
      <PremiumCard className="p-8" hover={false} variant="deep">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-3" />
        <div className="mt-6 h-8 w-3/4 animate-pulse rounded bg-surface-3" />
        <div className="mt-3 h-8 w-2/3 animate-pulse rounded bg-surface-3" />
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-3" />
          ))}
        </div>
      </PremiumCard>
    );
  }

  return <DailyCard data={data} />;
}

function DailyCard({ data }: { data: DailyOut }) {
  const [picked, setPicked] = useState<number | null>(null);
  const dateLabel = new Date(data.date + "T00:00:00").toLocaleDateString("en-LK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <PremiumCard className="border-accent/20 bg-surface p-6 sm:p-10" hover={false} variant="deep">
      {/* Top meta row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground/70">
            Daily Question
          </p>
          {data.source === "ai" && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-md border border-blue/25 bg-blue/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-blue">
              AI curated
            </span>
          )}
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {data.subjectName} · {data.topicName}
        </p>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{dateLabel}</p>

      <p className="mt-6 max-w-2xl text-[13px] italic text-foreground/60">{data.hook}</p>

      <h2 className="mt-3 font-display text-[28px] leading-[1.15] text-gradient sm:text-[40px] text-balance">
        <MathText>{data.question}</MathText>
      </h2>

      <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
        {data.options.map((opt, i) => {
          const state =
            picked == null
              ? "idle"
              : i === data.correct
                ? "correct"
                : i === picked
                  ? "wrong"
                  : "dim";
          return (
            <li key={i}>
              <button
                onClick={() => picked == null && setPicked(i)}
                disabled={picked != null}
                className={[
                  "group relative flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-300",
                  state === "idle" &&
                    "border-hairline bg-surface-2 hover:border-blue/50 hover:bg-blue/10",
                  state === "correct" && "border-green/50 bg-green/15 text-foreground",
                  state === "wrong" && "border-coral/50 bg-coral/15 text-foreground",
                  state === "dim" && "border-hairline opacity-40",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={[
                    "grid h-6 w-6 shrink-0 place-items-center rounded-md font-num text-[11px] transition",
                    state === "idle" &&
                      "border border-hairline-strong text-muted-foreground group-hover:border-blue/50 group-hover:text-blue",
                    state === "correct" && "bg-green/30 text-foreground",
                    state === "wrong" && "bg-coral/30 text-foreground",
                    state === "dim" && "border border-hairline text-muted-foreground",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="min-w-0 flex-1 text-foreground/90">
                  <MathText>{opt}</MathText>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {picked != null && (
        <div className="mt-5 rounded-xl border border-amber/25 bg-amber/10 p-4 text-sm text-foreground/85 rise">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {picked === data.correct ? "Correct" : "Not quite"}
          </p>
          <p className="mt-1.5 leading-relaxed">
            <MathText>{data.explanation}</MathText>
          </p>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">
          Same question for every student today. Streak counts the moment you commit.
        </p>
        <Link
          to="/$subject/$topic"
          params={{ subject: data.subject, topic: data.topic }}
          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Drill this topic
          <span className="transition group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </PremiumCard>
  );
}
