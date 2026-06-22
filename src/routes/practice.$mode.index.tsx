import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { subjectsQuery } from "@/lib/content";
import { PremiumCard } from "@/components/PremiumCard";
import { Route as ParentRoute } from "./practice.$mode";

export const Route = createFileRoute("/practice/$mode/")({
  component: SubjectPicker,
});

function SubjectPicker() {
  const { mode } = ParentRoute.useLoaderData();
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const meta = ["Numeric reasoning", "Conceptual recall", "Applied reasoning"];
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 rise">
          <Link to="/practice" className="text-xs text-muted-foreground hover:text-foreground">← Mode</Link>
          <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Step 2 of 3 · {mode.name}</p>
          <h1 className="mt-2 font-display text-[40px] leading-[1.05] text-foreground sm:text-[56px] text-balance">
            Pick a <span className="italic text-muted-foreground">subject</span>.
          </h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s, i) => (
            <Link key={s.slug} to="/practice/$mode/$subject" params={{ mode: mode.slug, subject: s.slug }}>
              <PremiumCard className="p-6 h-full">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{meta[i % 3]}</p>
                <h3 className="mt-2 font-display text-2xl text-foreground">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.topics.length} topics</p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm text-foreground">Continue <span className="text-muted-foreground">→</span></div>
              </PremiumCard>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}