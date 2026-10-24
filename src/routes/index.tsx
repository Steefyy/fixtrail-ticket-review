import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ListChecks, RotateCcw, Hand } from "lucide-react";
import type { ReactNode } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { PageHeader } from "@/components/AppHeader";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { Stats } from "@/types";
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

function Kpi({ label, value, icon, tone }: { label: string; value?: number | undefined; icon: ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <span className={`grid h-9 w-9 place-items-center rounded-full ${tone}`}>{icon}</span>
      </div>
      <div className="mt-4 text-4xl font-semibold tabular-nums">
        {value === undefined ? <Skeleton className="h-9 w-16" /> : value}
      </div>
    </div>
  );
}

const donutConfig = {
  confirmate: { label: "Fix-uri confirmate", color: "var(--t-success-fg)" },
  invalidate: { label: "Fix-uri invalidate", color: "var(--t-danger-fg)" },
  manuale: { label: "Necesită verificare manuală", color: "var(--t-info-fg)" },
} satisfies ChartConfig;

function DonutChart({ data }: { data?: Stats }) {
  if (!data) return null;
  const { fixuriConfirmate, fixuriInvalidate, necesitaVerificareManuala, totalTichete } = data;
  const chartData = [
    { name: donutConfig.confirmate.label, key: "confirmate", value: fixuriConfirmate, fill: "var(--t-success-fg)" },
    { name: donutConfig.invalidate.label, key: "invalidate", value: fixuriInvalidate, fill: "var(--t-danger-fg)" },
    { name: donutConfig.manuale.label, key: "manuale", value: necesitaVerificareManuala, fill: "var(--t-info-fg)" },
  ];
  const total = fixuriConfirmate + fixuriInvalidate + necesitaVerificareManuala;
  const pct = total === 0 ? 0 : Math.round((fixuriConfirmate / total) * 100);
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">Distribuția fix-urilor verificate</h2>
        <span className="text-xs text-muted-foreground">din {totalTichete} tichete</span>
      </div>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <ChartContainer config={donutConfig} className="aspect-square h-[220px] w-[220px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} strokeWidth={2}>
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-3xl font-semibold tabular-nums"
            >
              {pct}%
            </text>
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">
              confirmate
            </text>
          </PieChart>
        </ChartContainer>
        <ul className="grid w-full gap-3 sm:max-w-[260px]">
          {chartData.map((entry) => (
            <li key={entry.key} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.fill }} />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
              <span className="ml-auto text-sm font-semibold tabular-nums">{entry.value}</span>
            </li>
          ))}
        </ul>
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
      <div className="mt-4">
        <DonutChart data={data} />
      </div>
    </>
  );
}
