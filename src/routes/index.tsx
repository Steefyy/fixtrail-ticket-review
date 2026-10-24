import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ListChecks, RotateCcw, Hand } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/AppHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/hooks/useVerifix";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prezentare generală · Verifix" },
      { name: "description", content: "Verifix: verificare automată a fix-urilor livrate pentru tichetele de suport." },
      { property: "og:title", content: "Prezentare generală · Verifix" },
      { property: "og:description", content: "Fix-uri confirmate, invalidate și tichete care necesită verificare manuală." },
    ],
  }),
  component: Index,
});

function Kpi({ label, value, icon, tone }: { label: string; value?: number; icon: ReactNode; tone: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <span className={`grid h-8 w-8 place-items-center rounded-md ${tone}`}>{icon}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tabular-nums">
        {value === undefined ? <Skeleton className="h-9 w-16" /> : value}
      </div>
    </div>
  );
}

function Index() {
  const { data, error } = useStats();
  return (
    <>
      <PageHeader title="Prezentare generală" subtitle="Starea fix-urilor verificate de AI Testing Agent." />
      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total tichete" value={data?.totalTichete} icon={<ListChecks className="h-4 w-4" />} tone="tone-ai" />
        <Kpi label="Fix-uri confirmate" value={data?.fixuriConfirmate} icon={<CheckCircle2 className="h-4 w-4" />} tone="tone-success" />
        <Kpi label="Fix-uri invalidate de agent" value={data?.fixuriInvalidate} icon={<RotateCcw className="h-4 w-4" />} tone="tone-danger" />
        <Kpi label="Necesită verificare manuală" value={data?.necesitaVerificareManuala} icon={<Hand className="h-4 w-4" />} tone="tone-info" />
      </div>
    </>
  );
}
