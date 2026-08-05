/**
 * Converts the LaTeX-ish markup used across the question banks into readable
 * plain text for PDF / Word export, where KaTeX can't render.
 * Mirrors the normalisation MathText applies on screen.
 */
const SYMBOLS: Array<[RegExp, string]> = [
  [/\\times/g, "×"],
  [/\\div/g, "÷"],
  [/\\cdot/g, "·"],
  [/\\pm/g, "±"],
  [/\\leq/g, "≤"],
  [/\\geq/g, "≥"],
  [/\\neq/g, "≠"],
  [/\\approx/g, "≈"],
  [/\\infty/g, "∞"],
  [/\\pi/g, "π"],
  [/\\theta/g, "θ"],
  [/\\alpha/g, "α"],
  [/\\beta/g, "β"],
  [/\\degree|\\circ/g, "°"],
  [/\\rightarrow|\\to/g, "→"],
  [/\\left|\\right/g, ""],
  [/\\%/g, "%"],
  [/\\,|\\;|\\!|\\ /g, " "],
];

const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", n: "ⁿ", x: "ˣ",
};
const SUB: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  a: "ₐ", n: "ₙ", x: "ₓ",
};

function script(raw: string, map: Record<string, string>, fallback: string): string {
  const chars = [...raw];
  if (chars.every((c) => map[c])) return chars.map((c) => map[c]).join("");
  return `${fallback}(${raw})`;
}

function convert(src: string): string {
  let s = src;
  // \frac{a}{b} -> (a)/(b), run twice for simple nesting
  for (let i = 0; i < 2; i++) {
    s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a, b) => `(${a})/(${b})`);
  }
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, (_m, a) => `√(${a})`);
  s = s.replace(/\\sqrt\(([^()]*)\)/g, (_m, a) => `√(${a})`);
  s = s.replace(/\\(log|ln|sin|cos|tan|max|min)\b/g, "$1");
  for (const [re, to] of SYMBOLS) s = s.replace(re, to);
  // superscripts / subscripts
  s = s.replace(/\^\{([^{}]*)\}/g, (_m, e) => script(e, SUP, "^"));
  s = s.replace(/\^(-?[A-Za-z0-9])/g, (_m, e) => script(e, SUP, "^"));
  s = s.replace(/_\{([^{}]*)\}/g, (_m, e) => script(e, SUB, "_"));
  s = s.replace(/_(-?[A-Za-z0-9])/g, (_m, e) => script(e, SUB, "_"));
  s = s.replace(/[{}]/g, "");
  return s;
}

/** Strip $…$ delimiters and render the whole string as readable plain text. */
export function mathToPlain(src: string): string {
  if (!src) return "";
  const withoutDelims = src.replace(/\$\$([\s\S]*?)\$\$/g, "$1").replace(/\$([^$]*)\$/g, "$1");
  return convert(withoutDelims).replace(/[ \t]{2,}/g, " ").trim();
}