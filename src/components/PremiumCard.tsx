import { useRef, type ReactNode, type MouseEvent } from "react";

/**
 * Obsidian study card with a quiet border, depth, and cursor-tracking focus cue.
 */
export function PremiumCard({
  children,
  className = "",
  hover = true,
  variant = "glass",
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "glass" | "deep" | "solid";
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  const base =
    variant === "deep"
      ? "glass-deep"
      : variant === "solid"
        ? "bg-surface border border-hairline"
        : "glass-panel";

  return (
    <div
      ref={ref}
      onMouseMove={hover ? onMove : undefined}
      className={[
        "relative overflow-hidden rounded-xl",
        base,
        hover
          ? "spotlight transition duration-300 will-change-transform hover:-translate-y-0.5 hover:border-hairline-strong hover:shadow-lg"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
