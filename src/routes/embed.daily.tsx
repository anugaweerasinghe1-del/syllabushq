import { createFileRoute } from "@tanstack/react-router";
import { DailyQuestion } from "@/components/DailyQuestion";
import { SITE_URL, SITE_NAME } from "@/lib/site";

/**
 * Embeddable daily-question widget. No SiteHeader, no chrome — designed to
 * live inside an <iframe> on a school site, LMS or Google Site. Every embed
 * is a followed backlink from the parent page.
 */
export const Route = createFileRoute("/embed/daily")({
  head: () => ({
    meta: [
      { title: `Daily O/L Question — ${SITE_NAME}` },
      { name: "robots", content: "noindex,follow" },
      { name: "description", content: "Embeddable daily O/L question widget from SyllabusHQ." },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/embed/daily` }],
  }),
  component: EmbedDaily,
});

function EmbedDaily() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4">
      <div className="mx-auto max-w-2xl">
        <DailyQuestion />
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Powered by{" "}
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener"
            className="text-amber hover:underline"
          >
            SyllabusHQ
          </a>{" "}
          — free O/L practice for Sri Lankan students.
        </p>
      </div>
    </div>
  );
}