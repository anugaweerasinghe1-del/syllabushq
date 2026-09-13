/**
 * AmbientBackground — a very soft light wash behind the paper background.
 * Purely decorative, pointer-events: none. One instance at the root layout.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
      style={{ contain: "strict" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-accent/50" />
      <div className="absolute inset-x-0 top-px h-72 bg-accent/5 blur-3xl" />
    </div>
  );
}