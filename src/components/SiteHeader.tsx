import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { useSession } from "@/hooks/useSession";

/**
 * Stable, compact navigation for the dark learning dashboard.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { signedIn, ready } = useSession();
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // Hysteresis: avoids rapid class flip-flop right at the threshold.
        setScrolled((prev) => (prev ? window.scrollY > 4 : window.scrollY > 24));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <header
        className={[
          "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3",
          "transition-[background-color,box-shadow,border-color] duration-300 ease-out",
          scrolled ? "glass-deep" : "glass-panel",
        ].join(" ")}
      >
        <BrandMark />
        <nav className="hidden items-center gap-0.5 text-[13px] text-muted-foreground sm:flex">
          <NavLink to="/practice">Practice</NavLink>
          <NavLink to="/past-papers">Past papers</NavLink>
          <NavLink to="/resources">Resources</NavLink>
          <NavLink to="/for-teachers">Teachers</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/reviews">Reviews</NavLink>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Always rendered so resolving the session never reflows the header. */}
          <Link
            to={signedIn ? "/dashboard" : "/auth"}
            aria-hidden={!ready}
            tabIndex={ready ? undefined : -1}
            className={[
              "min-w-[68px] rounded-lg px-3 py-1.5 text-center text-[12px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
              ready ? "opacity-100" : "pointer-events-none opacity-0",
            ].join(" ")}
          >
            {signedIn ? "Dashboard" : "Sign in"}
          </Link>
          <Link
            to="/practice"
            className="group relative inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Begin
            <span className="transition group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </header>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "text-foreground bg-surface-2" }}
      className="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-foreground"
    >
      {children}
    </Link>
  );
}
