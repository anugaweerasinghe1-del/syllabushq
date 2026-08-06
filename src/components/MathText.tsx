import { useMemo } from "react";
import { mathToPlain } from "@/lib/mathPlain";

/**
 * Renders question text with real Unicode maths symbols (√ × ÷ ² ½ π …).
 * Accepts legacy LaTeX ($...$, \sqrt{}, \frac{}{}) and legacy ASCII
 * (sqrt(x), x^2, log_2) and converts both to plain readable Unicode.
 * No KaTeX, no web fonts, no layout shift.
 */
export function MathText({ children, className }: { children: string; className?: string }) {
  const text = useMemo(() => render(children ?? ""), [children]);
  return <span className={className}>{text}</span>;
}

const ASCII_FRACTIONS: Array<[RegExp, string]> = [
  [/\b1\/2\b/g, "½"],
  [/\b1\/3\b/g, "⅓"],
  [/\b2\/3\b/g, "⅔"],
  [/\b1\/4\b/g, "¼"],
  [/\b3\/4\b/g, "¾"],
  [/\b1\/8\b/g, "⅛"],
];

export function render(src: string): string {
  if (!src) return "";
  let s = src;
  // Legacy ASCII helpers the old banks used.
  s = s.replace(/\bsqrt\s*\(([^()]*)\)/gi, "√($1)");
  s = s.replace(/\bsqrt\s*(\d+)/gi, "√$1");
  s = s.replace(/\bpi\b/g, "π");
  s = s.replace(/\bdegrees?\b/g, "°");
  s = s.replace(/<=/g, "≤").replace(/>=/g, "≥").replace(/!=/g, "≠");
  s = s.replace(/\+\/-/g, "±");
  // LaTeX + ^ / _ handling lives in mathToPlain (shared with exports).
  s = mathToPlain(s);
  // Tidy redundant brackets: √(9) -> √9 for single tokens.
  s = s.replace(/√\(([A-Za-z0-9.]+)\)/g, "√$1");
  for (const [re, to] of ASCII_FRACTIONS) s = s.replace(re, to);
  return s;
}