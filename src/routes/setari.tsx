import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/AppHeader";

export const Route = createFileRoute("/setari")({
  head: () => ({
    meta: [
      { title: "Setări · Verifix" },
      { name: "description", content: "Configurarea verificărilor în Verifix." },
      { property: "og:title", content: "Setări · Verifix" },
      { property: "og:description", content: "Configurarea verificărilor în Verifix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Setări" subtitle="Configurarea verificărilor." />
      <Placeholder text="Conținutul acestei secțiuni urmează." />
    </>
  ),
});
