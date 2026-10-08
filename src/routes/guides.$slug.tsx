import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import { getGuide, CATEGORY_LABEL, GUIDE_UPDATED } from "@/data/guides";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData)
      return { meta: [{ title: "Guide not found | SyllabusHQ" }, { name: "robots", content: "noindex" }] };
    const g = loaderData;
    const url = `${SITE_URL}/guides/${params.slug}`;
    return {
      meta: [
        { title: g.metaTitle },
        { name: "description", content: g.description },
        { property: "og:title", content: g.metaTitle },
        { property: "og:description", content: g.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.title,
            description: g.description,
            dateModified: GUIDE_UPDATED,
            author: { "@type": "Person", name: "Anuga Weerasinghe" },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            mainEntityOfPage: url,
            inLanguage: "en-LK",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
              { "@type": "ListItem", position: 3, name: g.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl">Guide not found</h1>
        <Link to="/guides" className="mt-6 inline-block underline">
          All guides
        </Link>
      </main>
    </div>
  ),
  component: GuidePage,
});

function GuidePage() {
  const g = Route.useLoaderData();
  const related = g.related.map((s) => getGuide(s)).filter((x) => !!x);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          <Link to="/guides" className="hover:text-foreground">Guides</Link> · {CATEGORY_LABEL[g.category]} ·{" "}
          {g.readMinutes} min read
        </p>
        <h1 className="mt-4 font-display text-3xl leading-tight text-foreground sm:text-5xl text-balance">
          {g.title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-foreground/85 sm:text-lg">{g.intro}</p>

        {g.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="font-display text-2xl text-foreground">{s.h}</h2>
            {s.p?.map((t, i) => (
              <p key={i} className="mt-3 leading-relaxed text-foreground/85">{t}</p>
            ))}
            {s.table && (
              <div className="mt-4 overflow-x-auto rounded-xl border border-hairline">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-2 text-foreground">
                    <tr>{s.table[0].map((c) => <th key={c} className="px-4 py-2 font-semibold">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {s.table.slice(1).map((r, i) => (
                      <tr key={i} className="border-t border-hairline text-foreground/85">
                        {r.map((c, j) => <td key={j} className="px-4 py-2 align-top">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {s.ul && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-foreground/85">
                {s.ul.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
            {s.ol && (
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-foreground/85">
                {s.ol.map((t) => <li key={t}>{t}</li>)}
              </ol>
            )}
          </section>
        ))}

        <section className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Common questions</h2>
          <div className="mt-4 space-y-3">
            {g.faqs.map((f) => (
              <details key={f.q} className="rounded-xl border border-hairline p-4">
                <summary className="cursor-pointer font-medium text-foreground">{f.q}</summary>
                <p className="mt-2 text-sm text-foreground/85">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-2xl border border-hairline p-6">
          <p className="text-sm text-muted-foreground">Ready to practise?</p>
          <a
            href={g.cta.href}
            className="mt-3 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            {g.cta.label} →
          </a>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl text-foreground">Keep reading</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((r) => (
                <a key={r.slug} href={`/guides/${r.slug}`}>
                  <PremiumCard className="h-full p-4">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                  </PremiumCard>
                </a>
              ))}
            </div>
          </section>
        )}
        <p className="mt-10 text-xs text-muted-foreground">
          Last reviewed {GUIDE_UPDATED}. Facts are taken from official Department of Examinations and
          NIE sources. Not affiliated with either.
        </p>
      </main>
    </div>
  );
}
