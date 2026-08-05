import { supabase } from "@/integrations/supabase/client";
import { logPracticeSession } from "@/lib/progress.functions";

/**
 * Fire-and-forget: saves a finished practice run to the signed-in student's
 * account. Silently does nothing for anonymous visitors — practice never
 * depends on being signed in.
 */
export async function logSession(input: {
  subject: string;
  topic?: string | null;
  mode: string;
  marksAwarded: number;
  totalMarks: number;
  detail?: Record<string, unknown>;
}) {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await logPracticeSession({
      data: {
        subject: input.subject,
        topic: input.topic ?? null,
        mode: input.mode,
        marksAwarded: input.marksAwarded,
        totalMarks: input.totalMarks,
        detail: input.detail ?? {},
      },
    });
  } catch (err) {
    console.warn("[logSession] skipped:", err);
  }
}