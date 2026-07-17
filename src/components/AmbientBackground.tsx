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
      {/* Editorial vignette: warm top-light on cream paper. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(181,138,43,0.08) 0%, transparent 60%), radial-gradient(ellipse 100% 90% at 50% 50%, transparent 40%, rgba(30,25,15,0.06) 100%)",
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}