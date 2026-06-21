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

export const listSuggestions = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("suggestions")
    .select("id, name, idea, created_at")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) return { items: [], error: "Couldn't load suggestions." };
  return { items: data ?? [], error: null as string | null };
});

const submitSchema = z.object({
  name: z.string().trim().min(1).max(60),
  idea: z.string().trim().min(4).max(800),
  visitorToken: z.string().min(8).max(120),
});

export const submitSuggestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => submitSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("suggestions").insert({
      name: data.name,
      idea: data.idea,
      visitor_token: data.visitorToken,
    });
    if (error) return { ok: false, error: "Could not save your suggestion." };
    return { ok: true, error: null as string | null };
  });
