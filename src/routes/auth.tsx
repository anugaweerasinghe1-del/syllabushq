import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteHeader } from "@/components/SiteHeader";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" && s.redirect.startsWith("/") ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — SyllabusHQ for schools" },
      {
        name: "description",
        content:
          "Sign in to SyllabusHQ to sync your O/L progress across devices, join your class, and sit assignments set by your teacher.",
      },
      { property: "og:title", content: "Sign in — SyllabusHQ for schools" },
      {
        property: "og:description",
        content: "Student and teacher accounts for Sri Lankan O/L practice, classes and assignments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dest = redirect || "/dashboard";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: dest, replace: true });
    });
  }, [dest, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${dest}`,
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setMsg("Check your email to confirm your account, then sign in.");
        } else {
          navigate({ to: dest, replace: true });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: dest, replace: true });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setErr(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("ol-auth-dest", dest);
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setErr("Google sign-in failed. Try again.");
      return;
    }
    if (!("redirected" in result) || !result.redirected) {
      navigate({ to: dest, replace: true });
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 pb-24 pt-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">SyllabusHQ for schools</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-foreground">
          {mode === "signin" ? "Welcome back." : "Create your account."}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sync your progress across devices, join a class with a code, and sit assignments your teacher sets.
        </p>

        <div className="glass-panel mt-8 rounded-2xl p-5">
          <button
            type="button"
            onClick={google}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium text-foreground transition hover:brightness-110"
          >
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <Field label="Full name">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="input-base"
                    placeholder="Anuga Weerasinghe"
                  />
                </Field>
                <fieldset>
                  <legend className="mb-1.5 text-[12px] text-muted-foreground">I am a</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(["student", "teacher"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        aria-pressed={role === r}
                        className={[
                          "rounded-xl border px-3 py-2.5 text-sm capitalize transition",
                          role === r
                            ? "border-foreground/40 bg-surface-2 text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-base"
                placeholder="you@school.lk"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-base"
                placeholder="At least 6 characters"
              />
            </Field>

            {err && <p className="text-sm text-red-400">{err}</p>}
            {msg && <p className="text-sm text-emerald-400">{msg}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setErr(null);
              setMsg(null);
            }}
            className="mt-4 w-full text-center text-[13px] text-muted-foreground transition hover:text-foreground"
          >
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>

        <p className="mt-6 text-center text-[12px] text-muted-foreground">
          You can keep practising without an account —{" "}
          <Link to="/practice" className="text-foreground underline underline-offset-4">
            start a paper
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}