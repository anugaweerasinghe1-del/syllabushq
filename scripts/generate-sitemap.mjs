import { writeFileSync, readFileSync, mkdirSync } from "node:fs";

const SITE = process.env.SITE_URL || "https://ol-practice.lovable.app";
const subjects = JSON.parse(readFileSync("src/data/subjects.json", "utf8"));

const urls = ["/"];
for (const s of subjects) {
  urls.push(`/${s.slug}`);
  for (const t of s.topics) urls.push(`/${s.slug}/${t.slug}`);
}

const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`,
  )
  .join("\n")}
</urlset>
`;

mkdirSync("public", { recursive: true });
writeFileSync("public/sitemap.xml", xml);
console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`);
