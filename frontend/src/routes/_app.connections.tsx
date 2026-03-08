import { createFileRoute } from "@tanstack/react-router";
import ConnectionsPage from "@/components/connections/ConnectionsPage";

export const Route = createFileRoute("/_app/connections")({
  component: ConnectionsPage,
});
