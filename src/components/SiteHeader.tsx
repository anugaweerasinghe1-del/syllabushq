import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";

/**
 * Floating glass pill header. Scroll-aware shrinks slightly and
 * deepens its blur. Pure CSS transitions, no scroll-jank.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5">
      <header
        className={[
          "mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3",
          "transition-all duration-500",
          scrolled
            ? "glass-deep shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"
            : "glass-panel",
        ].join(" ")}
      >
        <BrandMark />
        <nav className="hidden items-center gap-0.5 text-[13px] text-muted-foreground sm:flex">
          <NavLink to="/practice">Practice</NavLink>
          <NavLink to="/reviews">Reviews</NavLink>
          <NavLink to="/suggest">Suggest</NavLink>
        </nav>
        <Link
          to="/practice"
          className="group relative inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3.5 py-2 text-[12px] font-semibold text-background transition hover:brightness-110"
        >
          <span className="absolute inset-0 -z-10 rounded-xl bg-foreground blur-md opacity-25 transition group-hover:opacity-50" />
          Begin
          <span className="transition group-hover:translate-x-0.5">→</span>
        </Link>
      </header>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "text-foreground bg-white/5" }}
      className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/5 hover:text-foreground"
    >
      {children}
    </Link>
  );
}
