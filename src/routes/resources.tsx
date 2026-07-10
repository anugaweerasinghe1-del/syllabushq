import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "O/L Resources — syllabus, past papers & marking schemes | SyllabusHQ" },
      {
        name: "description",
        content:
          "The Sri Lankan G.C.E. O/L resource hub: official NIE syllabi, past-paper archives, marking schemes, and an exam-day checklist — every link vetted and free.",
      },
      { property: "og:title", content: "O/L Resources — SyllabusHQ" },
      { property: "og:description", content: "NIE syllabi, past papers, marking schemes, exam-day checklist." },
      { property: "og:url", content: `${SITE_URL}/resources` },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/resources` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "O/L Resources",
          url: `${SITE_URL}/resources`,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          about: "Sri Lankan G.C.E. Ordinary Level exam resources",
        }),
      },
    ],
  }),
  component: ResourcesPage,
});

type Row = { title: string; href: string; note: string };

const SYLLABI: Row[] = [
  { title: "National Institute of Education (NIE) — syllabus portal", href: "https://nie.lk/", note: "The official source for every G.C.E. O/L syllabus. From the homepage open 'Curriculum' → 'Syllabi' to pick a subject and download the current-year PDF." },
  { title: "e-thaksalawa — Ministry of Education subject portal", href: "https://e-thaksalawa.moe.gov.lk/", note: "Government e-learning portal. Every syllabus, teacher's guide, and textbook is filed here by grade and subject." },
  { title: "Ministry of Education — Sri Lanka", href: "https://moe.gov.lk/", note: "Circulars, curriculum policy updates, and the official school calendar." },
  { title: "Department of Examinations — main portal", href: "https://doenets.lk/", note: "Exam timetables, admission-card downloads, and result checking." },
];

const PAST_PAPERS: Row[] = [
  { title: "Department of Examinations — past papers", href: "https://doenets.lk/", note: "Official past papers and marking schemes released after each sitting. On the homepage open 'Examinations' → 'Past Papers'." },
  { title: "e-thaksalawa — model & past papers", href: "https://e-thaksalawa.moe.gov.lk/", note: "Ministry-hosted archive of past papers, model papers, and marking schemes by year, subject, and medium." },
  { title: "pastpapers.wiki — community archive", href: "https://pastpapers.wiki/", note: "Community-uploaded archive spanning ~15 years. Cross-check answers with the official marking scheme before trusting." },
];

const EXAM_DAY: Row[] = [
  { title: "Two pens (blue), two pencils (2B), sharpener, eraser", href: "#", note: "You can't borrow inside the hall. Bring backups." },
  { title: "Non-programmable scientific calculator", href: "#", note: "Check the memory is cleared. No graphing calculators." },
  { title: "Ruler, protractor, geometry set", href: "#", note: "Geometry paper needs this — don't rely on freehand." },
  { title: "Admission card + NIC / school ID", href: "#", note: "No card, no entry. Photocopy your card the night before." },
  { title: "Water bottle (label removed) and a light snack", href: "#", note: "Papers are 2–3 hours. Hydration matters." },
];

function LinkRow({ r }: { r: Row }) {
  const isExternal = r.href.startsWith("http");
  return (
    <li className="border-t border-hairline py-4 first:border-t-0">
      {isExternal ? (
        <a href={r.href} target="_blank" rel="noopener" className="group flex items-baseline justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-foreground group-hover:text-amber transition-colors">{r.title}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{r.note}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground group-hover:text-amber transition-colors">↗</span>
        </a>
      ) : (
        <div>
          <p className="text-[15px] font-medium text-foreground">{r.title}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{r.note}</p>
        </div>
      )}
    </li>
  );
}

function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-amber">Resource hub</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl text-balance">
            Every O/L resource worth having, in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Official NIE syllabi, past-paper archives, marking schemes, and the exam-day
            checklist we wish someone had handed us. Everything free. Nothing gated.
          </p>
        </header>

        <section className="mt-14">
          <h2 className="font-display text-2xl text-foreground">Official syllabi</h2>
          <PremiumCard hover={false} className="mt-5 p-6 sm:p-7">
            <ul>
              {SYLLABI.map((r) => <LinkRow key={r.title} r={r} />)}
            </ul>
          </PremiumCard>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Past papers & marking schemes</h2>
          <PremiumCard hover={false} className="mt-5 p-6 sm:p-7">
            <ul>
              {PAST_PAPERS.map((r) => <LinkRow key={r.title} r={r} />)}
            </ul>
          </PremiumCard>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Exam-day checklist</h2>
          <PremiumCard hover={false} className="mt-5 p-6 sm:p-7">
            <ul>
              {EXAM_DAY.map((r) => <LinkRow key={r.title} r={r} />)}
            </ul>
          </PremiumCard>
        </section>

        <section className="mt-14 rounded-2xl border border-hairline p-6 sm:p-8">
          <h2 className="font-display text-2xl text-foreground">Practice while it's fresh</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reading the syllabus doesn't move a grade. Answering questions does.
          </p>
          <Link
            to="/practice"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:brightness-110"
          >
            Choose a mode →
          </Link>
        </section>
      </main>
    </div>
  );
}