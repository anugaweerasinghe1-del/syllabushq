import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { findSeoPage, seoTitle, seoDescription } from "@/data/seo-matrix";

const SITE = "https://app.syllabushq.workers.dev";

export const Route = createFileRoute("/learn/$subject/$topic/$slug")({
  loader: ({ params }) => {
    const page = findSeoPage(params.subject, params.topic, params.slug);
    if (!page) throw notFound();
    return page;
  },
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl">Page not found</h1>
        <p className="mt-3 text-muted-foreground">This study guide doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block underline">Back home</Link>
      </main>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{String(error?.message ?? error)}</p>
      </main>
    </div>
  ),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [] };
    const url = `${SITE}/learn/${params.subject}/${params.topic}/${params.slug}`;
    const title = seoTitle(loaderData);
    const description = seoDescription(loaderData);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOccupationalProgram",
            name: title,
            description,
            provider: { "@type": "EducationalOrganization", name: "SyllabusHQ", url: SITE },
            educationalLevel: "G.C.E. Ordinary Level",
            occupationalCategory: loaderData.subjectName,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE },
              { "@type": "ListItem", position: 2, name: loaderData.subjectName, item: `${SITE}/practice/mcq/${loaderData.subject}` },
              { "@type": "ListItem", position: 3, name: loaderData.topicName, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `Is this ${loaderData.topicName} practice free for O/L students in ${loaderData.city}?`,
                acceptedAnswer: { "@type": "Answer", text: "Yes. Every question, marking scheme, and worked solution is free with no login required." },
              },
              {
                "@type": "Question",
                name: `Are these ${loaderData.topicName} questions from real past papers?`,
                acceptedAnswer: { "@type": "Answer", text: "No. Every question is original and AI-written in the style of the Sri Lankan O/L English-medium papers." },
              },
            ],
          }),
        },
      ],
    };
  },
  component: SeoLandingPage,
});

function SeoLandingPage() {
  const p = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {p.subjectName} · {p.difficulty} · {p.city}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] text-foreground sm:text-6xl text-balance">
          {p.topicName} practice for O/L students in {p.city}.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Free, original {p.difficulty}-difficulty practice questions on{" "}
          <strong className="text-foreground">{p.topicName}</strong>, written in the style
          of the Sri Lankan G.C.E. Ordinary Level English-medium papers and AI-graded
          against a real marking scheme.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/practice/$mode/$subject"
            params={{ mode: "mcq", subject: p.subject }}
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background"
          >
            Begin a {p.subjectName} paper →
          </Link>
          <Link
            to="/practice"
            className="inline-flex items-center justify-center rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-foreground"
          >
            Browse all modes
          </Link>
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl">Why students in {p.city} use SyllabusHQ</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <PremiumCard className="p-5" hover={false}>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Original</p>
              <p className="mt-2 text-sm text-foreground">Every question is AI-written for SyllabusHQ — never lifted from any past paper.</p>
            </PremiumCard>
            <PremiumCard className="p-5" hover={false}>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Marked</p>
              <p className="mt-2 text-sm text-foreground">An AI chief examiner grades your answer against a real scheme, point by point.</p>
            </PremiumCard>
            <PremiumCard className="p-5" hover={false}>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free</p>
              <p className="mt-2 text-sm text-foreground">No login, no payment. Built for Sri Lanka's sharpest O/L students.</p>
            </PremiumCard>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl">What {p.topicName} covers</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {p.topicName} is a core unit in the Sri Lankan O/L {p.subjectName} syllabus. In a
            typical Paper 1, expect multiple-choice items worth 1 mark each. In Paper 2,
            expect structured questions with marking schemes that award marks per
            correct point — exactly how SyllabusHQ grades you.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-hairline p-6">
          <h2 className="font-display text-2xl">Ready when you are</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Practice for free in three taps. No login. No spam. Just the syllabus.
          </p>
          <Link
            to="/practice/$mode/$subject"
            params={{ mode: "mcq", subject: p.subject }}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background"
          >
            Start {p.topicName} practice →
          </Link>
        </section>
      </main>
    </div>
  );
}