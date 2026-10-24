import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ChevronDown, Hand, ListChecks, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { PageHeader } from "@/components/AppHeader";
import { SeveritateBadge, VerdictBadge } from "@/components/badges";
import { EroriTehnice, PasiRaport } from "@/components/ReportSteps";
import { comparaClustere, procentConfirmate, verificareCluster } from "@/lib/priority";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TicketDetails } from "@/components/TicketDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/hooks/useRole";
import { useClusters, useReports, useStats, useTickets } from "@/hooks/useVerifix";
import { cn } from "@/lib/utils";
import type { Raport, Stats } from "@/types";

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

function Kpi({ label, value, icon, tone }: { label: string; value?: number | undefined; icon: ReactNode; tone: string }) {
  return (
    <div className="group rounded-3xl border border-border/50 bg-card p-4 shadow-sm transition-all sm:p-6 duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div className="flex min-h-14 flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:gap-3 text-sm font-medium leading-5 text-muted-foreground">
        <span className="max-w-[150px] pt-1">{label}</span>
        <span className={`icon-glow grid h-9 w-9 shrink-0 sm:h-12 sm:w-12 place-items-center rounded-full transition-transform duration-200 group-hover:scale-105 ${tone}`}>{icon}</span>
      </div>
      <div className="mt-5 text-3xl font-extrabold sm:text-4xl tabular-nums text-ink">
        {value === undefined ? <Skeleton className="h-9 w-16" /> : value}
      </div>
    </div>
  );
}

