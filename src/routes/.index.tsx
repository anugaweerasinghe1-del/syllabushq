import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { subjectsQuery, questionsQuery, countByTopic, type Subject, type Topic } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";

const SITE = "https://syllabushq.lovable.app";

export const Route = createFileRoute("/$subject/")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s: Subject) => s.slug === params.subject);
    if (!subject) throw notFound();
    await context.queryClient.ensureQueryData(questionsQuery);
    return { subject } as { subject: Subject };
  },
  head: ({ params, loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.subject.name} — O/L practice (Sri Lanka, English medium)` },
          { name: "description", content: `Free Sri Lankan O/L ${loaderData.subject.name} practice across ${loaderData.subject.topics.length} syllabus topics. MCQs, structured papers, short-answer drills.` },
          { property: "og:title", content: `${loaderData.subject.name} — O/L practice` },
          { property: "og:url", content: `${SITE}/${params.subject}` },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `${SITE}/${params.subject}` }] : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="font-display text-3xl">Subject not found</h1><Link to="/" className="mt-4 inline-block text-amber hover:underline">Back home</Link></main></div>
  ),
  component: SubjectPage,
});

function SubjectPage() {
  const { subject } = Route.useLoaderData();
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const counts = countByTopic(questions);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-6 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">← Home</Link>
        </nav>
        <header className="mb-10 rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">Subject</p>
          <h1 className="mt-2 font-display text-5xl text-foreground sm:text-6xl text-balance">{subject.name}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            <span className="font-num text-foreground">{subject.topics.length}</span> syllabus topics.
            Pick one to start a 10-question practice set with explanations.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {subject.topics.map((t: Topic, i: number) => {
            const count = counts.get(`${subject.slug}::${t.slug}`) ?? 0;
            const disabled = count === 0;
            return (
              <li key={t.slug}>
                {disabled ? (
                  <div aria-disabled className="flex items-center justify-between rounded-xl border border-hairline bg-surface p-4 opacity-40">
                    <span className="font-medium text-foreground">{t.name}</span>
                    <span className="font-num text-xs text-muted-foreground">Coming soon</span>
                  </div>
                ) : (
                  <Link
                    to="/$subject/$topic"
                    params={{ subject: subject.slug, topic: t.slug }}
                    className="group flex items-center justify-between rounded-xl border border-hairline bg-surface p-4 transition hover:border-amber/50 hover:bg-secondary"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-num text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-medium text-foreground">{t.name}</span>
                    </span>
                    <span className="font-num text-xs text-muted-foreground group-hover:text-amber">{count} Qs →</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
