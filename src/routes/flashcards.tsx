import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { MathText } from "@/components/MathText";
import { subjectsQuery, questionsQuery, type Question } from "@/lib/content";
import { cardKey, loadCardStates, loadMistakes, rateCard } from "@/lib/mistakes";

export const Route = createFileRoute("/flashcards")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(subjectsQuery);
    await context.queryClient.ensureQueryData(questionsQuery);
  },
  head: () => ({
    meta: [
      { title: "O/L revision flashcards — Maths, Science, Business | SyllabusHQ" },
      {
        name: "description",
        content:
          "Free Sri Lankan O/L flashcards with spaced repetition: cards you forget come back sooner, cards you know wait longer.",
      },
      { property: "og:title", content: "O/L revision flashcards — SyllabusHQ" },
      { property: "og:description", content: "Spaced-repetition flashcards for every O/L topic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FlashcardsPage,
});

const DECK_SIZE = 20;

function FlashcardsPage() {
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const [subject, setSubject] = useState(subjects[0]?.slug ?? "mathematics");
  const [topic, setTopic] = useState("mistakes-first");
  const [deck, setDeck] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knewCount, setKnewCount] = useState(0);

  const topics = subjects.find((s) => s.slug === subject)?.topics ?? [];

  function buildDeck() {
    const states = loadCardStates();
    const now = Date.now();
    const mistakes = loadMistakes().filter((m) => m.subject === subject);
    let pool = questions.filter(
      (q) => q.subject === subject && (topic === "mistakes-first" || q.topic === topic),
    );
    if (topic !== "mistakes-first") {
      // keep topic filter for mistakes too
    }
    const mistakeKeys = new Set(
      mistakes.filter((m) => topic === "mistakes-first" || m.topic === topic).map(cardKey),
    );
    const score = (q: Question) => {
      const st = states[cardKey(q)];
      if (mistakeKeys.has(cardKey(q))) return 0;
      if (st && st.due <= now) return 1 + st.box * 0.1;
      if (!st) return 2 + Math.random();
      return 10 + st.box;
    };
    pool = [...pool].sort((a, b) => score(a) - score(b));
    setDeck(pool.slice(0, DECK_SIZE));
    setI(0);
    setFlipped(false);
    setKnewCount(0);
  }

  const card = deck?.[i];

  function rate(knew: boolean) {
    if (!card) return;
    rateCard(card, knew);
    if (knew) setKnewCount((n) => n + 1);
    setFlipped(false);
    setI((n) => n + 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!card) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === "ArrowRight") rate(true);
      else if (flipped && e.key === "ArrowLeft") rate(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const progress = useMemo(() => (deck ? Math.round((i / deck.length) * 100) : 0), [deck, i]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link to="/study" className="text-sm text-muted-foreground hover:text-foreground">
          ← Study tools
        </Link>
        <h1 className="mt-3 font-display text-4xl text-foreground">Revision flashcards</h1>

        {!deck ? (
          <div className="glass-panel mt-6 rounded-2xl p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Subject
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setTopic("mistakes-first");
                  }}
                  className="mt-2 block w-full rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm normal-case tracking-normal text-foreground"
                >
                  {subjects.map((s) => (
                    <option key={s.slug} value={s.slug} className="bg-background">
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Topic
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm normal-case tracking-normal text-foreground"
                >
                  <option value="mistakes-first" className="bg-background">
                    All topics (my mistakes first)
                  </option>
                  {topics.map((t) => (
                    <option key={t.slug} value={t.slug} className="bg-background">
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={buildDeck}
              className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Start {DECK_SIZE} cards →
            </button>
          </div>
        ) : card ? (
          <div className="mt-6">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Card {i + 1} of {deck.length} · Space to flip
            </p>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="glass-panel mt-4 block min-h-[260px] w-full rounded-2xl p-6 text-left transition hover:brightness-110"
            >
              {!flipped ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-orange">Question</p>
                  <p className="mt-3 text-lg text-foreground">
                    <MathText>{card.question}</MathText>
                  </p>
                  <p className="mt-6 text-sm text-muted-foreground">Think of the answer, then tap to flip.</p>
                </>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--sage)]">Answer</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    <MathText>{card.options[card.correct]}</MathText>
                  </p>
                  <p className="mt-4 text-sm text-foreground/85">
                    <MathText>{card.explanation}</MathText>
                  </p>
                </>
              )}
            </button>
            {flipped && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => rate(false)}
                  className="rounded-lg border border-[color:var(--clay)] px-4 py-3 text-sm font-semibold text-foreground"
                >
                  ← Didn't know
                </button>
                <button
                  type="button"
                  onClick={() => rate(true)}
                  className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Knew it →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel mt-6 rounded-2xl p-8 text-center">
            <p className="text-2xl text-foreground">
              {deck.length === 0 ? "No cards for this topic yet." : `You knew ${knewCount} of ${deck.length}.`}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Cards you missed will come back first next time.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={buildDeck}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Next deck
              </button>
              <button
                type="button"
                onClick={() => setDeck(null)}
                className="rounded-lg border border-hairline px-5 py-2.5 text-sm text-foreground"
              >
                Change topic
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
