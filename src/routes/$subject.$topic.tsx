import { createFileRoute, Outlet, Link, notFound } from "@tanstack/react-router";
import { subjectsQuery, type Subject, type Topic } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/$subject/$topic")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = subjects.find((s: Subject) => s.slug === params.subject);
    if (!subject) throw notFound();
    const topic = subject.topics.find((t: Topic) => t.slug === params.topic);
    if (!topic) throw notFound();
    return { subject, topic } as { subject: Subject; topic: Topic };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink">Topic not found</h1>
        <Link to="/" className="mt-4 inline-block text-marigold hover:underline">
          Back to home
        </Link>
      </main>
    </div>
  ),
  component: () => <Outlet />,
});
