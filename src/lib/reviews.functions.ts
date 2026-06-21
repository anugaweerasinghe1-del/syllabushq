import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

function publicClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listReviews = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("reviews")
    .select("id, name, rating, comment, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { items: [], error: "Couldn't load reviews." };
  return { items: data ?? [], error: null as string | null };
});

const submitSchema = z.object({
  name: z.string().trim().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(4).max(800),
  visitorToken: z.string().min(8).max(120),
});

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => submitSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("reviews").insert({
      name: data.name,
      rating: data.rating,
      comment: data.comment,
      visitor_token: data.visitorToken,
    });
    if (error) {
      const dup = (error as { code?: string }).code === "23505";
      return { ok: false, error: dup ? "You've already left a review from this browser. Thanks!" : "Could not save your review." };
    }
    return { ok: true, error: null as string | null };
  });

const deleteSchema = z.object({
  id: z.string().uuid(),
  password: z.string().min(1).max(200),
});

export const deleteReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => deleteSchema.parse(d))
  .handler(async ({ data }) => {
    const { checkAdminPassword } = await import("@/lib/admin.server");
    if (!checkAdminPassword(data.password)) {
      return { ok: false, error: "Incorrect password." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", data.id);
    if (error) return { ok: false, error: "Delete failed." };
    return { ok: true, error: null as string | null };
  });
