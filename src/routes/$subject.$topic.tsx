import { createFileRoute, Outlet, redirect, notFound } from "@tanstack/react-router";
import {
  resolveSubject,
  resolveTopic,
  subjectsQuery,
  type Subject,
  type Topic,
} from "@/lib/content";
import { NotFoundShell } from "@/components/NotFoundShell";

export const Route = createFileRoute("/$subject/$topic")({
  loader: async ({ context, params }) => {
    const subjects = await context.queryClient.ensureQueryData(subjectsQuery);
    const subject = resolveSubject(subjects, params.subject);
    if (!subject) throw notFound();
    // "mix" is a valid pseudo-topic used by the multi-topic practice picker.
    const topic =
      params.topic === "mix"
        ? ({ slug: "mix", name: "Mixed topics" } as Topic)
        : resolveTopic(subject, params.topic);
    if (!topic) throw notFound({ data: { subjectSlug: subject.slug } });
    // Canonical-slug redirect when the URL drifted (case/encoding/alias).
    if (
      subject.slug !== params.subject ||
      (params.topic !== "mix" && topic.slug !== params.topic)
    ) {
      throw redirect({
        to: "/$subject/$topic",
        params: { subject: subject.slug, topic: topic.slug },
      });
    }
    return { subject, topic } as { subject: Subject; topic: Topic };
  },
  notFoundComponent: () => <NotFoundShell />,
  errorComponent: ({ error }) => (
    <NotFoundShell title="Something went off-syllabus" message={error.message} />
  ),
  component: () => <Outlet />,
});
