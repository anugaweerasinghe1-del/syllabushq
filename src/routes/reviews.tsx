import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { listReviews, submitReview, deleteReview } from "@/lib/reviews.functions";
import { getVisitorToken } from "@/lib/visitor";

const SITE = "https://app.syllabushq.workers.dev";

type Review = { id: string; name: string; rating: number; comment: string; created_at: string };

export const Route = createFileRoute("/reviews")({
  loader: () => listReviews(),
  head: () => ({
    meta: [
      { title: "Reviews — what students say about SyllabusHQ" },
      { name: "description", content: "Read what Sri Lankan O/L students say about SyllabusHQ practice. Leave your own review — one per browser." },
      { property: "og:title", content: "Reviews — SyllabusHQ" },
      { property: "og:url", content: SITE + "/reviews" },
    ],
    links: [{ rel: "canonical", href: SITE + "/reviews" }],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const initial = Route.useLoaderData();
  const router = useRouter();
  const submit = useServerFn(submitReview);
  const del = useServerFn(deleteReview);

  const [items, setItems] = useState<Review[]>(initial.items as Review[]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [already, setAlready] = useState(false);

  useEffect(() => {
    const token = getVisitorToken();
    setAlready(items.some(() => false) || !!localStorage.getItem("ol-review-submitted-" + token));
  }, [items]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const visitorToken = getVisitorToken();
      const res = await submit({ data: { name: name.trim(), rating, comment: comment.trim(), visitorToken } });
      if (res.ok) {
        localStorage.setItem("ol-review-submitted-" + visitorToken, "1");
        setMsg({ ok: true, text: "Thanks for the review!" });
        setName(""); setComment(""); setRating(5); setAlready(true);
        const fresh = await listReviews();
        setItems(fresh.items as Review[]);
      } else {
        setMsg({ ok: false, text: res.error ?? "Could not submit." });
        if (res.error?.includes("already")) setAlready(true);
      }
    } finally { setBusy(false); }
  }

  async function onDelete(id: string) {
    const pw = window.prompt("Admin password to delete this review:");
    if (!pw) return;
    const res = await del({ data: { id, password: pw } });
    if (res.ok) {
      setItems(items.filter((r) => r.id !== id));
    } else {
      alert(res.error ?? "Delete failed.");
    }
    router.invalidate();
  }

  const avg = items.length ? items.reduce((a, r) => a + r.rating, 0) / items.length : 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10 rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">Community</p>
          <h1 className="mt-2 font-display text-5xl text-foreground sm:text-6xl">Reviews</h1>
          <p className="mt-3 text-muted-foreground">
            {items.length > 0
              ? <>Averaging <span className="font-num text-foreground">{avg.toFixed(1)}</span> / 5 across <span className="font-num text-foreground">{items.length}</span> reviews.</>
              : "Be the first to leave a review."}
          </p>
        </header>

        <section className="glass-panel rounded-2xl p-5 sm:p-7">
          <h2 className="font-display text-2xl text-foreground">Leave a review</h2>
          {already ? (
            <p className="mt-3 text-sm text-muted-foreground">You've already left a review from this browser. Thanks for the feedback!</p>
          ) : (
            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  required minLength={1} maxLength={60} value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (or initials)"
                  className="rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-amber"
                />
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} className="text-2xl leading-none transition" aria-label={`${n} stars`}>
                      <span style={{ color: n <= rating ? "var(--amber)" : "var(--hairline)" }}>★</span>
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required minLength={4} maxLength={800} value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="What worked, what didn't, what should we add?"
                rows={4}
                className="w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-amber"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">One review per browser.</span>
                <button type="submit" disabled={busy} className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--bg)] transition hover:brightness-110 disabled:opacity-50">
                  {busy ? "Sending…" : "Post review"}
                </button>
              </div>
              {msg && (
                <p className="text-sm" style={{ color: msg.ok ? "var(--mint)" : "var(--coral)" }}>{msg.text}</p>
              )}
            </form>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl text-foreground">What students say</h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((r) => (
                <li key={r.id} className="rounded-xl border border-hairline bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{r.name}</span>
                        <span className="text-amber text-sm">{"★".repeat(r.rating)}<span className="text-hairline">{"★".repeat(5-r.rating)}</span></span>
                      </div>
                      <p className="mt-2 text-sm text-charcoal whitespace-pre-wrap">{r.comment}</p>
                      <p className="mt-2 text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => onDelete(r.id)} className="shrink-0 rounded-md border border-hairline px-2 py-1 text-[11px] text-muted-foreground transition hover:border-coral hover:text-coral" title="Delete with admin password">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
