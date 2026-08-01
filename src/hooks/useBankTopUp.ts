import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ensureQuestions } from "@/lib/bank.functions";
import type { BankItem, BankMode } from "@/lib/bank-types";

/**
 * Tops a locally-filled paper up from the shared self-growing bank.
 * Silent on failure — the caller keeps whatever the local JSON bank gave it.
 */
export function useBankTopUp(opts: {
  mode: BankMode;
  subject: string;
  topics: string[];
  difficulty?: string;
  need: number; // how many MORE questions are required
  avoid?: string[];
  enabled?: boolean;
}) {
  const call = useServerFn(ensureQuestions);
  const [extra, setExtra] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { mode, subject, need, difficulty = "all", enabled = true } = opts;
  const topicKey = opts.topics.join(",");
  const avoidKey = (opts.avoid ?? []).length;

  useEffect(() => {
    let cancelled = false;
    if (!enabled || need <= 0) {
      setExtra([]);
      return;
    }
    setLoading(true);
    call({
      data: {
        mode,
        subject,
        topics: topicKey ? topicKey.split(",") : [],
        difficulty,
        need: Math.min(30, need),
        avoid: (opts.avoid ?? []).slice(0, 20),
      },
    })
      .then((res) => {
        if (!cancelled) setExtra((res?.items ?? []) as BankItem[]);
      })
      .catch(() => {
        if (!cancelled) setExtra([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, subject, topicKey, difficulty, need, enabled, avoidKey]);

  return { extra, loading };
}