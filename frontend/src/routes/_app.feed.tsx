// src/routes/_app.feed.tsx
import { createFileRoute } from "@tanstack/react-router";
import Feed from "@/components/feed/Feed";

export const Route = createFileRoute("/_app/feed")({
  component: Feed,
});
