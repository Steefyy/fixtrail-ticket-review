import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder, RoleViewBanner } from "@/components/AppHeader";

export const Route = createFileRoute("/tichete")({
  head: () => ({
    meta: [
      { title: "Tichete · AfterCheck" },
      { name: "description", content: "Lista prioritizată a tichetelor în AfterCheck." },
      { property: "og:title", content: "Tichete · AfterCheck" },
      { property: "og:description", content: "Lista prioritizată a tichetelor în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Tichete" subtitle="Lista prioritizată a tichetelor." />
      <RoleViewBanner />
      <Placeholder text="Conținutul acestei secțiuni urmează." />
    </>
  ),
});
