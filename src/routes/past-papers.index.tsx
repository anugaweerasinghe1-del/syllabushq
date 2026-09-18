import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Play } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { Button } from "@/components/ui/button";
import { PAST_PAPERS } from "@/lib/past-papers";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/past-papers/")({
  head: () => ({
    meta: [
      { title: "Sri Lankan O/L Past Papers — Live & PDF | SyllabusHQ" },
      { name: "description", content: "Sit official Sri Lankan G.C.E. O/L Mathematics, Science and Business & Accounting past papers online or download the original English-medium PDFs." },
      { property: "og:title", content: "Sri Lankan O/L Past Papers — SyllabusHQ" },
      { property: "og:description", content: "Official papers, exact PDF pages, live timers and saved answer sheets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/past-papers` }],
  }),
  component: PastPapersPage,
});

function PastPapersPage() {
  const subjects = ["mathematics", "science", "business-accounting"] as const;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="max-w-3xl rise">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-orange">Official archive · English medium</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-6xl">Real Sri Lankan O/L papers.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">Open the exact supplied examination paper beside a saved answer sheet and persistent timer, or download the original PDF unchanged.</p>
        </header>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm text-foreground/85">
          <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
          <p><strong className="text-foreground">Official and generated content are now separated.</strong> These papers retain their original pages, diagrams, numbering, local contexts, and Unicode mathematics notation.</p>
        </div>

        {subjects.map((subject) => {
          const papers = PAST_PAPERS.filter((paper) => paper.subject === subject);
          if (!papers.length) return null;
          return (
            <section key={subject} className="mt-12">
              <h2 className="font-display text-2xl text-foreground">{papers[0]?.subjectName}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {papers.map((paper) => (
                  <PremiumCard key={paper.slug} className="flex h-full flex-col p-5 sm:p-6" hover={false}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Department of Examinations · {paper.medium}</p>
                        <h3 className="mt-2 font-display text-2xl text-foreground">{paper.sitting}</h3>
                      </div>
                      <span className="rounded-md border border-hairline px-2 py-1 font-num text-[10px] text-muted-foreground">{paper.pages} pages</span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{paper.durationLabel}</p>
                    <div className="mt-5 space-y-2 border-t border-hairline pt-4">
                      {paper.sections.map((section) => (
                        <div key={section.label} className="flex items-start justify-between gap-4 text-xs">
                          <span className="text-foreground">{section.label}</span>
                          <span className="text-right text-muted-foreground">{section.questions}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      <Button asChild>
                        <Link to="/past-papers/$paper" params={{ paper: paper.slug }}><Play /> Start live paper</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <a href={paper.pdfUrl} download><Download /> Original PDF</a>
                      </Button>
                    </div>
                  </PremiumCard>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}