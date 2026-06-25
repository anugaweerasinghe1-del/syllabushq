import type { GradeResult } from "@/lib/gradeAnswer.functions";
import { MathText } from "@/components/MathText";
import { Check, X, Lightbulb, BookOpen } from "lucide-react";

export function AIGradeCard({ result }: { result: GradeResult }) {
  const pct = result.totalMarks > 0 ? Math.round((result.marksAwarded / result.totalMarks) * 100) : 0;
  const tone =
    result.verdict === "correct"
      ? "border-mint/40 bg-mint/[0.06]"
      : result.verdict === "partial"
        ? "border-amber/40 bg-amber/[0.05]"
        : "border-coral/40 bg-coral/[0.05]";
  return (
    <div className={`mt-5 overflow-hidden rounded-2xl border ${tone}`}>
      <div className="flex items-center justify-between border-b border-hairline/60 px-5 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            AI Examiner verdict
          </p>
          <p className="mt-0.5 font-display text-2xl text-foreground capitalize">
            {result.verdict}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl tabular-nums text-foreground">
            {result.marksAwarded}
            <span className="text-muted-foreground">/{result.totalMarks}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">{pct}%</p>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <section>
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Marks breakdown
          </p>
          <ul className="space-y-1.5">
            {result.breakdown.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                {b.awarded ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-coral/80" />
                )}
                <span className="text-foreground/90">
                  <MathText>{b.point}</MathText>
                  {b.evidence && (
                    <span className="ml-2 text-[11px] italic text-muted-foreground">
                      — {b.evidence}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {result.misconceptions.length > 0 && (
          <section>
            <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Misconceptions
            </p>
            <ul className="space-y-1 text-sm text-coral/90">
              {result.misconceptions.map((m, i) => (
                <li key={i}>· <MathText>{m}</MathText></li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border border-hairline bg-white/[0.02] p-4">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <BookOpen className="h-3 w-3" /> Model answer
          </p>
          <p className="mt-2 text-sm text-foreground/90">
            <MathText>{result.modelAnswer}</MathText>
          </p>
        </section>

        <section className="flex items-start gap-2 text-sm text-amber/90">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{result.nextStepHint}</span>
        </section>
      </div>
    </div>
  );
}