function Tile({ label, value, helper, tone }: { label: string; value: ReactNode; helper: string; tone: string }) {
  return (
    <div className={cn("rounded-2xl p-4 transition-colors", tone)}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] leading-4 opacity-75">{helper}</p>
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
  const { fixuriConfirmate, fixuriInvalidate, necesitaVerificareManuala } = data;
  const chartData = [
    { name: donutConfig.confirmate.label, key: "confirmate", value: fixuriConfirmate, fill: "var(--t-success-fg)" },
    { name: donutConfig.invalidate.label, key: "invalidate", value: fixuriInvalidate, fill: "var(--t-danger-fg)" },
    { name: donutConfig.manuale.label, key: "manuale", value: necesitaVerificareManuala, fill: "var(--t-info-fg)" },
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

/** Product Manager: business impact and release efficacy. */
function SintezaExecutiva({ data }: { data: Stats | undefined }) {
  if (!data) return <Skeleton className="mt-7 h-72 w-full rounded-3xl" />;
  const eficacitate = procentConfirmate(data.fixuriConfirmate, data.fixuriInvalidate);
  return (
    <section className="mt-8 border-t border-border/60 pt-6 sm:pt-8">
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

/** Developer: what the agent actually hit while running. */
function InsightsTehnice() {
  const { data: rapoarte } = useReports();
  const { data: tichete } = useTickets();
  if (!rapoarte) return <Skeleton className="mt-7 h-28 w-full rounded-3xl" />;
  const esuate = rapoarte.filter((r) => r.verdict !== "trecut");
  const erori = esuate.reduce((a, r) => a + (r.eroriDom?.length ?? 0), 0);
  const stack = esuate.filter((r) => r.stackTrace).length;
  const medie = esuate.length ? Math.round(esuate.reduce((a, r) => a + r.durataSecunde, 0) / esuate.length) : 0;
  const zombie = (tichete ?? []).filter((t) => t.redeschisDeAgent).length;
  return (
    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Tile label="Erori DOM" value={erori} helper="în rulările eșuate" tone="tone-danger" />
      <Tile label="Stack trace-uri" value={stack} helper="din consola browserului" tone="tone-ai" />
      <Tile label="Timp mediu / verificare" value={`${medie}s`} helper="pe rulare" tone="tone-info" />
      <Tile label="Tichete zombie" value={zombie} helper="redeschise după fix" tone="tone-warning" />
    </div>
  );
}

function JurnaleAgent() {
  const { data: rapoarte } = useReports();
  const { data: tichete } = useTickets();
  const [deschis, setDeschis] = useState<string | null>(null);
  if (!rapoarte) return <Skeleton className="mt-7 h-64 w-full rounded-3xl" />;
  const esuate = rapoarte.filter((r) => r.verdict !== "trecut").sort((a, b) => b.data.localeCompare(a.data));
  const titlu = (id: string) => (tichete ?? []).find((t) => t.id === id)?.titlu ?? "—";
  return (
    <section className="mt-7 rounded-3xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Jurnale Agent AI</h2>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs tabular-nums text-muted-foreground">{esuate.length} rulări eșuate</span>
      </div>
      <ul className="mt-6 grid gap-3">
        {esuate.map((r) => {
          const open = deschis === r.id;
          return (
            <li key={r.id} className="overflow-hidden rounded-2xl border border-border/60">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setDeschis(open ? null : r.id)}
                className="flex w-full items-center gap-3 bg-muted/40 px-4 py-3.5 text-left transition-colors hover:bg-muted/70"
              >
                <VerdictBadge verdict={r.verdict} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {r.ticketId} · {titlu(r.ticketId)}
                  </span>
                  <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
                    v{r.versiuneTestata} · {r.durataSecunde}s · {r.pasi.length} pași
                  </span>
                </span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
              </button>
              {open && <DetaliiRulare raport={r} />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DetaliiRulare({ raport }: { raport: Raport }) {
  return (
    <div className="grid gap-3.5 border-t border-border/60 p-4 sm:p-5">
      <PasiRaport pasi={raport.pasi} />
      <EroriTehnice raport={raport} />
      <div className="rounded-xl bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
        <span className="font-semibold text-foreground">De ce: </span>
        {raport.explicatieAI}
      </div>
      <Link to="/rapoarte/$id" params={{ id: raport.id }} className="text-xs font-semibold text-primary hover:underline">Deschide raportul →</Link>
    </div>
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
    trecut: { label: "Fix confirmat", tone: "tone-success" },
    manual: { label: "Verificare manuală", tone: "tone-info" },
    neverificat: { label: "Neverificat", tone: "tone-neutral" },
  };
  return (
    <TooltipProvider>
      <section className="mt-8">
        <h2 className="text-base font-semibold">Priorități</h2>
        <ol className="mt-4 grid gap-3">
          {vizibile.map((c, i) => {
            const asociate = tichete.filter((t) => c.ticketIds.includes(t.id));
            const verdict = verdicturi[verificareCluster(asociate) ?? "neverificat"];
            const tichet = asociate[0];
            return (
              <li key={c.id}>
                <Button
                  variant="outline"
                  disabled={!tichet}
                  onClick={() => { if (tichet) setSelectat(tichet.id); }}
                  className="group h-auto w-full justify-start gap-3 whitespace-normal rounded-2xl border-border/60 bg-card p-4 text-left shadow-sm hover:border-primary/40 hover:bg-muted/40 sm:gap-4 sm:p-5"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-5">
                    <span className="line-clamp-2 break-words text-sm font-semibold text-foreground sm:text-base">{c.titlu}</span>
                    <span className="flex flex-wrap items-center gap-2 sm:row-start-2">
                      <SeveritateBadge severitate={c.severitateMax} sursa={asociate.some((t) => t.severitateSursa === "llm") ? "llm" : "excel"} />
                      <span className="text-xs tabular-nums text-muted-foreground">{c.totalRaportari} raportări</span>
                    </span>
                    <span className={cn("w-fit rounded-full border px-2.5 py-1 text-xs font-medium sm:col-start-2 sm:row-span-2 sm:row-start-1", verdict.tone)}>{verdict.label}</span>
                  </span>
                  <ArrowRight className="text-muted-foreground transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                </Button>
              </li>
            );
          })}
        </ol>
        {vizibile.length === 0 && <p className="py-6 text-sm text-muted-foreground">Nicio prioritate de afișat.</p>}
        <Button asChild variant="link" className="mt-3 px-0"><Link to="/tichete">Vezi toate prioritățile <ArrowRight /></Link></Button>
      </section>
      <TicketDetails ticket={tichete.find((t) => t.id === selectat)} tickets={tichete} clusters={clustere} onSelect={setSelectat} onClose={() => setSelectat(null)} />
    </TooltipProvider>
  );
}

function Index() {
  const { data, error } = useStats();
  const { rol } = useRole();
  const dev = rol === "dev";
  return (
    <>
      <PageHeader title="Prezentare generală" />
      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <Kpi label="Total tichete" value={data?.totalTichete} icon={<ListChecks className="h-5 w-5" />} tone="tone-info" />
        <Kpi label="Fix-uri confirmate" value={data?.fixuriConfirmate} icon={<CheckCircle2 className="h-5 w-5" />} tone="tone-success" />
        <Kpi label="Fix-uri invalidate de agent" value={data?.fixuriInvalidate} icon={<RotateCcw className="h-5 w-5" />} tone="tone-ai" />
        <Kpi label="Necesită verificare manuală" value={data?.necesitaVerificareManuala} icon={<Hand className="h-5 w-5" />} tone="tone-warning" />
      </div>
      <Prioritati />
      {dev ? (
        <>
          <InsightsTehnice />
          <JurnaleAgent />
        </>
      ) : (
        <>
          <SintezaExecutiva data={data} />
        </>
      )}
    </>
  );
}
