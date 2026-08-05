import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import subjectsData from "@/data/subjects.json";
import questionsData from "@/data/questions.json";
import shortData from "@/data/short-answer.json";
import structuredData from "@/data/structured.json";

type SubjectJSON = { slug: string; name: string; topics: { slug: string; name: string }[] };

const SUBJECTS = subjectsData as SubjectJSON[];
const MCQ_COUNT = (questionsData as unknown[]).length;
const SHORT_COUNT = (shortData as unknown[]).length;
const STRUCTURED_COUNT = (structuredData as unknown[]).length;
const TOPIC_COUNT = SUBJECTS.reduce((a, s) => a + s.topics.length, 0);

const CONTACT_EMAIL = "anugaweerasinghe1@gmail.com";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SyllabusHQ — free O/L exam practice by Anuga Weerasinghe" },
      {
        name: "description",
        content:
          "SyllabusHQ is a free Sri Lankan G.C.E. O/L practice platform built by Anuga Weerasinghe — thousands of syllabus-accurate questions, structured papers and AI marking, with no paywall.",
      },
      { property: "og:title", content: "About SyllabusHQ" },
      {
        property: "og:description",
        content:
          "Who builds SyllabusHQ, why it's free, and what's inside the question bank for Sri Lankan O/L students.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: `${SITE_URL}/about`,
          name: "About SyllabusHQ",
          mainEntity: {
            "@type": "Person",
            name: "Anuga Weerasinghe",
            jobTitle: "Founder, SyllabusHQ",
            description:
              "Sri Lankan student and independent developer building free exam-preparation tools for O/L students.",
            email: `mailto:${CONTACT_EMAIL}`,
            url: `${SITE_URL}/about`,
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            founder: { "@type": "Person", name: "Anuga Weerasinghe" },
            email: CONTACT_EMAIL,
            areaServed: "LK",
          },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-10 sm:px-6">
        <header className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">About</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Exam practice that every Sri Lankan student can afford.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            SyllabusHQ is a free G.C.E. Ordinary Level practice platform for Sri Lankan students,
            English medium. Multiple choice, short answer, structured papers and full exam
            simulations — all written strictly against the local NIE syllabus, all free, with no
            login required to practise.
          </p>
        </header>

        <section className="mt-12 grid gap-3 sm:grid-cols-4">
          <StatBox n={MCQ_COUNT.toLocaleString("en-GB")} l="MCQs in the bank" />
          <StatBox n={String(TOPIC_COUNT)} l="Syllabus topics" />
          <StatBox n={String(SUBJECTS.length)} l="Subjects" />
          <StatBox
            n={(SHORT_COUNT + STRUCTURED_COUNT).toLocaleString("en-GB")}
            l="Written questions"
          />
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">The founder</h2>
          <PremiumCard className="mt-5 p-7 sm:p-9" hover={false}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Anuga Weerasinghe
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Anuga Weerasinghe is a Sri Lankan student and independent developer. He builds and
              ships products on his own — from content platforms to education tools — and has grown
              an audience of over <strong className="text-foreground">2,000,000 views</strong> and{" "}
              <strong className="text-foreground">10,000+ followers</strong> across social
              platforms.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              SyllabusHQ started from a simple frustration: good O/L preparation in Sri Lanka
              usually means paid tuition, paid papers, or both. Everything here is free, works on a
              cheap phone, and follows the actual local syllabus rather than an imported one.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <Fact k="Role" v="Founder & sole developer" />
              <Fact k="Reach" v="2M+ views · 10k+ followers" />
              <Fact k="Based in" v="Sri Lanka" />
            </dl>
          </PremiumCard>
        </section>

        <section className="mt-14 grid gap-5 sm:grid-cols-2">
          <PremiumCard className="p-7" hover={false}>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">The mission</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Give every O/L student — in Colombo or in a village school — the same quality of
              practice, marking and feedback that expensive tuition classes sell. No paywall, no
              ads, no login wall.
            </p>
          </PremiumCard>
          <PremiumCard className="p-7" hover={false}>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">Get in touch</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Feedback, syllabus corrections, school partnerships or press.
            </p>
            <p className="mt-4 text-[14px]">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-foreground underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="mt-2 text-[14px]">
              <a
                href="https://wa.me/94714897346"
                className="text-foreground underline underline-offset-4"
                rel="noreferrer"
                target="_blank"
              >
                WhatsApp +94 71 489 7346
              </a>
            </p>
            <p className="mt-5 text-[13px] text-muted-foreground">
              Teachers:{" "}
              <Link to="/for-teachers" className="text-foreground underline underline-offset-4">
                printable question packs
              </Link>{" "}
              are free too.
            </p>
          </PremiumCard>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">What's inside</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {SUBJECTS.map((s) => (
              <li key={s.slug} className="rounded-2xl border border-hairline bg-surface p-5">
                <p className="text-[15px] font-semibold text-foreground">{s.name}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {s.topics.length} syllabus topics
                </p>
                <Link
                  to="/$subject"
                  params={{ subject: s.slug }}
                  className="mt-3 inline-block text-[13px] text-foreground underline underline-offset-4"
                >
                  Practise {s.name} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function StatBox({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <p className="font-display text-3xl text-foreground">{n}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{l}</p>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{k}</dt>
      <dd className="mt-1 text-[14px] text-foreground">{v}</dd>
    </div>
  );
}