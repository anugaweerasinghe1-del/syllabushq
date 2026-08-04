import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getMe,
  teacherOverview,
  studentOverview,
  createClass,
  joinClass,
  updateProfile,
} from "@/lib/school.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — SyllabusHQ" },
      {
        name: "description",
        content: "Your classes, assignments and O/L results in one place on SyllabusHQ.",
      },
      { property: "og:title", content: "Your dashboard — SyllabusHQ" },
      { property: "og:description", content: "Classes, assignments and O/L results, synced to your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const fetchMe = useServerFn(getMe);
  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (me.isLoading) return <Shell><p className="text-sm text-muted-foreground">Loading your dashboard…</p></Shell>;
  if (me.isError || !me.data)
    return (
      <Shell>
        <p className="text-sm text-red-400">We couldn't load your account. Refresh and try again.</p>
      </Shell>
    );

  const { role, profile } = me.data;

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {role === "teacher" ? "Teacher" : "Student"}
          </p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">
            {profile.full_name ? `Hello, ${profile.full_name.split(" ")[0]}.` : "Your dashboard."}
          </h1>
        </div>
        <button
          onClick={signOut}
          className="rounded-xl border border-border px-3.5 py-2 text-[13px] text-muted-foreground transition hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <ProfileCard initial={profile} />

      {role === "teacher" ? <TeacherPanel /> : <StudentPanel />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-24 pt-8">{children}</main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-panel rounded-2xl p-5">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfileCard({
  initial,
}: {
  initial: { full_name: string; school: string | null; grade: string | null };
}) {
  const save = useServerFn(updateProfile);
  const qc = useQueryClient();
  const [full_name, setName] = useState(initial.full_name);
  const [school, setSchool] = useState(initial.school ?? "");
  const [grade, setGrade] = useState(initial.grade ?? "");
  const m = useMutation({
    mutationFn: () => save({ data: { full_name, school, grade } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });

  return (
    <Card title="Your details">
      <div className="grid gap-3 sm:grid-cols-3">
        <input className="input-base" value={full_name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-label="Full name" />
        <input className="input-base" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School" aria-label="School" />
        <input className="input-base" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Grade (e.g. 11)" aria-label="Grade" />
      </div>
      <button
        onClick={() => m.mutate()}
        disabled={m.isPending || !full_name.trim()}
        className="mt-3 rounded-xl bg-foreground px-4 py-2 text-[13px] font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
      >
        {m.isPending ? "Saving…" : "Save"}
      </button>
    </Card>
  );
}

function TeacherPanel() {
  const load = useServerFn(teacherOverview);
  const make = useServerFn(createClass);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["teacher-overview"], queryFn: () => load() });
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const m = useMutation({
    mutationFn: () => make({ data: { name, subject } }),
    onSuccess: () => {
      setName("");
      setSubject("");
      qc.invalidateQueries({ queryKey: ["teacher-overview"] });
    },
  });

  return (
    <>
      <Card title="Create a class">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
          <input className="input-base" value={name} onChange={(e) => setName(e.target.value)} placeholder="Grade 11 Science — Section A" aria-label="Class name" />
          <input className="input-base" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" aria-label="Subject" />
          <button
            onClick={() => m.mutate()}
            disabled={m.isPending || name.trim().length < 2}
            className="rounded-xl bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
          >
            {m.isPending ? "Creating…" : "Create"}
          </button>
        </div>
        {m.data && !m.data.ok && <p className="mt-2 text-sm text-red-400">{m.data.error}</p>}
      </Card>

      <Card title="Your classes">
        {q.isLoading && <p className="text-sm text-muted-foreground">Loading classes…</p>}
        {q.data && q.data.classes.length === 0 && (
          <p className="text-sm text-muted-foreground">No classes yet. Create one above and share the join code.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {(q.data?.classes ?? []).map((c) => (
            <Link
              key={c.id}
              to="/classes/$classId"
              params={{ classId: c.id }}
              className="rounded-xl border border-border bg-surface-2 p-4 transition hover:brightness-110"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{c.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{c.subject || "All subjects"}</p>
                </div>
                <span className="rounded-lg border border-border px-2 py-1 font-mono text-[12px] tracking-widest text-foreground">
                  {c.join_code}
                </span>
              </div>
              <p className="mt-3 text-[12px] text-muted-foreground">
                {c.students} student{c.students === 1 ? "" : "s"} · {c.assignments} assignment
                {c.assignments === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}

function StudentPanel() {
  const load = useServerFn(studentOverview);
  const join = useServerFn(joinClass);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["student-overview"], queryFn: () => load() });
  const [joinCode, setCode] = useState("");
  const m = useMutation({
    mutationFn: () => join({ data: { joinCode } }),
    onSuccess: (r) => {
      if (r.ok) setCode("");
      qc.invalidateQueries({ queryKey: ["student-overview"] });
    },
  });

  const submissions = q.data?.submissions ?? [];

  return (
    <>
      <Card title="Join a class">
        <div className="flex flex-wrap gap-3">
          <input
            className="input-base max-w-[220px] font-mono uppercase tracking-widest"
            value={joinCode}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            aria-label="Class join code"
          />
          <button
            onClick={() => m.mutate()}
            disabled={m.isPending || joinCode.trim().length < 4}
            className="rounded-xl bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
          >
            {m.isPending ? "Joining…" : "Join"}
          </button>
        </div>
        {m.data && !m.data.ok && <p className="mt-2 text-sm text-red-400">{m.data.error}</p>}
      </Card>

      <Card title="Assignments">
        {q.isLoading && <p className="text-sm text-muted-foreground">Loading assignments…</p>}
        {q.data && q.data.assignments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing set yet. Join your class with the code your teacher gives you, or{" "}
            <Link to="/practice" className="text-foreground underline underline-offset-4">
              practise on your own
            </Link>
            .
          </p>
        )}
        <ul className="space-y-3">
          {(q.data?.assignments ?? []).map((a) => {
            const done = submissions.find((s) => s.assignment_id === a.id);
            const cls = (q.data?.classes ?? []).find((c) => c.id === a.class_id);
            return (
              <li key={a.id} className="rounded-xl border border-border bg-surface-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{a.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {cls?.name ?? "Class"} · {a.subject} · {a.mode} · {a.question_count} questions
                      {a.timer_minutes ? ` · ${a.timer_minutes} min` : ""}
                      {a.due_at ? ` · due ${new Date(a.due_at).toLocaleDateString("en-GB")}` : ""}
                    </p>
                  </div>
                  {done ? (
                    <span className="rounded-lg border border-border px-2.5 py-1 text-[12px] text-foreground">
                      {Math.round(Number(done.marks_awarded))}/{Math.round(Number(done.total_marks))}
                    </span>
                  ) : (
                    <Link
                      to="/practice/$mode/$subject"
                      params={{ mode: a.mode, subject: a.subject }}
                      className="rounded-lg bg-foreground px-3 py-1.5 text-[12px] font-semibold text-background transition hover:brightness-110"
                    >
                      Start
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}