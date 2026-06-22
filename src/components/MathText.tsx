import { Fragment, useMemo } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * Renders text that may contain LaTeX delimited by $...$ (inline) or $$...$$ (block).
 * Also normalizes legacy ASCII math written by older question banks:
 *   sqrt(x)  -> $\sqrt{x}$
 *   x^2 / x^{n+1} -> $x^{...}$
 *   *  -> \times  (only inside $...$)
 *   /  -> \div    (only inside $...$)
 * Plain text is rendered verbatim.
 */
export function MathText({ children, className }: { children: string; className?: string }) {
  const parts = useMemo(() => parse(normalize(children ?? "")), [children]);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.type === "text" ? (
          <Fragment key={i}>{p.value}</Fragment>
        ) : p.type === "inline" ? (
          <InlineMath key={i} math={p.value} />
        ) : (
          <BlockMath key={i} math={p.value} />
        ),
      )}
    </span>
  );
}

type Part = { type: "text" | "inline" | "block"; value: string };

function parse(src: string): Part[] {
  const out: Part[] = [];
  let i = 0;
  while (i < src.length) {
    if (src[i] === "$" && src[i + 1] === "$") {
      const end = src.indexOf("$$", i + 2);
      if (end === -1) { out.push({ type: "text", value: src.slice(i) }); break; }
      out.push({ type: "block", value: src.slice(i + 2, end) });
      i = end + 2;
    } else if (src[i] === "$") {
      const end = src.indexOf("$", i + 1);
      if (end === -1) { out.push({ type: "text", value: src.slice(i) }); break; }
      out.push({ type: "inline", value: src.slice(i + 1, end) });
      i = end + 1;
    } else {
      let j = i;
      while (j < src.length && src[j] !== "$") j++;
      out.push({ type: "text", value: src.slice(i, j) });
      i = j;
    }
  }
  return out;
}

/** Normalize common ASCII math to LaTeX wrapped in $...$ if not already wrapped. */
function normalize(src: string): string {
  // Already contains $...$ -> only normalize inside $...$ ranges, leave plain text alone.
  if (src.includes("$")) return normalizeInsideMath(src);

  let s = src;
  // sqrt(...)
  s = s.replace(/sqrt\(([^()]+)\)/g, "$$\\sqrt{$1}$$");
  // a^{...} or a^b (single token b)
  s = s.replace(/([A-Za-z0-9)\]])\^(\{[^{}]+\}|-?\d+|-?[A-Za-z])/g, (_m, base, exp) => {
    const e = exp.startsWith("{") ? exp.slice(1, -1) : exp;
    return `$${base}^{${e}}$`;
  });
  // a_{...} or a_b
  s = s.replace(/([A-Za-z0-9)\]])_(\{[^{}]+\}|\d+|[A-Za-z])/g, (_m, base, sub) => {
    const x = sub.startsWith("{") ? sub.slice(1, -1) : sub;
    return `$${base}_{${x}}$`;
  });
  // Simple inline fractions like 22 / 7 -> leave; but in obvious math contexts also map * -> ×, / -> ÷
  // We DON'T globally rewrite * and / because they appear in prose.
  return s;
}

function normalizeInsideMath(src: string): string {
  return src.replace(/\$([^$]+)\$/g, (m, inner) => {
    let v = inner as string;
    v = v.replace(/\bsqrt\(([^()]+)\)/g, "\\sqrt{$1}");
    v = v.replace(/\*/g, "\\times ");
    v = v.replace(/(^|[^\\])\//g, "$1\\div ");
    return `$${v}$`;
  });
}