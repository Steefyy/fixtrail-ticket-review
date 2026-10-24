import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ListChecks, RotateCcw, TrendingDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { PageHeader } from "@/components/AppHeader";
import { SeveritateBadge } from "@/components/badges";
import { comparaClustere, procentConfirmate, verificareCluster } from "@/lib/priority";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TicketDetails } from "@/components/TicketDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { useClusters, usePostReleaseImpacts, useStats, useTickets } from "@/hooks/useVerifix";
import { countReducedProblems } from "@/lib/postReleaseImpact";
import { cn } from "@/lib/utils";
import type { Stats } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prezentare generală · AfterCheck" },
      { name: "description", content: "AfterCheck — Post-Release Inner Loop Intelligence & AI Testing Agent. Verificare automată a fix-urilor livrate." },
      { property: "og:title", content: "Prezentare generală · AfterCheck" },
      { property: "og:description", content: "AfterCheck: fix-uri confirmate, invalidate și tichete care necesită verificare manuală." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Kpi({ label, value, icon, tone }: { label: string; value?: number | string | undefined; icon: ReactNode; tone: string }) {
  return (
    <div className="min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
        <span className="min-w-0">{label}</span>
        <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      </div>
      <div className={cn("mt-2 text-2xl font-bold tabular-nums sm:text-3xl", tone)}>
        {value === undefined ? <Skeleton className="h-8 w-14" /> : value}
      </div>
    </div>
  );
}

const donutConfig = {
  confirmate: { label: "Fix-uri confirmate", color: "var(--t-success-fg)" },
  invalidate: { label: "Fix-uri invalidate", color: "var(--t-danger-fg)" },
} satisfies ChartConfig;

function DonutChart({ data }: { data: Stats | undefined }) {
  if (!data) return null;
  const { fixuriConfirmate, fixuriInvalidate } = data;
  const chartData = [
    { name: donutConfig.confirmate.label, key: "confirmate", value: fixuriConfirmate, fill: "var(--t-success-fg)" },
    { name: donutConfig.invalidate.label, key: "invalidate", value: fixuriInvalidate, fill: "var(--t-danger-fg)" },
  ];
  const pct = procentConfirmate(fixuriConfirmate, fixuriInvalidate);
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-semibold">Fixuri verificate</h3>
      <div className="grid items-center gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
        <ChartContainer config={donutConfig} className="mx-auto aspect-square h-[220px] w-[220px] max-w-full">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={75} outerRadius={100} paddingAngle={4} cornerRadius={7} strokeWidth={0}>
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink text-3xl font-extrabold tabular-nums"
            >
              {pct}%
            </text>
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">
              din fix-urile testate
            </text>
          </PieChart>
        </ChartContainer>
        <ul className="grid w-full divide-y divide-border/60">
          {chartData.map((entry) => (
            <li key={entry.key} className="flex items-center gap-3 py-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.fill }} />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
              <span className="ml-auto text-lg font-bold tabular-nums text-ink">{entry.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Business impact and release efficacy. */
function SintezaExecutiva({ data }: { data: Stats | undefined }) {
  if (!data) return <Skeleton className="mt-7 h-72 w-full rounded-3xl" />;
  const eficacitate = procentConfirmate(data.fixuriConfirmate, data.fixuriInvalidate);
  return (
    <section className="mt-8 border-t border-border/60 pt-6">
      <h2 className="text-base font-semibold">Sinteză executivă</h2>
      <div className="mt-5 grid items-center gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <dl className="grid grid-cols-2 gap-4">
          <div className="border-l-2 border-primary pl-4">
            <dt className="text-xs text-muted-foreground">Eficacitatea fix-urilor</dt>
            <dd className="mt-2 text-3xl font-extrabold tabular-nums text-ink">{eficacitate}%</dd>
          </div>
          <div className="border-l-2 border-border pl-4">
            <dt className="text-xs text-muted-foreground">Rată redeschidere</dt>
            <dd className="mt-2 text-3xl font-extrabold tabular-nums text-ink">{Math.round(data.rataRedeschidere * 100)}%</dd>
          </div>
        </dl>
        <DonutChart data={data} />
      </div>
    </section>
  );
}

function Prioritati() {
  const { data: clustere, error: clusterError } = useClusters();
  const { data: tichete, error: ticketError } = useTickets();
  const [selectat, setSelectat] = useState<string | null>(null);
  if (clusterError || ticketError) return <p className="mt-8 text-sm text-destructive">{(clusterError ?? ticketError)?.message}</p>;
  if (!clustere || !tichete) return <Skeleton className="mt-8 h-96 w-full rounded-3xl" />;
  const vizibile = [...clustere].sort(comparaClustere).slice(0, 5);
  const verdicturi = {
    picat: { label: "Fix invalidat", tone: "tone-danger" },
    trecut: { label: "Fix confirmat", tone: "tone-neutral" },
    manual: { label: "Verificare manuală", tone: "tone-neutral" },
    neverificat: { label: "Neverificat", tone: "tone-neutral" },
  };
  return (
    <TooltipProvider>
      <section className="mt-8">
        <h2 className="text-base font-semibold">Priorități</h2>
        <ol className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {vizibile.map((c, i) => {
            const asociate = tichete.filter((t) => c.ticketIds.includes(t.id));
            const verdict = verdicturi[verificareCluster(asociate) ?? "neverificat"];
            const tichet = asociate[0];
            return (
              <li key={c.id}>
                <Button
                  variant="ghost"
                  disabled={!tichet}
                  onClick={() => { if (tichet) setSelectat(tichet.id); }}
                  className="group h-auto w-full justify-start gap-3 whitespace-normal rounded-none px-4 py-3 text-left hover:bg-muted/50 hover:text-foreground sm:gap-4 sm:px-5"
                >
                  <span className="w-5 shrink-0 text-center text-sm font-medium tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-5">
                    <span className="line-clamp-2 break-words text-sm font-semibold text-foreground sm:text-base">{c.titlu}</span>
                    <span className="flex flex-wrap items-center gap-2 sm:row-start-2">
                      <SeveritateBadge severitate={c.severitateMax} sursa={asociate.some((t) => t.severitateSursa === "llm") ? "llm" : "excel"} />
                      <span className="text-xs tabular-nums text-muted-foreground">{c.totalRaportari} raportări</span>
                    </span>
                    <span className={cn("w-fit rounded-full border px-2.5 py-1 text-xs font-medium sm:col-start-2 sm:row-span-2 sm:row-start-1", verdict.tone)}>{verdict.label}</span>
                  </span>
                  <ArrowRight className="text-muted-foreground transition-transform " />
                </Button>
              </li>
            );
          })}
        </ol>
        {vizibile.length === 0 && <p className="py-6 text-sm text-muted-foreground">Nicio prioritate de afișat.</p>}
        <Button asChild variant="link" className="mt-3 px-0"><Link to="/tichete">Vezi toate prioritățile <ArrowRight /></Link></Button>
      </section>
      <TicketDetails ticket={tichete.find((t) => t.id === selectat)} onClose={() => setSelectat(null)} />
    </TooltipProvider>
  );
}

function Index() {
  const { data, error } = useStats();
  const impacts = usePostReleaseImpacts();
  return (
    <>
      <PageHeader title="Prezentare generală" />
      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(odd)]:border-r max-lg:[&>*:nth-child(-n+2)]:border-b lg:[&>*:not(:last-child)]:border-r">
        <Kpi label="Total tichete" value={data?.totalTichete} icon={<ListChecks className="h-5 w-5" />} tone="text-ink" />
        <Kpi label="Fix-uri confirmate" value={data?.fixuriConfirmate} icon={<CheckCircle2 className="h-5 w-5" />} tone="text-ink" />
        <Kpi label="Fix-uri invalidate" value={data?.fixuriInvalidate} icon={<RotateCcw className="h-5 w-5" />} tone={data?.fixuriInvalidate ? "text-danger-ink" : "text-ink"} />
        <Kpi label="Probleme reduse după release" value={impacts.isPending ? undefined : impacts.error || !impacts.data?.length ? "—" : countReducedProblems(impacts.data)} icon={<TrendingDown className="h-5 w-5" />} tone="text-ink" />
      </div>
      <Prioritati />
      <SintezaExecutiva data={data} />
    </>
  );
}
