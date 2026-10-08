import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { GUIDES, CATEGORY_LABEL, type GuideCategory } from "@/data/guides";
import { SITE_URL } from "@/lib/site";

const TITLE = "O/L Study Guides — Past Papers, Exam Strategy & Topics | SyllabusHQ";
const DESC =
  "Free, original guides for Sri Lankan G.C.E. O/L students: past paper structures, how to get an A in Maths and Science, accounting explained and study timetables.";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE_URL}/guides` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/guides` }],
  }),
  component: GuidesIndex,
});

const ORDER: GuideCategory[] = ["past-papers", "exam-strategy", "study-guide"];

function GuidesIndex() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {GUIDES.length} free guides
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          O/L study guides
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Plain-English guides to every part of the Sri Lankan O/L, built from official paper
          structures. No fluff, no made-up dates.
        </p>
        {ORDER.map((cat) => (
          <section key={cat} className="mt-12">
            <h2 className="font-display text-2xl text-foreground">{CATEGORY_LABEL[cat]}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {GUIDES.filter((g) => g.category === cat).map((g) => (
                <a key={g.slug} href={`/guides/${g.slug}`} className="block">
                  <PremiumCard className="h-full p-5">
                    <p className="font-semibold text-foreground">{g.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{g.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{g.readMinutes} min read</p>
                  </PremiumCard>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
