import { createFileRoute, Outlet, notFound, redirect } from "@tanstack/react-router";
import { subjectsQuery, resolveSubject, type Subject } from "@/lib/content";
import { NotFoundShell } from "@/components/NotFoundShell";

export const Route = createFileRoute("/$subject")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = resolveSubject(subjects, params.subject);
    if (!subject) throw notFound();
    if (subject.slug !== params.subject) {
      throw redirect({ to: "/$subject", params: { subject: subject.slug } });
    }
    return { subject } as { subject: Subject };
  },
  notFoundComponent: () => (
    <NotFoundShell title="Subject not found" message="That subject slug isn't on the syllabus. Pick one below." />
  ),
  errorComponent: ({ error }) => (
    <NotFoundShell title="Couldn't load that subject" message={error.message} />
  ),
  component: () => <Outlet />,
});
