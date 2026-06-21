import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-[color:var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span
            aria-hidden
            className="relative inline-flex h-7 w-7 items-center justify-center rounded-md"
            style={{
              background:
                "linear-gradient(135deg, var(--amber) 0%, #b8761a 100%)",
              boxShadow: "0 0 24px rgba(245,165,36,0.35)",
            }}
          >
            <span className="font-display text-base leading-none text-[color:var(--bg)]">
              S
            </span>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg text-foreground">
              Syllabus<span className="text-amber">HQ</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              O/L · Sri Lanka
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          <NavLink to="/">Practice</NavLink>
          <NavLink to="/structured">Papers</NavLink>
          <NavLink to="/reviews">Reviews</NavLink>
          <NavLink to="/suggest">Suggest</NavLink>
        </nav>
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
