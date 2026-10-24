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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Kpi({ label, value, icon, tone }: { label: string; value?: number | undefined; icon: ReactNode; tone: string }) {
  return (
    <div className="group rounded-3xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex min-h-14 items-start justify-between gap-3 text-sm font-medium leading-5 text-muted-foreground">
        <span className="max-w-[150px] pt-1">{label}</span>
        <span className={`icon-glow grid h-12 w-12 shrink-0 place-items-center rounded-full transition-transform duration-200 group-hover:scale-105 ${tone}`}>{icon}</span>
      </div>
      <div className="mt-5 text-4xl font-semibold tabular-nums">
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

function DonutChart({ data }: { data: Stats | undefined }) {
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
    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Distribuția fix-urilor verificate</h2>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs tabular-nums text-muted-foreground">din {totalTichete} tichete</span>
      </div>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <ChartContainer config={donutConfig} className="mx-auto aspect-square h-[280px] w-[280px] max-w-full">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={95} outerRadius={125} paddingAngle={4} cornerRadius={7} strokeWidth={0}>
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-4xl font-semibold tabular-nums"
            >
              {pct}%
            </text>
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">
              confirmate
            </text>
          </PieChart>
        </ChartContainer>
        <ul className="grid w-full divide-y divide-border/60">
          {chartData.map((entry) => (
            <li key={entry.key} className="flex items-center gap-3 py-5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.fill }} />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
              <span className="ml-auto text-xl font-semibold tabular-nums">{entry.value}</span>
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
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total tichete" value={data?.totalTichete} icon={<ListChecks className="h-5 w-5" />} tone="tone-info" />
        <Kpi label="Fix-uri confirmate" value={data?.fixuriConfirmate} icon={<CheckCircle2 className="h-5 w-5" />} tone="tone-success" />
        <Kpi label="Fix-uri invalidate de agent" value={data?.fixuriInvalidate} icon={<RotateCcw className="h-5 w-5" />} tone="tone-ai" />
        <Kpi label="Necesită verificare manuală" value={data?.necesitaVerificareManuala} icon={<Hand className="h-5 w-5" />} tone="tone-warning" />
      </div>
      <div className="mt-7">
        <DonutChart data={data} />
      </div>
    </>
  );
}
