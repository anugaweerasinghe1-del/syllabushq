import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { resolveMode, MODE_BY_SLUG } from "@/lib/modes";
import { subjectsQuery } from "@/lib/content";
import { NotFoundShell } from "@/components/NotFoundShell";

export const Route = createFileRoute("/practice/$mode")({
  loader: ({ params, context }) => {
    const slug = resolveMode(params.mode);
    if (!slug) throw notFound();
    const m = MODE_BY_SLUG[slug];
    context.queryClient.ensureQueryData(subjectsQuery);
    return { mode: m };
  },
  notFoundComponent: () => (
    <NotFoundShell title="Practice mode not found" message="Choose a mode from the practice hub." />
  ),
  errorComponent: ({ error }) => (
    <NotFoundShell title="Something went wrong" message={error.message} />
  ),
  component: () => <Outlet />,
});
