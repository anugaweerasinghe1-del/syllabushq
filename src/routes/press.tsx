import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press & Brand — SyllabusHQ" },
      {
        name: "description",
        content:
          "Press kit, founder story, logo assets, and media contact for SyllabusHQ — the free G.C.E. O/L practice tool for Sri Lankan students.",
      },
      { property: "og:title", content: "Press & Brand — SyllabusHQ" },
      { property: "og:description", content: "Press kit, founder story, and brand assets." },
      { property: "og:url", content: `${SITE_URL}/press` },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/press` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Press & Brand",
          url: `${SITE_URL}/press`,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        }),
      },
    ],
  }),
  component: PressPage,
});

const FACTS: Array<{ k: string; v: string }> = [
  { k: "Name", v: "SyllabusHQ" },
  { k: "Category", v: "Free education / G.C.E. O/L practice" },
  { k: "Country", v: "Sri Lanka (English medium)" },
  { k: "Subjects", v: "Mathematics, Science, Business & Accounting" },
  { k: "Pricing", v: "Free — no login, no ads, no paywall" },
  { k: "Media contact", v: "press@syllabushq.app" },
];

function PressPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-amber">Press kit</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl text-balance">
            SyllabusHQ, in one page.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Everything a journalist, blogger, or partner needs to write about SyllabusHQ
            without asking us a single question first.
          </p>
        </header>

        <section className="mt-14">
          <h2 className="font-display text-2xl text-foreground">The one-paragraph story</h2>
          <PremiumCard hover={false} className="mt-4 p-6 sm:p-7">
            <p className="text-[15px] leading-relaxed text-foreground/90">
              SyllabusHQ is a free G.C.E. Ordinary Level practice tool for Sri Lankan
              students, in English medium. It replaces the usual PDF dumps and paywalled
              tuition upsells with original, syllabus-aligned questions in the exact
              format of the NIE papers — and an AI chief examiner that marks written
              answers point-by-point against a real scheme. No login, no ads, no fee. Ever.
            </p>
          </PremiumCard>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Facts</h2>
          <PremiumCard hover={false} className="mt-4 p-6 sm:p-7">
            <dl className="grid gap-4 sm:grid-cols-2">
              {FACTS.map((f) => (
                <div key={f.k}>
                  <dt className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{f.k}</dt>
                  <dd className="mt-1 text-sm text-foreground">{f.v}</dd>
                </div>
              ))}
            </dl>
          </PremiumCard>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Founder quote (for use)</h2>
          <blockquote className="mt-4 border-l-2 border-amber pl-5 text-[15px] italic text-foreground/85">
            "Every past-paper site I could find for Sri Lankan O/Ls was either a PDF dump,
            riddled with ads, or a paywalled coaching upsell. The kids who need it most —
            students in rural areas without tuition access — got nothing. SyllabusHQ is
            what I wished had existed when I was sitting these exams."
            <footer className="mt-3 text-xs uppercase tracking-[0.22em] not-italic text-muted-foreground">
              — Founder, SyllabusHQ
            </footer>
          </blockquote>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Brand assets</h2>
          <PremiumCard hover={false} className="mt-4 p-6 sm:p-7">
            <ul className="space-y-3 text-sm">
              <li className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3">
                <div>
                  <p className="text-foreground">Wordmark — light on dark</p>
                  <p className="text-[12px] text-muted-foreground">SyllabusHQ, set in Instrument Serif</p>
                </div>
                <a href="/" className="text-xs text-amber hover:underline">Preview ↗</a>
              </li>
              <li className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3">
                <div>
                  <p className="text-foreground">Primary palette</p>
                  <p className="text-[12px] text-muted-foreground">
                    bg <code className="text-foreground">#0a0a0a</code> · fg <code className="text-foreground">#f5f5f4</code> · accent <code className="text-foreground">#c9a961</code>
                  </p>
                </div>
                <span className="inline-flex gap-1">
                  <span className="h-4 w-4 rounded" style={{ background: "#0a0a0a", border: "1px solid #333" }} />
                  <span className="h-4 w-4 rounded" style={{ background: "#f5f5f4" }} />
                  <span className="h-4 w-4 rounded" style={{ background: "#c9a961" }} />
                </span>
              </li>
              <li className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-foreground">Typography</p>
                  <p className="text-[12px] text-muted-foreground">Instrument Serif (display) · Inter (body) · JetBrains Mono (numerals)</p>
                </div>
              </li>
            </ul>
          </PremiumCard>
        </section>

        <section className="mt-14 rounded-2xl border border-hairline p-6 sm:p-8">
          <h2 className="font-display text-2xl text-foreground">Get in touch</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Interviews, quotes, screenshots at custom resolutions — email us and we'll
            reply within 48 hours. Time-sensitive? Say so in the subject line.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="mailto:press@syllabushq.app"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background"
            >
              press@syllabushq.app
            </a>
            <Link
              to="/for-teachers"
              className="inline-flex items-center justify-center rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-foreground"
            >
              For teachers →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}