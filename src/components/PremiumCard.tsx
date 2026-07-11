import { useRef, type ReactNode, type MouseEvent } from "react";

/**
 * Glass card with hairline top highlight, ambient shadow, and a
 * cursor-tracking spotlight on hover. Pure CSS — no JS animation loop.
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
        "relative overflow-hidden rounded-2xl",
        base,
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px",
        "before:bg-gradient-to-r before:from-transparent before:via-black/10 before:to-transparent",
        hover
          ? "spotlight transition duration-500 will-change-transform hover:-translate-y-1 hover:shadow-lg"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}