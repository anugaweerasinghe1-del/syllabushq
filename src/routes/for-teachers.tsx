import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { subjectsQuery } from "@/lib/content";

export const Route = createFileRoute("/for-teachers")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(subjectsQuery);
  },
  head: () => ({
    meta: [
      { title: "For Teachers — printable O/L question packs & lesson resources | SyllabusHQ" },
      {
        name: "description",
        content:
          "Free classroom resources for Sri Lankan G.C.E. O/L teachers: printable question packs with marking schemes, past-paper analyses, lesson-plan templates, and topic worksheets. No login required.",
      },
      { property: "og:title", content: "For Teachers — SyllabusHQ" },
      { property: "og:description", content: "Printable O/L question packs, marking schemes and lesson-plan templates — free for every Sri Lankan classroom." },
      { property: "og:url", content: `${SITE_URL}/for-teachers` },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/for-teachers` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "For Teachers — SyllabusHQ",
          url: `${SITE_URL}/for-teachers`,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
        }),
      },
    ],
  }),
  component: TeachersPage,
});

function TeachersPage() {
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const navigate = useNavigate();
  const [subject, setSubject] = useState<string>(subjects[0]?.slug ?? "mathematics");
  const [topic, setTopic] = useState<string>("mix");
  const [count, setCount] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");

  const topics = useMemo(
    () => subjects.find((s) => s.slug === subject)?.topics ?? [],
    [subjects, subject],
  );

  function buildPack() {
    const params = new URLSearchParams({
      subject,
      topic,
      count: String(count),
      difficulty,
    });
    navigate({ to: "/for-teachers/pack", search: Object.fromEntries(params) as never });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-amber">For teachers</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl text-balance">
            Ready-to-print papers, marked in the way your students will be marked.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Choose a subject, a topic and a length — SyllabusHQ prints an O/L-style question paper on page 1
            and the marking scheme on page 2. Free, no login, no watermarks. Perfect for class quizzes, cover
            lessons and homework packs.
          </p>
        </header>

        {/* Pack builder */}
        <section className="mt-14">
          <h2 className="font-display text-2xl text-foreground">Build a printable question pack</h2>
          <PremiumCard hover={false} className="mt-5 p-6 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); setTopic("mix"); }}
                  className="mt-2 w-full rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm text-foreground focus:border-foreground/40 focus:outline-none"
                >
                  {subjects.map((s) => <option key={s.slug} value={s.slug} className="bg-background">{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm text-foreground focus:border-foreground/40 focus:outline-none"
                >
                  <option value="mix" className="bg-background">Mixed (all topics)</option>
                  {topics.map((t) => <option key={t.slug} value={t.slug} className="bg-background">{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Number of questions ({count})</label>
                <input
                  type="range"
                  min={5} max={40} step={5}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="mt-3 w-full accent-amber"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Difficulty</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["all", "easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                        difficulty === d
                          ? "border-foreground bg-foreground/10 text-foreground"
                          : "border-hairline text-muted-foreground hover:border-hairline-strong hover:text-foreground"
                      }`}
                    >{d}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Opens in a printable view — hit Ctrl/⌘ + P to save as PDF.</p>
              <button
                onClick={buildPack}
                className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
              >
                Build & preview pack →
              </button>
            </div>
          </PremiumCard>
        </section>

        {/* Free resources hub */}
        <section className="mt-14">
          <h2 className="font-display text-2xl text-foreground">Free teacher resources</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Curated links every O/L classroom in Sri Lanka should have bookmarked.
          </p>
          <PremiumCard hover={false} className="mt-5 p-6 sm:p-7">
            <ul className="divide-y divide-hairline">
              <ResRow
                title="Official NIE syllabi & teacher guides"
                note="National Institute of Education portal — every current-year syllabus, teacher's guide, and unit plan by subject."
                href="https://nie.lk/"
              />
              <ResRow
                title="e-thaksalawa — full curriculum library"
                note="Ministry-hosted textbooks, worksheets, past papers, and marking schemes — grade 10 & 11 in all three mediums."
                href="https://e-thaksalawa.moe.gov.lk/"
              />
              <ResRow
                title="Department of Examinations — past papers & schemes"
                note="Official past papers and marking schemes released after each sitting. Set homework straight from the real papers."
                href="https://doenets.lk/"
              />
              <ResRow
                title="SyllabusHQ resource hub"
                note="Our curated exam-day checklist, past-paper archives, and syllabus jump-off links — sharable with your class."
                internal="/resources"
              />
            </ul>
          </PremiumCard>
        </section>

        {/* Classroom ideas */}
        <section className="mt-14">
          <h2 className="font-display text-2xl text-foreground">Ways teachers use SyllabusHQ</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <IdeaCard
              title="Starter drill"
              body="Open the Daily Question on the projector at the start of class — same question every student in Sri Lanka gets that day."
            />
            <IdeaCard
              title="Cover lesson pack"
              body="Build a 20-question printable pack in 30 seconds when you need a self-contained lesson for a substitute teacher."
            />
            <IdeaCard
              title="Homework by topic"
              body="After teaching a topic, generate a 10-question pack for that exact topic — marking scheme prints on page 2."
            />
            <IdeaCard
              title="Revision Friday"
              body="Mix a whole-subject 30-question pack for weekly revision. Time your class against the built-in exam timer."
            />
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-hairline p-6 sm:p-8">
          <h2 className="font-display text-2xl text-foreground">Get in touch</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Want a bespoke pack (e.g. mixed 2-mark + structured section, with marking scheme in your school's format)?
            Email us — we'll build and send within 48 hours, free.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="mailto:hello@syllabushq.app?subject=Custom%20O%2FL%20question%20pack"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background"
            >
              Email us
            </a>
            <Link
              to="/resources"
              className="inline-flex items-center justify-center rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-foreground"
            >
              Browse the resource hub →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function ResRow({ title, note, href, internal }: { title: string; note: string; href?: string; internal?: string }) {
  if (internal) {
    return (
      <li className="py-4 first:pt-0 last:pb-0">
        <Link to={internal} className="group flex items-baseline justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-foreground group-hover:text-amber transition-colors">{title}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{note}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground group-hover:text-amber transition-colors">→</span>
        </Link>
      </li>
    );
  }
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <a href={href} target="_blank" rel="noopener" className="group flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-foreground group-hover:text-amber transition-colors">{title}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{note}</p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground group-hover:text-amber transition-colors">↗</span>
      </a>
    </li>
  );
}

function IdeaCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-hairline p-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-amber">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">{body}</p>
    </div>
  );
}