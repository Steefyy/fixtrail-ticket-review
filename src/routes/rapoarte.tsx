import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/AppHeader";

export const Route = createFileRoute("/rapoarte")({
  head: () => ({
    meta: [
      { title: "Rapoarte · Verifix" },
      { name: "description", content: "Rapoartele AI Testing Agent în Verifix." },
      { property: "og:title", content: "Rapoarte · Verifix" },
      { property: "og:description", content: "Rapoartele AI Testing Agent în Verifix." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Rapoarte" subtitle="Rapoartele AI Testing Agent." />
      <Placeholder text="Conținutul acestei secțiuni urmează." />
    </>
  ),
});
