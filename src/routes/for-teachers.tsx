import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/for-teachers")({
  component: () => <Outlet />,
});
