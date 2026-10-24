import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/AppHeader";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import · AfterCheck" },
      { name: "description", content: "Importă tichete din Excel în AfterCheck." },
      { property: "og:title", content: "Import · AfterCheck" },
      { property: "og:description", content: "Importă tichete din Excel în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Import" subtitle="Importă tichete din Excel." />
      <Placeholder text="Conținutul acestei secțiuni urmează." />
    </>
  ),
});
