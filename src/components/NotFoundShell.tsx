import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";
import type { Subject, Topic } from "@/lib/content";

type Props = {
  title?: string;
  message?: string;
  subject?: Subject | null;
  suggestions?: Topic[];
};

/**
 * Branded 404 that keeps the user inside the funnel.
 * Glassmorphism shell + suggested next steps instead of a dead end.
 */
export function NotFoundShell({
  title = "We couldn't find that topic.",
  message = "The link may be out of date, or the syllabus has moved on. Try one of the topics below — they're live and ready.",
  subject = null,
  suggestions,
}: Props) {
  const list = suggestions ?? subject?.topics.slice(0, 6) ?? [];
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <PremiumCard className="p-8 sm:p-12 rise" hover={false}>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            404 · Off the syllabus
          </p>
          <h1 className="mt-4 font-display text-3xl leading-[1.05] text-foreground sm:text-5xl text-balance">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">{message}</p>

          {list.length > 0 && subject && (
            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Try one of these {subject.name} topics
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {list.map((t) => (
                  <li key={t.slug}>
                    <Link
                      to="/$subject/$topic"
                      params={{ subject: subject.slug, topic: t.slug }}
                      className="block rounded-xl border border-hairline px-4 py-3 text-sm text-foreground transition hover:border-hairline-strong hover:bg-surface-2"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/practice"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
            >
              Browse practice modes →
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-hairline-strong px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2"
            >
              Back home
            </Link>
          </div>
        </PremiumCard>
      </main>
    </div>
  );
}