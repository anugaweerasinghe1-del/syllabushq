import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const logPracticeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        subject: z.string().trim().min(1).max(64),
        topic: z.string().trim().max(64).nullable().optional(),
        mode: z.string().trim().min(1).max(32),
        marksAwarded: z.number().min(0),
        totalMarks: z.number().min(0),
        detail: z.record(z.string(), z.unknown()).default({}),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("practice_sessions").insert({
      user_id: context.userId,
      subject: data.subject,
      topic: data.topic ?? null,
      mode: data.mode,
      marks_awarded: data.marksAwarded,
      total_marks: data.totalMarks,
      detail: data.detail as never,
    });
    return { ok: !error };
  });

export type ProgressSession = {
  id: string;
  subject: string;
  topic: string | null;
  mode: string;
  marks: number;
  total: number;
  at: string;
};

export const progressOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("practice_sessions")
      .select("id, subject, topic, mode, marks_awarded, total_marks, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(400);

    const sessions: ProgressSession[] = (data ?? []).map((r) => ({
      id: r.id,
      subject: r.subject,
      topic: r.topic,
      mode: r.mode,
      marks: Number(r.marks_awarded),
      total: Number(r.total_marks),
      at: r.created_at,
    }));

    const totalMarks = sessions.reduce((a, s) => a + s.total, 0);
    const gotMarks = sessions.reduce((a, s) => a + s.marks, 0);

    const bySubject = new Map<string, { marks: number; total: number; sessions: number }>();
    const byTopic = new Map<string, { subject: string; topic: string; marks: number; total: number }>();
    for (const s of sessions) {
      const sub = bySubject.get(s.subject) ?? { marks: 0, total: 0, sessions: 0 };
      sub.marks += s.marks;
      sub.total += s.total;
      sub.sessions += 1;
      bySubject.set(s.subject, sub);
      if (s.topic && s.topic !== "mix") {
        const key = `${s.subject}|${s.topic}`;
        const t = byTopic.get(key) ?? { subject: s.subject, topic: s.topic, marks: 0, total: 0 };
        t.marks += s.marks;
        t.total += s.total;
        byTopic.set(key, t);
      }
    }

    const weakest = [...byTopic.values()]
      .filter((t) => t.total >= 3)
      .map((t) => ({ ...t, accuracy: t.total ? t.marks / t.total : 0 }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Study days derived from session timestamps — the account-side streak.
    const days = [...new Set(sessions.map((s) => s.at.slice(0, 10)))].sort();

    return {
      sessions: sessions.slice(0, 40),
      totals: {
        papers: sessions.length,
        marks: gotMarks,
        outOf: totalMarks,
        accuracy: totalMarks ? Math.round((gotMarks / totalMarks) * 100) : 0,
      },
      subjects: [...bySubject.entries()].map(([subject, v]) => ({
        subject,
        sessions: v.sessions,
        accuracy: v.total ? Math.round((v.marks / v.total) * 100) : 0,
        answered: v.total,
      })),
      weakest,
      days,
      lastSession: sessions[0] ?? null,
    };
  });