import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { subjectsQuery, questionsQuery, countByTopic } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/$subject")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s) => s.slug === params.subject);
    if (!subject) throw notFound();
    await context.queryClient.ensureQueryData(questionsQuery);
    return { subject };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.subject.name} — O/L practice topics`,
          },
          {
            name: "description",
            content: `Practice ${loaderData.subject.name} for the Sri Lankan O/L exam. ${loaderData.subject.topics.length} topics, free MCQs in English medium.`,
          },
          {
            property: "og:title",
            content: `${loaderData.subject.name} — O/L practice`,
          },
          {
            property: "og:description",
            content: `Free O/L ${loaderData.subject.name} practice quizzes — ${loaderData.subject.topics.length} topics.`,
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink">Subject not found</h1>
        <Link to="/" className="mt-4 inline-block text-marigold hover:underline">
          Back to home
        </Link>
      </main>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink">Couldn't load subject</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </main>
    </div>
  ),
  component: SubjectPage,
});

function SubjectPage() {
  const { subject } = Route.useLoaderData();
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const counts = countByTopic(questions);

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-4 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-ink">
            ← Home
          </Link>
        </nav>
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-marigold">
            Subject
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">
            {subject.name}
          </h1>
          <p className="mt-2 text-charcoal">
            <span className="font-num">{subject.topics.length}</span> topics. Pick one
            to start a 10-question practice set.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {subject.topics.map((t) => {
            const count = counts.get(`${subject.slug}::${t.slug}`) ?? 0;
            const disabled = count === 0;
            return (
              <li key={t.slug}>
                <Link
                  to="/$subject/$topic"
                  params={{ subject: subject.slug, topic: t.slug }}
                  disabled={disabled}
                  className={
                    "group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition hover:border-ink hover:shadow-sm " +
                    (disabled ? "pointer-events-none opacity-50" : "")
                  }
                >
                  <span className="font-medium text-ink">{t.name}</span>
                  <span className="font-num text-xs text-muted-foreground group-hover:text-ink">
                    {count} Qs
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
