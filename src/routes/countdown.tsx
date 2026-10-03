import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { subjectsQuery } from "@/lib/content";

export const Route = createFileRoute("/countdown")({
  loader: ({ context }) => context.queryClient.ensureQueryData(subjectsQuery),
  head: () => ({
    meta: [
      { title: "O/L exam countdown & daily study plan | SyllabusHQ" },
      {
        name: "description",
        content:
          "Count down the days to your G.C.E. O/L exam and get a simple daily revision plan that covers every topic before exam day.",
      },
      { property: "og:title", content: "O/L exam countdown — SyllabusHQ" },
      { property: "og:description", content: "Days left to O/L, and what to revise today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CountdownPage,
});

const KEY = "shq-exam-date";
const DONE_KEY = "shq-plan-done";
const DAY = 86_400_000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function CountdownPage() {
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const [examDate, setExamDate] = useState<string>("");
  const [today, setToday] = useState<number | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExamDate(localStorage.getItem(KEY) ?? "");
    setToday(startOfDay(new Date()));
    try {
      setDone(JSON.parse(localStorage.getItem(DONE_KEY) ?? "{}"));
    } catch {
      /* ignore */
    }
  }, []);

  function saveDate(v: string) {
    setExamDate(v);
    localStorage.setItem(KEY, v);
  }
  function toggle(id: string) {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    localStorage.setItem(DONE_KEY, JSON.stringify(next));
  }

  // Interleave topics across subjects, leave the final 7 days for full-paper revision.
  const allTopics = useMemo(() => {
    const lists = subjects.map((s) => s.topics.map((t) => ({ subject: s, topic: t })));
    const out: (typeof lists)[number] = [];
    const max = Math.max(...lists.map((l) => l.length));
    for (let i = 0; i < max; i++) for (const l of lists) if (l[i]) out.push(l[i]);
    return out;
  }, [subjects]);

  const examTs = examDate ? startOfDay(new Date(examDate + "T00:00:00")) : null;
  const daysLeft = examTs && today ? Math.round((examTs - today) / DAY) : null;
  const studyDays = daysLeft !== null ? Math.max(1, daysLeft - 7) : 0;
  const perDay = daysLeft !== null ? Math.max(1, Math.ceil(allTopics.length / studyDays)) : 0;

  const plan = useMemo(() => {
    if (daysLeft === null || today === null || daysLeft <= 0) return [];
    const days: { date: number; items: typeof allTopics; revision?: boolean }[] = [];
    for (let d = 0; d < daysLeft; d++) {
      const items = allTopics.slice(d * perDay, d * perDay + perDay);
      if (items.length) days.push({ date: today + d * DAY, items });
      else days.push({ date: today + d * DAY, items: [], revision: true });
    }
    return days;
  }, [daysLeft, today, allTopics, perDay]);

  const completed = allTopics.filter((t) => done[`${t.subject.slug}/${t.topic.slug}`]).length;
  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link to="/study" className="text-sm text-muted-foreground hover:text-foreground">
          ← Study tools
        </Link>
        <h1 className="mt-3 font-display text-4xl text-foreground">Exam countdown</h1>

        <div className="glass-panel mt-6 rounded-2xl p-6">
          <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Your first O/L exam date
            <input
              type="date"
              value={examDate}
              onChange={(e) => saveDate(e.target.value)}
              className="mt-2 block w-full max-w-xs rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm text-foreground [color-scheme:dark]"
            />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            Check your admission card or the Department of Examinations timetable for the exact date.
          </p>

          {daysLeft !== null && (
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-hairline p-4">
                <p className="font-num text-4xl text-orange">{Math.max(0, daysLeft)}</p>
                <p className="mt-1 text-xs text-muted-foreground">days left</p>
              </div>
              <div className="rounded-xl border border-hairline p-4">
                <p className="font-num text-4xl text-foreground">{perDay}</p>
                <p className="mt-1 text-xs text-muted-foreground">topics a day</p>
              </div>
              <div className="rounded-xl border border-hairline p-4">
                <p className="font-num text-4xl text-[color:var(--sage)]">
                  {completed}/{allTopics.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">topics done</p>
              </div>
            </div>
          )}
        </div>

        {daysLeft !== null && daysLeft <= 0 && (
          <p className="mt-6 text-center text-muted-foreground">
            That date has passed — set your next exam date to get a plan.
          </p>
        )}

        {plan.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl text-foreground">Your daily plan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tick topics off as you finish them. The final week is for full past papers.
            </p>
            <ol className="mt-4 space-y-3">
              {plan.slice(0, 60).map((day, idx) => (
                <li
                  key={day.date}
                  className={`rounded-xl border p-4 ${idx === 0 ? "border-primary bg-primary/5" : "border-hairline"}`}
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {idx === 0 ? "Today" : fmt(day.date)}
                  </p>
                  {day.revision ? (
                    <p className="mt-2 text-sm text-foreground">
                      Full revision —{" "}
                      <Link to="/past-papers" className="text-primary underline">
                        sit a past paper
                      </Link>{" "}
                      and review your{" "}
                      <Link to="/mistakes" className="text-primary underline">
                        mistakes notebook
                      </Link>
                      .
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {day.items.map(({ subject, topic }) => {
                        const id = `${subject.slug}/${topic.slug}`;
                        return (
                          <li key={id} className="flex items-center gap-3 text-sm">
                            <input
                              type="checkbox"
                              checked={!!done[id]}
                              onChange={() => toggle(id)}
                              aria-label={`Mark ${topic.name} done`}
                              className="h-4 w-4 accent-[color:var(--primary)]"
                            />
                            <Link
                              to="/$subject/$topic"
                              params={{ subject: subject.slug, topic: topic.slug }}
                              className={`hover:text-primary ${done[id] ? "text-muted-foreground line-through" : "text-foreground"}`}
                            >
                              {topic.name}
                            </Link>
                            <span className="text-xs text-muted-foreground">· {subject.name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}
