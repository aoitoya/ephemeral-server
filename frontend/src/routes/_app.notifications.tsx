import { createFileRoute } from "@tanstack/react-router";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  return <NotificationCenter />;
}
