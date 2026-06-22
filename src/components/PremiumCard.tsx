import type { ReactNode } from "react";

export function PremiumCard({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border border-hairline bg-surface",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        hover ? "transition hover:-translate-y-0.5 hover:border-hairline-strong" : "",
        className,
      ].join(" ")}
      style={{ boxShadow: "var(--shadow-cinematic)" }}
    >
      {children}
    </div>
  );
}