import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getHint } from "@/lib/getHint.functions";
import {
  commitHint,
  formatCountdown,
  getCachedHint,
  getQuota,
  hintIdFor,
  HINT_LIMIT,
} from "@/lib/hints";

type Props = {
  subject: string;
  topic: string;
  question: string;
  options?: string[];
};

/**
 * Rate-limited (4/24h) Socratic hint button.
 * Cached per-question forever so repeat views don't cost a use.
 */
export function HintButton({ subject, topic, question, options }: Props) {
  const id = hintIdFor(subject, topic, question);
  const fetchHint = useServerFn(getHint);

  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState({ remaining: HINT_LIMIT, resetMs: null as number | null });

  useEffect(() => {
    setHint(getCachedHint(id));
    setQuota(getQuota());
    setError(null);
  }, [id]);

  // Live countdown
  useEffect(() => {
    if (quota.resetMs == null) return;
    const t = setInterval(() => setQuota(getQuota()), 30_000);
    return () => clearInterval(t);
  }, [quota.resetMs]);

  async function reveal() {
    setError(null);
    const cached = getCachedHint(id);
    if (cached) {
      setHint(cached);
      return;
    }
    const q = getQuota();
    if (q.remaining <= 0) {
      setQuota(q);
      return;
    }
    setLoading(true);
    try {
      const { hint } = await fetchHint({ data: { subject, topic, question, options } });
      commitHint(id, hint);
      setHint(hint);
      setQuota(getQuota());
    } catch (e) {
      setError("Hint service is busy — try again in a moment.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const isCached = getCachedHint(id) !== null;
  const disabled = loading || (!isCached && quota.remaining <= 0);

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={reveal}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full border border-hairline px-3.5 py-1.5 text-[12px] font-medium text-foreground transition hover:border-primary/70 hover:text-orange disabled:opacity-40"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" />
          </svg>
          {loading ? "Thinking…" : hint ? "Hint shown" : "Reveal hint"}
        </button>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {quota.remaining > 0
            ? `${quota.remaining}/${HINT_LIMIT} hints left today`
            : quota.resetMs
              ? `Limit reached · resets in ${formatCountdown(quota.resetMs)}`
              : "Limit reached"}
        </span>
      </div>
      {hint && (
        <p className="mt-2 rounded-xl border border-primary/40 bg-primary/[0.06] px-4 py-3 text-sm text-foreground rise">
          {hint}
        </p>
      )}
      {error && <p className="mt-2 text-[12px] text-coral">{error}</p>}
    </div>
  );
}
