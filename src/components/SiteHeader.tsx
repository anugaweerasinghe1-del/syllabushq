import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/BrandMark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-[color:var(--bg)]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <BrandMark />
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          <NavLink to="/practice">Practice</NavLink>
          <NavLink to="/reviews">Reviews</NavLink>
          <NavLink to="/suggest">Suggest</NavLink>
        </nav>
        <Link
          to="/practice"
          className="rounded-lg border border-hairline-strong bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-3"
        >
          Begin →
        </Link>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "text-foreground bg-secondary" }}
      className="rounded-md px-3 py-1.5 transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </Link>
  );
}
