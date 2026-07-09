import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/for-teachers")({
  head: () => ({
    meta: [
      { title: "For Teachers — free O/L classroom resources | SyllabusHQ" },
      {
        name: "description",
        content:
          "Free O/L classroom resources for Sri Lankan teachers: printable question packs, an embeddable daily-question widget, and syllabus-aligned practice — no login required.",
      },
      { property: "og:title", content: "For Teachers — SyllabusHQ" },
      { property: "og:description", content: "Free O/L classroom resources and an embeddable daily-question widget." },
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

const EMBED_SNIPPET = `<iframe
  src="${SITE_URL}/embed/daily"
  width="100%"
  height="520"
  frameborder="0"
  loading="lazy"
  title="Daily O/L question — SyllabusHQ"
  style="max-width:640px;border:0;border-radius:16px;"
></iframe>`;

function TeachersPage() {
  const [copied, setCopied] = useState(false);

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(EMBED_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <header className="rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-amber">For teachers</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl text-balance">
            Free classroom resources — with no strings.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            SyllabusHQ is built for Sri Lankan O/L students, but we want to make it
            just as useful for the teachers who shape them. Everything below is free,
            requires no login, and can be shared freely with your class.
          </p>
        </header>

        {/* Embed */}
        <section className="mt-14">
          <h2 className="font-display text-2xl text-foreground">Embed the Daily Question</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            One fresh, syllabus-aligned question per day — the same for every student in Sri Lanka.
            Drop this into your school site, LMS, or a Google Site with one line of HTML.
          </p>

          <PremiumCard hover={false} className="mt-5 p-5 sm:p-6">
            <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface p-4 text-[12px] leading-relaxed text-foreground/85">
              <code>{EMBED_SNIPPET}</code>
            </pre>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Renders identically on desktop and mobile. Zero tracking.</p>
              <button
                onClick={copyEmbed}
                className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background transition hover:brightness-110"
              >
                {copied ? "Copied ✓" : "Copy embed code"}
              </button>
            </div>
          </PremiumCard>

          <div className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Live preview</p>
            <div className="rounded-2xl border border-hairline overflow-hidden">
              <iframe
                src="/embed/daily"
                title="Daily question preview"
                className="block w-full"
                style={{ height: 520, border: 0 }}
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Printables */}
        <section className="mt-14">
          <h2 className="font-display text-2xl text-foreground">Printable question packs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Want a PDF pack for a specific topic (2-mark section + 10-mark structured questions,
            plus marking scheme)? Email the subject and topic — we'll build and send within 48 hours.
          </p>
          <a
            href="mailto:hello@syllabushq.app?subject=Printable%20question%20pack%20request"
            className="mt-5 inline-flex items-center justify-center rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-foreground transition hover:border-amber hover:text-amber"
          >
            Request a printable pack →
          </a>
        </section>

        {/* Attribution */}
        <section className="mt-14 rounded-2xl border border-hairline p-6 sm:p-8">
          <h2 className="font-display text-2xl text-foreground">Using SyllabusHQ in your school?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We'd love to hear from you — and if your school lists free student resources on
            its website, a link from your resource page helps other Sri Lankan students find us.
            No attribution required, but always appreciated.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/resources"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background"
            >
              Browse the resource hub →
            </Link>
            <Link
              to="/press"
              className="inline-flex items-center justify-center rounded-lg border border-hairline-strong px-6 py-3 text-sm font-medium text-foreground"
            >
              Brand assets & press kit
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}