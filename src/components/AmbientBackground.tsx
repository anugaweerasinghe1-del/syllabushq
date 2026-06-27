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
      {/* Mesh grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%)",
        }}
      />

      {/* Aurora orbs */}
      <div
        className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full blur-[120px] animate-float-orb"
        style={{ background: "radial-gradient(circle, rgba(91,141,239,0.35), transparent 70%)" }}
      />
      <div
        className="absolute top-[18%] -right-40 h-[600px] w-[600px] rounded-full blur-[140px] animate-aurora"
        style={{
          background: "radial-gradient(circle, rgba(167,139,250,0.30), transparent 70%)",
          animationDelay: "-6s",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full blur-[140px] animate-float-orb"
        style={{
          background: "radial-gradient(circle, rgba(52,211,153,0.18), transparent 70%)",
          animationDelay: "-12s",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 30%, transparent 40%, rgba(5,6,10,0.6) 100%)",
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}