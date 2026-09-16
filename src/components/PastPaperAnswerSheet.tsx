import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function PastPaperAnswerSheet({ paperSlug, count }: { paperSlug: string; count: number }) {
  const storageKey = `past-paper-answers-${paperSlug}`;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setAnswers(JSON.parse(stored) as Record<number, number>);
    } catch {
      // A private browser session may block storage.
    }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {
      // Answers still remain available for this page visit.
    }
  }, [answers, ready, storageKey]);

  const answered = Object.keys(answers).length;
  return (
    <section aria-labelledby="answer-sheet-title" className="glass-panel rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Paper I</p>
          <h2 id="answer-sheet-title" className="mt-1 font-display text-xl text-foreground">MCQ answer sheet</h2>
        </div>
        <span className="font-num text-xs text-muted-foreground">{answered}/{count}</span>
      </div>
      <div className="mt-4 grid gap-2">
        {Array.from({ length: count }, (_, i) => i + 1).map((number) => (
          <div key={number} className="grid grid-cols-[2rem_repeat(4,1fr)] items-center gap-1.5">
            <span className="font-num text-xs text-muted-foreground">{number}</span>
            {[1, 2, 3, 4].map((option) => (
              <Button
                key={option}
                type="button"
                variant={answers[number] === option ? "default" : "outline"}
                size="sm"
                aria-label={`Question ${number}, option ${option}`}
                aria-pressed={answers[number] === option}
                onClick={() => setAnswers((current) => ({ ...current, [number]: option }))}
                className="h-8 min-w-0 px-0 font-num"
              >
                {option}
              </Button>
            ))}
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" className="mt-4 w-full" onClick={() => setAnswers({})}>
        Clear answer sheet
      </Button>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Answers save on this device. No unofficial answer key is applied.
      </p>
    </section>
  );
}