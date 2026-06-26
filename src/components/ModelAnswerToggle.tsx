import { useState } from "react";
import { MathText } from "@/components/MathText";

type Props = {
  answer: string;
  /** Optional working/explanation rendered below the headline answer. */
  explanation?: string;
  label?: string;
};

/**
 * Premium collapsible reveal for the model answer.
 * Hidden by default; smooth height + opacity transition on open.
 */
export function ModelAnswerToggle({ answer, explanation, label = "Model answer" }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 rounded-xl border border-hairline bg-surface/40 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-surface-2"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: open ? "var(--mint)" : "var(--amber)" }}
          />
          {open ? `Hide ${label.toLowerCase()}` : `Toggle ${label.toLowerCase()}`}
        </span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {open ? "−" : "+"}
        </span>
      </button>
      <div
        className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="min-h-0">
          <div className="border-t border-hairline px-4 py-4 text-sm leading-relaxed text-foreground">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <div className="mt-2 text-foreground"><MathText>{answer}</MathText></div>
            {explanation && (
              <div className="mt-3 text-[13px] text-muted-foreground"><MathText>{explanation}</MathText></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}