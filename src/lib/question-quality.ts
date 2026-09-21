const FOREIGN_BOARD_PATTERNS = [
  /\b(?:cambridge|edexcel|pearson|aqa|ocr)\b/i,
  /\b(?:i?gcse|key stage|common core|sat|act|cbse|icse)\b/i,
  /\bgce\s+a[ -]?level\b/i,
  /\byear\s*(?:10|11)\b/i,
];

const FOREIGN_CONTEXT_PATTERNS = [
  /£|\$\s?\d|€\s?\d/,
  /\b(?:pence|pound sterling|pounds sterling)\b/i,
  /\b\d+(?:\.\d+)?\s*(?:miles?|inches?|ounces?)\b/i,
  /\b(?:zip code|social security number)\b/i,
];

const GENERATION_NOTE_PATTERNS = [
  /\blet me\b/i,
  /\blet's (?:adjust|assume|change|fix|modify|re-?evaluate|re-?frame|recalculate|try)\b/i,
  /\boptions? (?:are|is|were) (?:definitely )?(?:incorrect|inconsistent|off|wrong)\b/i,
  /\boptions? (?:do|does) not match\b/i,
  /\bnot matching the options\b/i,
  /\bquestion is flawed\b/i,
  /\bmy (?:calculation|option generation|options|question)\b/i,
  /\bwork backwards\b/i,
  /\bi (?:will|need to|cannot) (?:adjust|change|correct|create|fix|modify|recreate)\b/i,
];

export function isSriLankanOLContent(parts: Array<string | undefined>): boolean {
  const text = parts.filter(Boolean).join("\n");
  return ![...FOREIGN_BOARD_PATTERNS, ...FOREIGN_CONTEXT_PATTERNS, ...GENERATION_NOTE_PATTERNS].some(
    (pattern) => pattern.test(text),
  );
}
