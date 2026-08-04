import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import subjectsData from "@/data/subjects.json";
import { classDetail, createAssignment, deleteAssignment } from "@/lib/school.functions";

type SubjectJSON = { slug: string; name: string; topics: { slug: string; name: string }[] };
const SUBJECTS = subjectsData as SubjectJSON[];

export const Route = createFileRoute("/_authenticated/classes/$classId")({
  head: () => ({
    meta: [
      { title: "Class — SyllabusHQ for teachers" },
      {
        name: "description",
        content: "Your class roster, assignments and marks, with weakest topics across the class.",
      },
      { property: "og:title", content: "Class — SyllabusHQ for teachers" },
      { property: "og:description", content: "Roster, assignments and marks for your O/L class." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClassPage,
});

function ClassPage() {
  const { classId } = Route.useParams();
  const load = useServerFn(classDetail);
  const q = useQuery({ queryKey: ["class", classId], queryFn: () => load({ data: { classId } }) });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-24 pt-8">
        <Link to="/dashboard" className="text-[13px] text-muted-foreground transition hover:text-foreground">
          ← Dashboard
        </Link>
        {q.isLoading && <p className="text-sm text-muted-foreground">Loading class…</p>}
        {q.data === null && <p className="text-sm text-red-400">That class isn't yours, or no longer exists.</p>}
        {q.data && (
          <>
            <header>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Class</p>
              <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">{q.data.cls.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Join code{" "}
                <span className="rounded-lg border border-border px-2 py-0.5 font-mono tracking-widest text-foreground">
                  {q.data.cls.join_code}
                </span>{" "}
                — students enter this on their dashboard.
              </p>
            </header>

            <NewAssignment classId={classId} defaultSubject={q.data.cls.subject} />

            <Marks data={q.data} />
          </>
        )}
      </main>
    </div>
  );
}

function NewAssignment({ classId, defaultSubject }: { classId: string; defaultSubject: string | null }) {
  const create = useServerFn(createAssignment);
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(
    SUBJECTS.find((s) => s.slug === defaultSubject)?.slug ?? SUBJECTS[0]?.slug ?? "mathematics",
  );
  const [topics, setTopics] = useState<string[]>([]);
  const [mode, setMode] = useState<"mcq" | "short" | "structured" | "full">("mcq");
  const [questionCount, setCount] = useState(10);
  const [timerMinutes, setTimer] = useState(20);
  const [dueAt, setDue] = useState("");

  const subj = SUBJECTS.find((s) => s.slug === subject);

  const m = useMutation({
    mutationFn: () =>
      create({
        data: {
          classId,
          title,
          subject,
          topics,
          mode,
          questionCount,
          timerMinutes: timerMinutes || null,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        },
      }),
    onSuccess: () => {
      setTitle("");
      setTopics([]);
      qc.invalidateQueries({ queryKey: ["class", classId] });
    },
  });

  return (
    <section className="glass-panel rounded-2xl p-5">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">Set an assignment</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Week 3 — Algebra check" aria-label="Assignment title" />
        <select className="input-base" value={subject} onChange={(e) => { setSubject(e.target.value); setTopics([]); }} aria-label="Subject">
          {SUBJECTS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <select className="input-base" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} aria-label="Mode">
          <option value="mcq">Multiple choice</option>
          <option value="short">Short answer</option>
          <option value="structured">Structured paper</option>
          <option value="full">Full exam simulation</option>
        </select>
        <input className="input-base" type="number" min={1} max={60} value={questionCount} onChange={(e) => setCount(Number(e.target.value))} aria-label="Number of questions" />
        <input className="input-base" type="number" min={0} max={240} value={timerMinutes} onChange={(e) => setTimer(Number(e.target.value))} aria-label="Timer in minutes" />
        <input className="input-base" type="date" value={dueAt} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
      </div>

      {subj && (
        <div className="mt-4">
          <p className="mb-2 text-[12px] text-muted-foreground">
            Topics — leave empty for a mixed paper across the whole syllabus.
          </p>
          <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto">
            {subj.topics.map((t) => {
              const on = topics.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTopics(on ? topics.filter((x) => x !== t.slug) : [...topics, t.slug])}
                  className={[
                    "rounded-lg border px-2.5 py-1.5 text-[12px] transition",
                    on ? "border-foreground/40 bg-surface-2 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => m.mutate()}
        disabled={m.isPending || title.trim().length < 2}
        className="mt-4 rounded-xl bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
      >
        {m.isPending ? "Setting…" : "Set assignment"}
      </button>
      {m.data && !m.data.ok && <p className="mt-2 text-sm text-red-400">{m.data.error}</p>}
    </section>
  );
}

type Detail = NonNullable<Awaited<ReturnType<typeof classDetail>>>;

function Marks({ data }: { data: Detail }) {
  const remove = useServerFn(deleteAssignment);
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["class", data.cls.id] }),
  });

  function csv() {
    const head = ["Student", ...data.assignments.map((a) => a.title)];
    const rows = data.roster.map((s) => [
      s.name,
      ...data.assignments.map((a) => {
        const sub = data.submissions.find((x) => x.assignment_id === a.id && x.student_id === s.id);
        return sub ? `${Math.round(Number(sub.marks_awarded))}/${Math.round(Number(sub.total_marks))}` : "";
      }),
    ]);
    const text = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.cls.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-marks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Roster &amp; marks — {data.roster.length} student{data.roster.length === 1 ? "" : "s"}
        </h2>
        <button
          onClick={csv}
          disabled={!data.roster.length}
          className="rounded-xl border border-border px-3.5 py-2 text-[13px] text-muted-foreground transition hover:text-foreground disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {data.roster.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nobody has joined yet. Share the join code above with your class.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Student</th>
                {data.assignments.map((a) => (
                  <th key={a.id} className="py-2 pr-4 font-medium">
                    <span className="flex items-center gap-2">
                      {a.title}
                      <button
                        onClick={() => del.mutate(a.id)}
                        aria-label={`Remove assignment ${a.title}`}
                        className="text-muted-foreground transition hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.roster.map((s) => (
                <tr key={s.id} className="border-t border-border/60">
                  <td className="py-2.5 pr-4 text-foreground">{s.name}</td>
                  {data.assignments.map((a) => {
                    const sub = data.submissions.find((x) => x.assignment_id === a.id && x.student_id === s.id);
                    return (
                      <td key={a.id} className="py-2.5 pr-4 text-muted-foreground">
                        {sub
                          ? `${Math.round(Number(sub.marks_awarded))}/${Math.round(Number(sub.total_marks))}`
                          : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}