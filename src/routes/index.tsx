import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { HavenFlow } from "@/components/haven/HavenFlow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Haven: help when you are worried about a child" },
      {
        name: "description",
        content:
          "Say what you noticed and find safe next steps and people who can help, in English or Pidgin.",
      },
      { property: "og:title", content: "Haven: help when you are worried about a child" },
      {
        property: "og:description",
        content: "Safe next steps for adults in Nigeria who are worried about a child.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <HavenFlow />
    </div>
  );
}
