import { Link } from "@tanstack/react-router";

export function BrandMark({ to = "/", compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5">
      <span
        aria-hidden
        className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-hairline-strong bg-primary/10"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          style={{ color: "var(--primary)" }}
        >
          <path d="M5 7 L12 3 L19 7 L19 17 L12 21 L5 17 Z" opacity="0.45" />
          <path d="M9 10 L15 10 M9 14 L15 14" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="font-display text-[18px] tracking-tight text-foreground">
            Syllabus<span className="text-muted-foreground italic">HQ</span>
          </span>
          <span className="text-[9.5px] uppercase tracking-[0.24em] text-muted-foreground/80">
            Exam Intelligence
          </span>
        </span>
      )}
    </Link>
  );
}
