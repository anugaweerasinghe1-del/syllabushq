import { useExamTimer } from "@/hooks/useExamTimer";

/**
 * Premium dark-mode exam timer pill. Hides itself when durationSec <= 0.
 */
export function ExamTimer({
  storageKey,
  durationSec,
  onExpire,
  className = "",
}: {
  storageKey: string;
  durationSec: number;
  onExpire?: () => void;
  className?: string;
}) {
  const { mm, ss, isLow, isCritical } = useExamTimer({ storageKey, durationSec, onExpire });
  if (!durationSec) return null;
  const tone = isCritical
    ? "border-coral/60 text-coral animate-pulse"
    : isLow
      ? "border-amber/60 text-amber"
      : "border-hairline text-foreground";
  return (
    <div
      className={`font-mono inline-flex items-center gap-2 rounded-full border bg-white/[0.03] backdrop-blur-xl px-3.5 py-1.5 text-[13px] tabular-nums ${tone} ${className}`}
      aria-live="polite"
      aria-label={`Time remaining ${mm} minutes ${ss} seconds`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {mm}:{ss}
    </div>
  );
}