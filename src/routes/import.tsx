import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/AppHeader";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import · Verifix" },
      { name: "description", content: "Importă tichete din Excel în Verifix." },
      { property: "og:title", content: "Import · Verifix" },
      { property: "og:description", content: "Importă tichete din Excel în Verifix." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Import" subtitle="Importă tichete din Excel." />
      <Placeholder text="Conținutul acestei secțiuni urmează." />
    </>
  ),
});
