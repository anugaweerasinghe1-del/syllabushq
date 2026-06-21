import { useEffect, useState } from "react";
import { buildHeatmap, computeStreaks, getStudyDays } from "@/lib/streak";

export function StreakHeatmap() {
  const [days, setDays] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setDays(getStudyDays());
  }, []);

  const grid = buildHeatmap(days, 20);
  const { current, longest, total } = computeStreaks(days);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Study streak
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">
            <span className="font-num text-marigold">{current}</span>
            <span className="ml-2 text-base font-normal text-muted-foreground">
              day{current === 1 ? "" : "s"} in a row
            </span>
          </h2>
        </div>
        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Longest</dt>
            <dd className="font-num text-lg text-ink">{longest}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Total days</dt>
            <dd className="font-num text-lg text-ink">{total}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 overflow-x-auto">
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
                        ? "var(--marigold)"
                        : "#efeae0",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Each square is a day. Finish a quiz to light up today.
      </p>
    </div>
  );
}