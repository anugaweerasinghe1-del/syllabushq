import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";

const TIPS = [
  "Read every command word — State, Explain, Calculate, Justify.",
  "Budget your time by the mark allocation: 1 mark ≈ 1 minute.",
  "Show every working step. Examiners reward method marks.",
  "If you're stuck, move on — return to it before submitting.",
  "Underline keywords in the question before you start writing.",
  "Use the correct units. Half marks evaporate without them.",
];

export function LoadingScreen({ durationMs = 1400 }: { durationMs?: number }) {
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / durationMs) * 100);
      setProgress(p);
      if (p >= 100) clearInterval(id);
    }, 40);
    const tipId = setInterval(() => setTip(TIPS[Math.floor(Math.random() * TIPS.length)]), 1100);
    return () => { clearInterval(id); clearInterval(tipId); };
  }, [durationMs]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-8 text-center">
        <BrandMark compact />
        <div className="relative h-20 w-20">
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--hairline)" strokeWidth="2" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="var(--accent-1)" strokeWidth="2" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 80ms linear", filter: "drop-shadow(0 0 8px rgba(232,236,243,0.4))" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-num text-sm text-foreground">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="max-w-xs">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Preparing your paper</p>
          <p className="mt-3 text-sm text-foreground/85">{tip}</p>
        </div>
      </div>
    </div>
  );
}