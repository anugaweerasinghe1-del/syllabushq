import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { subjectsQuery, questionsQuery } from "@/lib/content";
import { MathText } from "@/components/MathText";
import { pickQuestions } from "@/lib/pickQuestions";
import { downloadPackDocx, downloadPackPdf } from "@/lib/exportPack";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorToken } from "@/lib/visitor";

type PackSearch = {
  subject: string;
  topic: string;
  count: number;
  difficulty: string;
  online?: boolean;
};

export const Route = createFileRoute("/for-teachers/pack")({
  validateSearch: (raw: Record<string, unknown>): PackSearch => ({
    subject: typeof raw.subject === "string" ? raw.subject : "mathematics",
    topic: typeof raw.topic === "string" ? raw.topic : "mix",
    count: Number(raw.count) > 0 ? Math.floor(Number(raw.count)) : 20,
    difficulty: typeof raw.difficulty === "string" ? raw.difficulty : "all",
    online: raw.online === true || raw.online === "1" || raw.online === 1 ? true : undefined,
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(subjectsQuery);
    await context.queryClient.ensureQueryData(questionsQuery);
  },
  head: () => ({
    meta: [
      { title: "Printable question pack — SyllabusHQ" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PackPage,
});

function PackPage() {
  const search = Route.useSearch();
  const { subject: subjectSlug, topic: topicSlug, count, online } = search;
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const { data: questions } = useSuspenseQuery(questionsQuery);

  const subject = subjects.find((s) => s.slug === subjectSlug) ?? subjects[0];
  const topicName =
    topicSlug === "mix"
      ? "Mixed topics"
      : (subject.topics.find((t) => t.slug === topicSlug)?.name ?? "Mixed topics");

  const items = useMemo(() => {
    const base = questions.filter((q) => q.subject === subject.slug);
    return pickQuestions({
      pool: base,
      topics: topicSlug === "mix" ? [] : [topicSlug],
      count: Math.max(1, Math.min(50, count)),
      balanced: true,
      // Deterministic seed so SSR and the client render the same pack.
      seed: `${subject.slug}|${topicSlug}|${count}`
        .split("")
        .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7),
    });
  }, [questions, subject.slug, topicSlug, count]);

  // Rendered after mount only — locale/date differ between server and client.
  const [dateStr, setDateStr] = useState("");
  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("en-LK", { day: "numeric", month: "long", year: "numeric" }),
    );
  }, []);

  const [includeScheme, setIncludeScheme] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const score = items.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);

  async function copyClassLink() {
    const url = `${window.location.origin}/for-teachers/pack?subject=${encodeURIComponent(
      subject.slug,
    )}&topic=${encodeURIComponent(topicSlug)}&count=${count}&difficulty=${encodeURIComponent(
      search.difficulty,
    )}&online=1`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link for your class:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);

  const meta = {
    subjectName: subject.name,
    topicName,
    items,
    includeScheme,
  };

  async function download(kind: "pdf" | "docx") {
    setBusy(kind);
    try {
      if (kind === "pdf") await downloadPackPdf(meta);
      else await downloadPackDocx(meta);
    } catch (err) {
      console.error("[pack] export failed", err);
      window.alert("That export failed. Try the Print option instead.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="pack-root min-h-screen bg-white text-neutral-900">
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .pack-root { background: white !important; color: #111 !important; }
          .page-break { break-before: page; page-break-before: always; }
          a { color: inherit; text-decoration: none; }
        }
        @page { margin: 18mm 16mm; }
      `}</style>

      <div className="no-print sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
          {online ? (
            <Link to="/" className="text-neutral-500 hover:text-neutral-900">
              SyllabusHQ · Class pack
            </Link>
          ) : (
            <Link to="/for-teachers" className="text-neutral-500 hover:text-neutral-900">
              ← Back to teacher tools
            </Link>
          )}
          {online ? (
            <div className="flex items-center gap-3 text-sm text-neutral-700">
              {submitted ? (
                <span className="font-semibold">
                  Score: {score}/{items.length}
                </span>
              ) : (
                <span>
                  {Object.keys(answers).length}/{items.length} answered
                </span>
              )}
              {!submitted && (
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
                >
                  Submit answers
                </button>
              )}
            </div>
          ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyClassLink}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
            >
              {copied ? "Link copied ✓" : "Copy class link"}
            </button>
            <label className="flex items-center gap-2 text-[13px] text-neutral-600">
              <input
                type="checkbox"
                checked={includeScheme}
                onChange={(e) => setIncludeScheme(e.target.checked)}
                className="h-4 w-4 accent-neutral-900"
              />
              Include marking scheme
            </label>
            <button
              onClick={() => download("pdf")}
              disabled={busy !== null}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-60"
            >
              {busy === "pdf" ? "Preparing…" : "Download PDF"}
            </button>
            <button
              onClick={() => download("docx")}
              disabled={busy !== null}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-60"
            >
              {busy === "docx" ? "Preparing…" : "Download Word"}
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
            >
              Print
            </button>
          </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="border-b border-neutral-300 pb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            Sri Lankan G.C.E. Ordinary Level · Practice Paper
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">{subject.name}</h1>
          <p className="mt-2 text-sm text-neutral-600">{topicName}</p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-4 text-left text-xs text-neutral-600">
            <div>
              <p className="uppercase tracking-widest">Candidate</p>
              <p className="mt-1 border-b border-neutral-300 pb-1">&nbsp;</p>
            </div>
            <div>
              <p className="uppercase tracking-widest">Index No.</p>
              <p className="mt-1 border-b border-neutral-300 pb-1">&nbsp;</p>
            </div>
            <div>
              <p className="uppercase tracking-widest">Date</p>
              <p className="mt-1 border-b border-neutral-300 pb-1">{dateStr}</p>
            </div>
          </div>
          <p className="mt-6 text-xs text-neutral-500">
            Answer all {items.length} questions. Each question carries 1 mark. Total: {items.length}{" "}
            marks.
          </p>
        </header>

        <section className="mt-8">
          <ol className="space-y-6">
            {items.map((q, i) => (
              <li key={i} className="rounded-md border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold text-neutral-500">Q{i + 1}.</p>
                  <p className="text-[11px] text-neutral-500">[1]</p>
                </div>
                <p className="mt-1 text-[15px] leading-relaxed text-neutral-900">
                  <MathText>{q.question}</MathText>
                </p>
                <ol className="mt-3 grid gap-1.5 sm:grid-cols-2" type="A">
                  {q.options.map((opt, j) => (
                    <li
                      key={j}
                      onClick={() => {
                        if (online && !submitted) setAnswers((a) => ({ ...a, [i]: j }));
                      }}
                      className={`text-[13px] text-neutral-800 ${
                        online
                          ? `cursor-pointer rounded-md border px-2 py-1.5 ${
                              submitted && j === q.correct
                                ? "border-green-600 bg-green-50"
                                : submitted && answers[i] === j
                                  ? "border-red-500 bg-red-50"
                                  : answers[i] === j
                                    ? "border-neutral-900 bg-neutral-100"
                                    : "border-neutral-200 hover:bg-neutral-50"
                            }`
                          : ""
                      }`}
                    >
                      <span className="mr-2 font-mono text-neutral-500">
                        {String.fromCharCode(65 + j)}.
                      </span>
                      <MathText>{opt}</MathText>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </section>

        {/* Marking scheme starts on a new page when printed */}
        {online && submitted && (
          <p className="mt-8 rounded-md border border-neutral-300 p-4 text-center text-sm">
            You scored <strong>{score}/{items.length}</strong>. Correct answers are shown in green;
            explanations are below.
          </p>
        )}
        {online && submitted && (
          <Leaderboard
            packKey={`${subject.slug}|${topicSlug}|${count}|${search.difficulty}`}
            score={score}
            total={items.length}
          />
        )}
        <section
          className={`page-break mt-14 ${
            online ? (submitted ? "" : "hidden") : includeScheme ? "" : "hidden"
          }`}
        >
          <header className="border-b border-neutral-300 pb-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
              Marking Scheme
            </p>
            <h2 className="mt-2 font-display text-2xl">
              {subject.name} · {topicName}
            </h2>
          </header>
          <ol className="mt-6 space-y-4">
            {items.map((q, i) => (
              <li key={i} className="border-b border-neutral-100 pb-3">
                <p className="text-[13px] font-semibold text-neutral-900">
                  Q{i + 1}.{" "}
                  <span className="font-normal text-neutral-700">
                    <MathText>{q.question}</MathText>
                  </span>
                </p>
                <p className="mt-1 text-[13px] text-neutral-800">
                  <span className="font-semibold">Answer:</span>{" "}
                  {String.fromCharCode(65 + q.correct)} —{" "}
                  <MathText>{q.options[q.correct]}</MathText>
                </p>
                <p className="mt-1 text-[12px] text-neutral-600">
                  <span className="font-semibold">Explanation:</span>{" "}
                  <MathText>{q.explanation}</MathText>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-10 border-t border-neutral-200 pt-4 text-center text-[11px] text-neutral-400">
          Generated by SyllabusHQ · Free O/L practice for every Sri Lankan student ·
          app.syllabushq.workers.dev
        </footer>
      </main>
    </div>
  );
}

type Row = { name: string; score: number; total: number };

function Leaderboard({ packKey, score, total }: { packKey: string; score: number; total: number }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [posted, setPosted] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    const { data } = await supabase
      .from("pack_scores")
      .select("name, score, total")
      .eq("pack_key", packKey)
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(20);
    setRows(data ?? []);
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packKey]);

  async function post() {
    const n = name.trim().slice(0, 40);
    if (!n) return;
    setErr("");
    const { error } = await supabase
      .from("pack_scores")
      .insert({ pack_key: packKey, name: n, score, total, visitor_token: getVisitorToken() });
    if (error) {
      setErr(
        error.code === "23505"
          ? "Your score for this pack is already on the board."
          : "Couldn't post your score — try again.",
      );
      if (error.code === "23505") setPosted(true);
      return;
    }
    setPosted(true);
    void load();
  }

  return (
    <section className="no-print mt-8 rounded-md border border-neutral-300 p-5">
      <h2 className="text-lg font-semibold">Class leaderboard</h2>
      {!posted ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Your name"
            aria-label="Your name"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={post}
            disabled={!name.trim()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add my score
          </button>
        </div>
      ) : null}
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">No scores yet — be the first.</p>
      ) : (
        <ol className="mt-3 divide-y divide-neutral-200 text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex justify-between py-1.5">
              <span>
                <span className="mr-2 font-mono text-neutral-500">{i + 1}.</span>
                {r.name}
              </span>
              <span className="font-semibold">
                {r.score}/{r.total}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
