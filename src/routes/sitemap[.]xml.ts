import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import subjectsData from "@/data/subjects.json";
import { SEO_PAGES } from "@/data/seo-matrix";
import { MODES } from "@/lib/modes";

const BASE_URL = "https://app.syllabushq.workers.dev";

interface SitemapEntry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const subjects = subjectsData as Array<{ slug: string; topics: Array<{ slug: string }> }>;

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/practice", changefreq: "weekly", priority: "0.9" },
          { path: "/resources", changefreq: "monthly", priority: "0.8" },
          { path: "/for-teachers", changefreq: "monthly", priority: "0.7" },
          { path: "/press", changefreq: "monthly", priority: "0.5" },
          { path: "/reviews", changefreq: "weekly", priority: "0.4" },
          { path: "/suggest", changefreq: "monthly", priority: "0.3" },
        ];

        for (const m of MODES) {
          entries.push({ path: `/practice/${m.slug}`, changefreq: "weekly", priority: "0.8" });
          for (const s of subjects) {
            entries.push({ path: `/practice/${m.slug}/${s.slug}`, changefreq: "weekly", priority: "0.7" });
          }
        }

        for (const p of SEO_PAGES) {
          entries.push({
            path: `/learn/${p.subject}/${p.topic}/${p.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});