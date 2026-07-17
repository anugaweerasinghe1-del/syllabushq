/**
 * AmbientBackground — full-viewport fixed canvas of slowly drifting
 * aurora orbs + a grain overlay + a soft mesh grid. Purely decorative,
 * pointer-events: none. One instance lives at the root layout.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ contain: "strict" }}
    >
      {/* Aurora orbs — slow indigo/cyan/jade drift on obsidian. */}
      <div
        className="absolute -top-40 left-1/2 h-[70vh] w-[80vw] -translate-x-1/2 rounded-full blur-[120px] animate-float-orb"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.30), transparent 65%)" }}
      />
      <div
        className="absolute top-1/3 -right-32 h-[55vh] w-[55vw] rounded-full blur-[120px] animate-aurora"
        style={{ background: "radial-gradient(circle, rgba(103,232,249,0.20), transparent 65%)", animationDelay: "-6s" }}
      />
      <div
        className="absolute -bottom-32 -left-24 h-[50vh] w-[55vw] rounded-full blur-[120px] animate-float-orb"
        style={{ background: "radial-gradient(circle, rgba(74,222,128,0.16), transparent 65%)", animationDelay: "-12s" }}
      />

      {/* Grain overlay for texture on the deep base. */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}