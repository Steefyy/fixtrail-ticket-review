import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ChevronDown, Hand, Inbox, ListChecks, RotateCcw, Terminal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { PageHeader, RoleViewBanner } from "@/components/AppHeader";
import { VerdictBadge } from "@/components/badges";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/hooks/useRole";
import { useReports, useStats, useTickets } from "@/hooks/useVerifix";
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
    <div className="group rounded-3xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex min-h-14 items-start justify-between gap-3 text-sm font-medium leading-5 text-muted-foreground">
        <span className="max-w-[150px] pt-1">{label}</span>
        <span className={`icon-glow grid h-12 w-12 shrink-0 place-items-center rounded-full transition-transform duration-200 group-hover:scale-105 ${tone}`}>{icon}</span>
      </div>
      <div className="mt-5 text-4xl font-extrabold tracking-tight tabular-nums text-ink">
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
  const total = fixuriConfirmate + fixuriInvalidate + necesitaVerificareManuala;
  const pct = total === 0 ? 0 : Math.round((fixuriConfirmate / total) * 100);
  return (
    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
      <h2 className="mb-7 text-base font-semibold">Fixuri verificate</h2>
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
              className="fill-ink text-4xl font-extrabold tabular-nums"
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
              <span className="ml-auto text-xl font-bold tabular-nums text-ink">{entry.value}</span>
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
  const verificate = data.fixuriConfirmate + data.fixuriInvalidate;
  const eficacitate = verificate ? Math.round((data.fixuriConfirmate / verificate) * 100) : 0;
  const top = data.raportariPeCategorie.slice(0, 3);
  const max = top[0]?.raportari ?? 1;
  return (
    <section className="mt-7 rounded-3xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
      <h2 className="text-base font-semibold">Sinteză executivă</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Tile label="Eficacitatea fix-urilor" value={`${eficacitate}%`} helper="au trecut testul" tone="tone-success" />
        <Tile label="Rată redeschidere" value={`${Math.round(data.rataRedeschidere * 100)}%`} helper="redeschise după fix" tone="tone-ai" />
        <Tile label="Tichete neluate" value={data.ticheteDisponibile} helper="așteaptă pe cineva" tone="tone-warning" />
      </div>
      <ul className="mt-7 grid gap-3.5">
        {top.map((c) => (
          <li key={c.categorie}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="font-medium">{c.categorie}</span>
              <span className="tabular-nums text-muted-foreground">
                {c.raportari} raportări · {c.tichete} tichete
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(8, Math.round((c.raportari / max) * 100))}%` }} />
            </div>
          </li>
        ))}
      </ul>
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
      <ol className="grid gap-2">
        {raport.pasi.map((p) => (
          <li key={p.nr} className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-xs">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", p.rezultat === "ok" ? "tone-success" : "tone-danger")}>
              {p.rezultat === "ok" ? "OK" : "PICAT"}
            </span>
            <span className="font-medium">
              {p.nr}. {p.actiune}
            </span>
            {p.selector && <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{p.selector}</code>}
            {p.durataMs !== undefined && <span className="tabular-nums text-muted-foreground">{p.durataMs} ms</span>}
            {p.detalii && <span className="w-full text-muted-foreground">{p.detalii}</span>}
          </li>
        ))}
      </ol>
      {!!raport.eroriDom?.length && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" /> Erori DOM
          </p>
          <ul className="grid gap-1 font-mono text-[11px] leading-5 text-destructive">
            {raport.eroriDom.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {raport.stackTrace && (
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-muted/60 p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold">
            <Terminal className="h-3.5 w-3.5" /> Stack trace
          </p>
          <pre className="whitespace-pre font-mono text-[11px] leading-5">{raport.stackTrace}</pre>
        </div>
      )}
      <div className="rounded-xl bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
        <span className="font-semibold text-foreground">De ce: </span>
        {raport.explicatieAI}
      </div>
    </div>
  );
}

function Index() {
  const { data, error } = useStats();
  const { rol } = useRole();
  const dev = rol === "dev";
  return (
    <>
      <PageHeader title="Prezentare generală" subtitle="Post-Release Inner Loop Intelligence & AI Testing Agent" />
      <RoleViewBanner />
      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dev ? (
          <Kpi label="Tichete de preluat" value={data?.ticheteDisponibile} icon={<Inbox className="h-5 w-5" />} tone="tone-info" />
        ) : (
          <Kpi label="Total tichete" value={data?.totalTichete} icon={<ListChecks className="h-5 w-5" />} tone="tone-info" />
        )}
        <Kpi label="Fix-uri confirmate" value={data?.fixuriConfirmate} icon={<CheckCircle2 className="h-5 w-5" />} tone="tone-success" />
        <Kpi label="Fix-uri invalidate de agent" value={data?.fixuriInvalidate} icon={<RotateCcw className="h-5 w-5" />} tone="tone-ai" />
        <Kpi label="Necesită verificare manuală" value={data?.necesitaVerificareManuala} icon={<Hand className="h-5 w-5" />} tone="tone-warning" />
      </div>
      {dev ? (
        <>
          <InsightsTehnice />
          <JurnaleAgent />
        </>
      ) : (
        <>
          <SintezaExecutiva data={data} />
          <div className="mt-7">
            <DonutChart data={data} />
          </div>
        </>
      )}
    </>
  );
}
