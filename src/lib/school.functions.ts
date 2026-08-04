import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Role = "teacher" | "student";

function code() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, school, grade").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const role: Role = (roles ?? []).some((r) => r.role === "teacher") ? "teacher" : "student";
    return {
      userId,
      role,
      profile: profile ?? { id: userId, full_name: "", school: null, grade: null },
    };
  });

const profileSchema = z.object({
  full_name: z.string().trim().min(1).max(80),
  school: z.string().trim().max(120).optional().nullable(),
  grade: z.string().trim().max(40).optional().nullable(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => profileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: data.full_name, school: data.school ?? null, grade: data.grade ?? null })
      .eq("id", userId);
    if (error) return { ok: false, error: "Couldn't save your profile." };
    return { ok: true, error: null as string | null };
  });

/** Teacher: own classes with roster + assignment counts. */
export const teacherOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: classes } = await supabase
      .from("classes")
      .select("id, name, subject, join_code, created_at")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: false });
    const ids = (classes ?? []).map((c) => c.id);
    if (!ids.length) return { classes: [] as Array<{ id: string; name: string; subject: string | null; join_code: string; students: number; assignments: number }> };
    const [{ data: members }, { data: assignments }] = await Promise.all([
      supabase.from("class_members").select("class_id").in("class_id", ids),
      supabase.from("assignments").select("class_id").in("class_id", ids),
    ]);
    return {
      classes: (classes ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        join_code: c.join_code,
        students: (members ?? []).filter((m) => m.class_id === c.id).length,
        assignments: (assignments ?? []).filter((a) => a.class_id === c.id).length,
      })),
    };
  });

export const createClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ name: z.string().trim().min(2).max(80), subject: z.string().trim().max(60).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isTeacher } = await supabase.rpc("has_role", { _user_id: userId, _role: "teacher" });
    if (!isTeacher) return { ok: false, error: "Only teacher accounts can create classes.", id: null };
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: row, error } = await supabase
        .from("classes")
        .insert({ teacher_id: userId, name: data.name, subject: data.subject || null, join_code: code() })
        .select("id")
        .single();
      if (!error && row) return { ok: true, error: null as string | null, id: row.id };
      if ((error as { code?: string } | null)?.code !== "23505") break;
    }
    return { ok: false, error: "Couldn't create that class.", id: null };
  });

export const joinClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ joinCode: z.string().trim().min(4).max(12) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cls } = await supabaseAdmin
      .from("classes")
      .select("id, name")
      .eq("join_code", data.joinCode.toUpperCase())
      .maybeSingle();
    if (!cls) return { ok: false, error: "No class with that code." };
    const { error } = await supabase.from("class_members").insert({ class_id: cls.id, student_id: userId });
    if (error && (error as { code?: string }).code !== "23505") {
      return { ok: false, error: "Couldn't join that class." };
    }
    return { ok: true, error: null as string | null };
  });

/** Student: joined classes, assignments and own submissions. */
export const studentOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: memberships } = await supabase.from("class_members").select("class_id").eq("student_id", userId);
    const ids = (memberships ?? []).map((m) => m.class_id);
    if (!ids.length) return { classes: [], assignments: [], submissions: [] };
    const [{ data: classes }, { data: assignments }, { data: submissions }] = await Promise.all([
      supabase.from("classes").select("id, name, subject").in("id", ids),
      supabase
        .from("assignments")
        .select("id, class_id, title, subject, topics, mode, question_count, timer_minutes, due_at")
        .in("class_id", ids)
        .order("created_at", { ascending: false }),
      supabase
        .from("assignment_submissions")
        .select("assignment_id, marks_awarded, total_marks, submitted_at")
        .eq("student_id", userId),
    ]);
    return { classes: classes ?? [], assignments: assignments ?? [], submissions: submissions ?? [] };
  });

/** Teacher: one class — roster, assignments, marks. */
export const classDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ classId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cls } = await supabase
      .from("classes")
      .select("id, name, subject, join_code, teacher_id")
      .eq("id", data.classId)
      .maybeSingle();
    if (!cls || cls.teacher_id !== userId) return null;
    const [{ data: members }, { data: assignments }] = await Promise.all([
      supabase.from("class_members").select("student_id, joined_at").eq("class_id", cls.id),
      supabase
        .from("assignments")
        .select("id, title, subject, topics, mode, question_count, timer_minutes, due_at, created_at")
        .eq("class_id", cls.id)
        .order("created_at", { ascending: false }),
    ]);
    const studentIds = (members ?? []).map((m) => m.student_id);
    const assignmentIds = (assignments ?? []).map((a) => a.id);
    const [{ data: profiles }, { data: submissions }] = await Promise.all([
      studentIds.length
        ? supabase.from("profiles").select("id, full_name, school, grade").in("id", studentIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string; school: string | null; grade: string | null }[] }),
      assignmentIds.length
        ? supabase
            .from("assignment_submissions")
            .select("assignment_id, student_id, marks_awarded, total_marks, submitted_at")
            .in("assignment_id", assignmentIds)
        : Promise.resolve({ data: [] as { assignment_id: string; student_id: string; marks_awarded: number; total_marks: number; submitted_at: string }[] }),
    ]);
    return {
      cls: { id: cls.id, name: cls.name, subject: cls.subject, join_code: cls.join_code },
      roster: (members ?? []).map((m) => ({
        id: m.student_id,
        name: (profiles ?? []).find((p) => p.id === m.student_id)?.full_name || "Student",
        school: (profiles ?? []).find((p) => p.id === m.student_id)?.school ?? null,
        joined_at: m.joined_at,
      })),
      assignments: assignments ?? [],
      submissions: submissions ?? [],
    };
  });

export const createAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        classId: z.string().uuid(),
        title: z.string().trim().min(2).max(120),
        subject: z.string().trim().min(1).max(60),
        topics: z.array(z.string()).max(40).default([]),
        mode: z.enum(["mcq", "short", "structured", "full"]),
        questionCount: z.number().int().min(1).max(60),
        timerMinutes: z.number().int().min(0).max(240).nullable().optional(),
        dueAt: z.string().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("assignments").insert({
      class_id: data.classId,
      created_by: userId,
      title: data.title,
      subject: data.subject,
      topics: data.topics,
      mode: data.mode,
      question_count: data.questionCount,
      timer_minutes: data.timerMinutes || null,
      due_at: data.dueAt || null,
    });
    if (error) return { ok: false, error: "Couldn't set that assignment." };
    return { ok: true, error: null as string | null };
  });

export const deleteAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("assignments").delete().eq("id", data.id);
    return { ok: !error, error: error ? "Couldn't remove that assignment." : null };
  });

export const submitAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        assignmentId: z.string().uuid(),
        marksAwarded: z.number().min(0),
        totalMarks: z.number().min(0),
        detail: z.record(z.string(), z.unknown()).default({}),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("assignment_submissions").upsert(
      {
        assignment_id: data.assignmentId,
        student_id: userId,
        marks_awarded: data.marksAwarded,
        total_marks: data.totalMarks,
        detail: data.detail as never,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "assignment_id,student_id" },
    );
    if (error) return { ok: false, error: "Couldn't record that result." };
    return { ok: true, error: null as string | null };
  });