import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ExamTimer } from "@/components/ExamTimer";
import { PastPaperAnswerSheet } from "@/components/PastPaperAnswerSheet";
import { Button } from "@/components/ui/button";
import { getPastPaper } from "@/lib/past-papers";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/past-papers/$paper")({
  loader: ({ params }) => {
    const paper = getPastPaper(params.paper);
    if (!paper) throw notFound();
    return { paper };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Past paper unavailable — SyllabusHQ" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.paper.subjectName} ${loaderData.paper.sitting} O/L Past Paper`;
    const description = `Sit the official Sri Lankan G.C.E. O/L ${loaderData.paper.subjectName} ${loaderData.paper.sitting} English-medium paper online or download the original PDF.`;
    return {
      meta: [
        { title: `${title} | SyllabusHQ` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/past-papers/${loaderData.paper.slug}` }],
    };
  },
  component: LivePastPaper,
});

function LivePastPaper() {
  const { paper } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1500px] px-3 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/past-papers" className="text-xs text-muted-foreground hover:text-foreground">← Past papers</Link>
            <h1 className="mt-1 font-display text-2xl text-foreground sm:text-3xl">{paper.subjectName} · {paper.sitting}</h1>
            <p className="mt-1 text-xs text-muted-foreground">Official {paper.medium}-medium paper · {paper.durationLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <ExamTimer storageKey={`official-paper-${paper.slug}`} durationSec={paper.durationSeconds} />
            <Button asChild variant="outline" size="sm"><a href={paper.pdfUrl} download><Download /> PDF</a></Button>
            <Button asChild variant="ghost" size="icon"><a href={paper.pdfUrl} target="_blank" rel="noopener" aria-label="Open paper in a new tab"><ExternalLink /></a></Button>
          </div>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {paper.sections.map((section) => (
            <div key={section.label} className="rounded-lg border border-hairline bg-surface p-3">
              <p className="text-xs font-semibold text-foreground">{section.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{section.questions}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-foreground/75">{section.instruction}</p>
            </div>
          ))}
        </div>

        <div className={paper.mcqCount ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px]" : "grid gap-4"}>
          <section className="overflow-hidden rounded-xl border border-hairline bg-surface" aria-label="Official examination paper">
            <object data={paper.pdfUrl} type="application/pdf" className="h-[calc(100vh-12rem)] min-h-[680px] w-full">
              <div className="p-8 text-center text-sm text-muted-foreground">
                <p>Your browser cannot display the paper inside this page.</p>
                <Button asChild className="mt-4"><a href={paper.pdfUrl} target="_blank" rel="noopener">Open official paper</a></Button>
              </div>
            </object>
          </section>
          {paper.mcqCount ? <aside><PastPaperAnswerSheet paperSlug={paper.slug} count={paper.mcqCount} /></aside> : null}
        </div>
      </main>
    </div>
  );
}