import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { listSuggestions, submitSuggestion } from "@/lib/suggestions.functions";
import { getVisitorToken } from "@/lib/visitor";

const SITE = "https://app.syllabushq.workers.dev";

type Suggestion = { id: string; name: string; idea: string; created_at: string };

export const Route = createFileRoute("/suggest")({
  loader: () => listSuggestions(),
  head: () => ({
    meta: [
      { title: "Suggest a feature — SyllabusHQ" },
      { name: "description", content: "Help shape SyllabusHQ. Suggest features, subjects, or topics you want next." },
      { property: "og:url", content: SITE + "/suggest" },
    ],
    links: [{ rel: "canonical", href: SITE + "/suggest" }],
  }),
  component: SuggestPage,
});

function SuggestPage() {
  const initial = Route.useLoaderData();
  const submit = useServerFn(submitSuggestion);
  const [items, setItems] = useState<Suggestion[]>(initial.items as Suggestion[]);
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await submit({ data: { name: name.trim(), idea: idea.trim(), visitorToken: getVisitorToken() } });
      if (res.ok) {
        setMsg({ ok: true, text: "Got it. Thanks for the idea!" });
        const fresh = await listSuggestions();
        setItems(fresh.items as Suggestion[]);
        setName(""); setIdea("");
      } else {
        setMsg({ ok: false, text: res.error ?? "Could not submit." });
      }
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10 rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">Roadmap</p>
          <h1 className="mt-2 font-display text-5xl text-foreground sm:text-6xl">Suggest a feature</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Missing a subject? Want past-paper timers, English/Sinhala/Tamil medium, study groups? Tell us — we read every suggestion.
          </p>
        </header>

        <section className="glass-panel rounded-2xl p-5 sm:p-7">
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              required minLength={1} maxLength={60} value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-amber"
            />
            <textarea
              required minLength={4} maxLength={800} value={idea} onChange={(e) => setIdea(e.target.value)}
              placeholder="What feature, subject, or improvement would you like?"
              rows={5}
              className="w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-amber"
            />
            <div className="flex items-center justify-end">
              <button type="submit" disabled={busy} className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--bg)] transition hover:brightness-110 disabled:opacity-50">
                {busy ? "Sending…" : "Send suggestion"}
              </button>
            </div>
            {msg && <p className="text-sm" style={{ color: msg.ok ? "var(--mint)" : "var(--coral)" }}>{msg.text}</p>}
          </form>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl text-foreground">Recent ideas</h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suggestions yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((s) => (
                <li key={s.id} className="rounded-xl border border-hairline bg-surface p-4">
                  <p className="text-sm text-foreground"><span className="text-amber">{s.name}</span> · <span className="text-muted-foreground text-[11px]">{new Date(s.created_at).toLocaleDateString()}</span></p>
                  <p className="mt-1.5 text-sm text-charcoal whitespace-pre-wrap">{s.idea}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
