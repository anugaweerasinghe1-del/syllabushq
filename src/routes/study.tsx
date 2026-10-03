import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PremiumCard } from "@/components/PremiumCard";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study tools — flashcards, mistakes notebook & O/L countdown | SyllabusHQ" },
      {
        name: "description",
        content:
          "Free O/L revision tools: smart flashcards that repeat what you forget, a notebook of every question you got wrong, and an exam countdown with a daily study plan.",
      },
      { property: "og:title", content: "Study tools — SyllabusHQ" },
      {
        property: "og:description",
        content: "Flashcards, a mistakes notebook and an O/L exam countdown — free for every student.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudyHub,
});

const TOOLS = [
  {
    to: "/flashcards" as const,
    tag: "Remember more",
    title: "Revision flashcards",
    body: "Flip through any topic. Cards you miss come back sooner; cards you know wait longer.",
  },
  {
    to: "/mistakes" as const,
    tag: "Fix weak spots",
    title: "Mistakes notebook",
    body: "Every question you got wrong in practice, saved in one place. Redo them until they stick.",
  },
  {
    to: "/countdown" as const,
    tag: "Plan ahead",
    title: "Exam countdown",
    body: "Days left until your O/L exam and exactly which topics to revise today.",
  },
];

function StudyHub() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-orange">Study tools</p>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl text-balance">
          Revise smarter, not longer.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Three free tools built around how memory actually works. Everything is saved on your device —
          no sign-in needed.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="group">
              <PremiumCard className="h-full p-6">
                <p className="text-[10px] uppercase tracking-[0.22em] text-orange">{t.tag}</p>
                <h2 className="mt-2 text-xl text-foreground">{t.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
                <p className="mt-4 text-sm font-semibold text-primary">Open →</p>
              </PremiumCard>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
