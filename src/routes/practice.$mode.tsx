import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { MODE_BY_SLUG, type Mode } from "@/lib/modes";
import { subjectsQuery } from "@/lib/content";

export const Route = createFileRoute("/practice/$mode")({
  loader: ({ params, context }) => {
    const m = MODE_BY_SLUG[params.mode as Mode];
    if (!m) throw notFound();
    context.queryClient.ensureQueryData(subjectsQuery);
    return { mode: m };
  },
  component: () => <Outlet />,
});