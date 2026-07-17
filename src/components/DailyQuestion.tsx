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
        <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
        <div className="mt-6 h-8 w-3/4 animate-pulse rounded bg-white/5" />
        <div className="mt-3 h-8 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
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
    <PremiumCard className="p-6 sm:p-10" hover={false} variant="deep">
      {/* Top meta row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground/70">
            Daily Question
          </p>
          {data.source === "ai" && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-aurora">
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
                    "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]",
                  state === "correct" &&
                    "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
                  state === "wrong" &&
                    "border-rose-400/40 bg-rose-400/10 text-rose-100",
                  state === "dim" && "border-white/5 opacity-40",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={[
                    "grid h-6 w-6 shrink-0 place-items-center rounded-md font-num text-[11px] transition",
                    state === "idle" && "border border-white/10 text-muted-foreground group-hover:text-foreground",
                    state === "correct" && "bg-emerald-400/30 text-emerald-50",
                    state === "wrong" && "bg-rose-400/30 text-rose-50",
                    state === "dim" && "border border-white/5 text-muted-foreground",
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
        <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-foreground/85 rise">
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
          className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
        >
          Drill this topic
          <span className="transition group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </PremiumCard>
  );
}