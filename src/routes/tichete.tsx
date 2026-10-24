import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/AppHeader";

export const Route = createFileRoute("/tichete")({
  head: () => ({
    meta: [
      { title: "Tichete · Verifix" },
      { name: "description", content: "Lista prioritizată a tichetelor în Verifix." },
      { property: "og:title", content: "Tichete · Verifix" },
      { property: "og:description", content: "Lista prioritizată a tichetelor în Verifix." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Tichete" subtitle="Lista prioritizată a tichetelor." />
      <Placeholder text="Conținutul acestei secțiuni urmează." />
    </>
  ),
});
