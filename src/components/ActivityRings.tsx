import { cn } from "@/lib/utils";

export interface RingData {
  label: string;
  value: number; // 0-1
  color: string;
}

/** Apple-style concentric activity rings, pure SVG. */
export function ActivityRings({
  rings,
  size = 168,
  className,
}: {
  rings: RingData[];
  size?: number;
  className?: string;
}) {
  const stroke = 12;
  const gap = 4;
  return (
    <div className={cn("flex items-center gap-5", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {rings.map((r, i) => {
          const radius = size / 2 - stroke / 2 - i * (stroke + gap);
          const c = 2 * Math.PI * radius;
          const dash = c * Math.min(Math.max(r.value, 0), 1);
          return (
            <g key={r.label}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={r.color}
                strokeWidth={stroke}
                strokeOpacity={0.12}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={r.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c}`}
                style={{ transition: "stroke-dasharray 800ms cubic-bezier(0.22,1,0.36,1)" }}
              />
            </g>
          );
        })}
      </svg>
      <div className="space-y-1.5">
        {rings.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-num text-foreground">{Math.round(r.value * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}