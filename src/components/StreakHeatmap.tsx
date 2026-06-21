import { useEffect, useState } from "react";
import { buildHeatmap, computeStreaks, getStudyDays, getLastActivityAt } from "@/lib/streak";

type Stats = { current: number; longest: number; total: number; resetsInMs: number };

export function StreakHeatmap() {
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState<Set<string>>(() => new Set());
  const [stats, setStats] = useState<Stats>({ current: 0, longest: 0, total: 0, resetsInMs: 0 });

  function refresh() {
    const d = getStudyDays();
    const last = getLastActivityAt();
    setDays(d);
    setStats(computeStreaks(d, last));
    setReady(true);
  }

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    const onTick = () => refresh();
    window.addEventListener("ol-streak-updated", onUpdate);
    window.addEventListener("focus", onUpdate);
    // Re-evaluate every minute so the 24h rollover lands without a refresh.
    const id = window.setInterval(onTick, 60_000);
    return () => {
      window.removeEventListener("ol-streak-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
      window.clearInterval(id);
    };
  }, []);

  const grid = buildHeatmap(days, 22);

  // CRITICAL: don't flash zeros during hydration. We render the chrome but
  // keep the numerics in a skeleton state until localStorage has been read.
  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-7 rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Study streak
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-5xl text-foreground sm:text-6xl">
              {ready ? stats.current : "—"}
            </span>
            <span className="text-sm text-muted-foreground">
              day{stats.current === 1 ? "" : "s"} in a row
            </span>
          </div>
          {ready && stats.current > 0 && stats.resetsInMs > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Resets in {formatDur(stats.resetsInMs)} unless you practice.
            </p>
          )}
        </div>
        <dl className="flex gap-7 text-sm">
          <Stat label="Longest" value={ready ? stats.longest : "—"} />
          <Stat label="Total days" value={ready ? stats.total : "—"} />
        </dl>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="flex gap-[3px]">
          {grid.map((col, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {col.map((cell) => (
                <div
                  key={cell.date}
                  title={cell.date + (cell.studied ? " — studied" : "")}
                  className="h-3 w-3 rounded-[3px] sm:h-3.5 sm:w-3.5"
                  style={{
                    backgroundColor: cell.future
                      ? "transparent"
                      : cell.studied
                        ? "var(--amber)"
                        : "var(--surface-2)",
                    boxShadow: cell.studied
                      ? "0 0 8px rgba(245,165,36,0.45)"
                      : undefined,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Each square is a day. Finish any practice to light up today. Streak
        rolls over automatically every 24 hours.
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </dt>
      <dd className="font-display text-2xl text-foreground">{value}</dd>
    </div>
  );
}

function formatDur(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
