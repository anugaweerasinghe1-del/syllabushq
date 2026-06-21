import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-6 w-6 rounded-md"
            style={{ background: "var(--ink)" }}
          />
          <span className="font-display text-lg font-semibold text-ink">
            O/L Practice
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/" activeOptions={{ exact: true }} className="hover:text-ink">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}