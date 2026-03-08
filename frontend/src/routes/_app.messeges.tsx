import { createFileRoute } from "@tanstack/react-router";
import Messages from "@/components/messages/Message";

export const Route = createFileRoute("/_app/messeges")({
  component: Messages,
});
