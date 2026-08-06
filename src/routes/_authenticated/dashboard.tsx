import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { getMe, updateProfile } from "@/lib/school.functions";
import { progressOverview } from "@/lib/progress.functions";
import subjectsData from "@/data/subjects.json";

type SubjectJSON = { slug: string; name: string; topics: { slug: string; name: string }[] };
const SUBJECTS = subjectsData as SubjectJSON[];

const subjectName = (slug: string) => SUBJECTS.find((s) => s.slug === slug)?.name ?? slug;
const topicName = (subject: string, topic: string) =>
  SUBJECTS.find((s) => s.slug === subject)?.topics.find((t) => t.slug === topic)?.name ?? topic;

const MODE_LABEL: Record<string, string> = {
  mcq: "Multiple choice",
  short: "Short answer",
  structured: "Structured paper",
  exam: "Full exam simulation",
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your progress — SyllabusHQ" },
      {
        name: "description",
        content:
          "Your O/L progress on SyllabusHQ: study streak, accuracy by subject, weakest topics and every paper you've completed.",
      },
      { property: "og:title", content: "Your progress — SyllabusHQ" },
      {
        property: "og:description",
        content: "Streaks, accuracy and weak topics, synced to your account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const fetchMe = useServerFn(getMe);
  const fetchProgress = useServerFn(progressOverview);
  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const progress = useQuery({ queryKey: ["progress"], queryFn: () => fetchProgress() });
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

  const { profile } = me.data;
  const p = progress.data;

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Your progress
          </p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">
            {profile.full_name ? `Hello, ${profile.full_name.split(" ")[0]}.` : "Welcome back."}
          </h1>
        </div>
        <button
          onClick={signOut}
          className="rounded-xl border border-border px-3.5 py-2 text-[13px] text-muted-foreground transition hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Papers completed" value={p ? String(p.totals.papers) : "—"} />
        <Stat
          label="Questions marked"
          value={p ? String(p.totals.outOf) : "—"}
        />
        <Stat label="Overall accuracy" value={p && p.totals.outOf ? `${p.totals.accuracy}%` : "—"} />
      </div>

      <StreakHeatmap extraDays={p?.days ?? []} />

      {p?.lastSession && (
        <Card title="Pick up where you left off">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Last time: {MODE_LABEL[p.lastSession.mode] ?? p.lastSession.mode} ·{" "}
              {subjectName(p.lastSession.subject)}
              {p.lastSession.topic && p.lastSession.topic !== "mix"
                ? ` · ${topicName(p.lastSession.subject, p.lastSession.topic)}`
                : ""}
            </p>
            <Link
              to="/practice/$mode/$subject"
              params={{ mode: p.lastSession.mode, subject: p.lastSession.subject }}
              className="rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Continue
            </Link>
          </div>
        </Card>
      )}

      <Card title="By subject">
        {progress.isLoading && <p className="text-sm text-muted-foreground">Loading your results…</p>}
        {p && p.subjects.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No papers yet.{" "}
            <Link to="/practice" className="text-foreground underline underline-offset-4">
              Start practising
            </Link>{" "}
            and everything you do from now on is saved here.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          {(p?.subjects ?? []).map((s) => (
            <div key={s.subject} className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-[14px] font-semibold text-foreground">{subjectName(s.subject)}</p>
              <p className="mt-2 font-display text-3xl text-foreground">
                {s.answered ? `${s.accuracy}%` : "—"}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {s.sessions} paper{s.sessions === 1 ? "" : "s"} · {s.answered} questions marked
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Your weakest topics">
        {p && p.weakest.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Finish a few topic sets and your five weakest topics will appear here with a one-tap
            practice link.
          </p>
        )}
        <ul className="space-y-2">
          {(p?.weakest ?? []).map((t) => (
            <li
              key={`${t.subject}-${t.topic}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 p-4"
            >
              <div>
                <p className="text-[14px] font-semibold text-foreground">
                  {topicName(t.subject, t.topic)}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {subjectName(t.subject)} · {Math.round(t.accuracy * 100)}% ({t.marks}/{t.total})
                </p>
              </div>
              <Link
                to="/$subject/$topic"
                params={{ subject: t.subject, topic: t.topic }}
                className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-foreground transition hover:brightness-110"
              >
                Practise this
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Paper history">
        {p && p.sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
        )}
        <ul className="divide-y divide-border">
          {(p?.sessions ?? []).map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-[14px] text-foreground">
                  {MODE_LABEL[s.mode] ?? s.mode} · {subjectName(s.subject)}
                  {s.topic && s.topic !== "mix" ? ` · ${topicName(s.subject, s.topic)}` : ""}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {new Date(s.at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span className="rounded-lg border border-border px-2.5 py-1 font-num text-[12px] text-foreground">
                {s.total > 0 ? `${s.marks}/${s.total}` : "AI-marked"}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <ProfileCard initial={profile} />
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl text-foreground">{value}</p>
    </div>
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
        className="mt-3 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
      >
        {m.isPending ? "Saving…" : "Save"}
      </button>
    </Card>
  );
}
