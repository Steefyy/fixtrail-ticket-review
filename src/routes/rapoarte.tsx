import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/AppHeader";

export const Route = createFileRoute("/rapoarte")({
  head: () => ({
    meta: [
      { title: "Rapoarte · AfterCheck" },
      { name: "description", content: "Rapoartele AI Testing Agent în AfterCheck." },
      { property: "og:title", content: "Rapoarte · AfterCheck" },
      { property: "og:description", content: "Rapoartele AI Testing Agent în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Rapoarte" subtitle="Rapoartele AI Testing Agent." />
      <Placeholder text="Conținutul acestei secțiuni urmează." />
    </>
  ),
});
