/**
 * AmbientBackground — a very soft light wash behind the paper background.
 * Purely decorative, pointer-events: none. One instance at the root layout.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ contain: "strict" }}
    >
      <div
        className="absolute -top-48 left-1/2 h-[60vh] w-[85vw] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(30,122,60,0.10), transparent 68%)" }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[50vh] w-[50vw] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(59,114,232,0.09), transparent 68%)" }}
      />
      <div
        className="absolute -bottom-40 -left-32 h-[45vh] w-[50vw] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(232,177,10,0.10), transparent 68%)" }}
      />
    </div>
  );
}