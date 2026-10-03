import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { MathText } from "@/components/MathText";
import { subjectsQuery } from "@/lib/content";
import { loadMistakes, removeMistake, type Mistake } from "@/lib/mistakes";

export const Route = createFileRoute("/mistakes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(subjectsQuery),
  head: () => ({
    meta: [
      { title: "Mistakes notebook — redo every O/L question you got wrong | SyllabusHQ" },
      {
        name: "description",
        content:
          "Every question you answered wrong in SyllabusHQ practice, saved in one place. Redo them until you get them right.",
      },
      { property: "og:title", content: "Mistakes notebook — SyllabusHQ" },
      { property: "og:description", content: "Redo only the O/L questions you got wrong." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MistakesPage,
});

function MistakesPage() {
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const [list, setList] = useState<Mistake[] | null>(null);
  const [filter, setFilter] = useState("all");
  useEffect(() => setList(loadMistakes()), []);

  const shown = useMemo(
    () => (list ?? []).filter((m) => filter === "all" || m.subject === filter),
    [list, filter],
  );
  const subjectName = (s: string) => subjects.find((x) => x.slug === s)?.name ?? s;
  const topicName = (s: string, t: string) =>
    subjects.find((x) => x.slug === s)?.topics.find((y) => y.slug === t)?.name ?? t;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link to="/study" className="text-sm text-muted-foreground hover:text-foreground">
          ← Study tools
        </Link>
        <h1 className="mt-3 font-display text-4xl text-foreground">Mistakes notebook</h1>
        <p className="mt-2 text-muted-foreground">
          Answer each one correctly and it leaves your notebook. Saved on this device.
        </p>

        {list && list.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {["all", ...subjects.map((s) => s.slug)].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  filter === s
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-hairline text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? `All (${list.length})` : subjectName(s)}
              </button>
            ))}
          </div>
        )}

        {list === null ? null : shown.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-hairline p-8 text-center">
            <p className="text-lg text-foreground">
              {list.length === 0 ? "No mistakes saved yet." : "Nothing left here — well done!"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Questions you get wrong in practice will appear here automatically.
            </p>
            <Link
              to="/practice"
              className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Start practising
            </Link>
          </div>
        ) : (
          <ol className="mt-6 space-y-4">
            {shown.map((m) => (
              <MistakeCard
                key={m.question}
                m={m}
                label={`${subjectName(m.subject)} · ${topicName(m.subject, m.topic)}`}
                onSolved={() => {
                  removeMistake(m);
                  setList(loadMistakes());
                }}
              />
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}

function MistakeCard({ m, label, onSolved }: { m: Mistake; label: string; onSolved: () => void }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const done = chosen !== null;
  const right = chosen === m.correct;
  return (
    <li className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span>Missed ×{m.misses}</span>
      </div>
      <p className="mt-2 text-[15px] text-foreground">
        <MathText>{m.question}</MathText>
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {m.options.map((o, j) => (
          <button
            key={j}
            type="button"
            disabled={done}
            onClick={() => setChosen(j)}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
              done && j === m.correct
                ? "border-[color:var(--sage)] bg-[color:var(--sage)]/15 text-foreground"
                : done && j === chosen
                  ? "border-[color:var(--clay)] bg-[color:var(--clay)]/15 text-foreground"
                  : "border-hairline text-foreground/90 hover:bg-surface-2"
            }`}
          >
            <span className="mr-2 font-mono text-muted-foreground">{String.fromCharCode(65 + j)}.</span>
            <MathText>{o}</MathText>
          </button>
        ))}
      </div>
      {done && (
        <div className="mt-3 text-sm">
          <p className="text-foreground/90">
            <MathText>{m.explanation}</MathText>
          </p>
          <div className="mt-3 flex gap-2">
            {right ? (
              <button
                type="button"
                onClick={onSolved}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Got it — remove from notebook
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setChosen(null)}
                className="rounded-lg border border-hairline px-4 py-2 text-sm text-foreground"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
