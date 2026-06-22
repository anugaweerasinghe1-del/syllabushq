import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { MODES } from "@/lib/modes";
import { PremiumCard } from "@/components/PremiumCard";

const SITE = "https://syllabushq.lovable.app";

export const Route = createFileRoute("/practice/")({
  head: () => ({
    meta: [
      { title: "Choose your exam mode — SyllabusHQ" },
      { name: "description", content: "MCQs, structured papers, short-answer drills, or a full timed exam simulation. Pick a mode and begin." },
      { property: "og:title", content: "SyllabusHQ — Choose your exam mode" },
      { property: "og:url", content: SITE + "/practice" },
    ],
    links: [{ rel: "canonical", href: SITE + "/practice" }],
  }),
  component: PracticeIndex,
});

function PracticeIndex() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 rise">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Step 1 of 3</p>
          <h1 className="mt-3 font-display text-[40px] leading-[1.05] text-foreground sm:text-[56px] text-balance">
            Choose your <span className="italic text-muted-foreground">mode</span>.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Each mode is its own dedicated experience — no tabs, no clutter. Pick what you want to train today.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {MODES.map((m, i) => (
            <Link
              key={m.slug}
              to="/practice/$mode"
              params={{ mode: m.slug }}
              className={i < 3 ? `rise-${i + 1}` : "rise-3"}
            >
              <PremiumCard className="p-6 sm:p-7 h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{m.tagline}</p>
                    <h3 className="mt-2 font-display text-3xl text-foreground">{m.name}</h3>
                  </div>
                  <span className="font-num text-[10px] text-muted-foreground">0{i + 1}</span>
                </div>
                <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
                  {m.bullets.map((b) => (
                    <li key={b} className="flex gap-2"><span className="text-foreground/40">·</span>{b}</li>
                  ))}
                </ul>
                <div className="mt-6 inline-flex items-center gap-2 text-sm text-foreground">
                  Continue <span className="text-muted-foreground">→</span>
                </div>
              </PremiumCard>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}