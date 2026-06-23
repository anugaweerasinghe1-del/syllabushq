import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PremiumCard } from "./PremiumCard";

interface ResumePayload {
  href: string;
  label: string;
  progress: string; // e.g. "Q14/40"
}

/**
 * Reads an in-progress exam session from localStorage and surfaces a
 * subtle "Continue where you left off" card. Zeigarnik effect: open loops
 * pull attention.
 */
export function ZeigarnikResume() {
  const [resume, setResume] = useState<ResumePayload | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shq:resume");
      if (!raw) return;
      const parsed = JSON.parse(raw) as ResumePayload & { ts?: number };
      // Stale after 7 days.
      if (parsed.ts && Date.now() - parsed.ts > 7 * 24 * 3600 * 1000) {
        localStorage.removeItem("shq:resume");
        return;
      }
      setResume(parsed);
    } catch {}
  }, []);

  if (!resume) return null;

  return (
    <Link to={resume.href as never} className="block">
      <PremiumCard className="flex items-center justify-between gap-4 p-4 animate-pulse-glow">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Unfinished paper
          </p>
          <p className="mt-1 font-display text-lg text-foreground">{resume.label}</p>
        </div>
        <div className="text-right">
          <p className="font-num text-xs text-muted-foreground">{resume.progress}</p>
          <p className="mt-0.5 text-xs text-foreground">Resume →</p>
        </div>
      </PremiumCard>
    </Link>
  );
}

export function setResume(payload: ResumePayload) {
  try {
    localStorage.setItem("shq:resume", JSON.stringify({ ...payload, ts: Date.now() }));
  } catch {}
}

export function clearResume() {
  try {
    localStorage.removeItem("shq:resume");
  } catch {}
}