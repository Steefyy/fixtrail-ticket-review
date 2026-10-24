import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, Hand, Inbox, ListChecks, RotateCcw } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { PageHeader } from "@/components/AppHeader";
import { SeveritateBadge, StatusBadge, VerdictBadge } from "@/components/badges";
import { EroriTehnice, PasiRaport } from "@/components/ReportSteps";
import { comparaClustere, procentConfirmate, verificareCluster } from "@/lib/priority";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/hooks/useRole";
import { useClusters, useReports, useStats, useTickets } from "@/hooks/useVerifix";
import { cn } from "@/lib/utils";
import type { Cluster, Raport, Stats } from "@/types";

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
    <div className="group rounded-3xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
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
  const pct = procentConfirmate(fixuriConfirmate, fixuriInvalidate);
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
              din fix-urile testate
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
  const { data: clustere } = useClusters();
  const { data: tichete } = useTickets();
  const [toate, setToate] = useState(false);
  const [deschis, setDeschis] = useState<string | null>(null);
  if (!clustere || !tichete) return <Skeleton className="mt-7 h-96 w-full rounded-3xl" />;
  const lista = [...clustere].sort(comparaClustere);
  const vizibile = toate ? lista : lista.slice(0, 8);
  const max = Math.max(1, ...lista.map((c) => c.totalRaportari));
  const ale = (c: Cluster) => tichete.filter((t) => c.ticketIds.includes(t.id));
  return (
    <section className="mt-7 rounded-3xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
      <h2 className="text-base font-semibold">Priorități</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="w-10 py-2 pl-4 font-medium">#</th><th className="py-2 font-medium">Problemă</th><th className="py-2 font-medium">Severitate</th>
              <th className="py-2 font-medium">Raportări</th><th className="py-2 font-medium">Ultima verificare</th><th className="py-2 pr-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {vizibile.map((c, i) => {
              const ts = ale(c);
              const v = verificareCluster(ts);
              const zombie = ts.some((t) => t.redeschisDeAgent);
              const ai = ts.some((t) => t.severitateSursa === "llm");
              const open = deschis === c.id;
              const statusuri = [...new Set(ts.map((t) => t.status))];
              return (
                <Fragment key={c.id}>
                  <tr onClick={() => setDeschis(open ? null : c.id)} className={cn("cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/40", zombie && "shadow-[inset_3px_0_0_var(--destructive)]")}>
                    <td className="py-3 pl-4 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2 font-medium"><ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />{c.titlu}</div>
                      <div className="ml-5 mt-0.5 text-xs text-muted-foreground">{c.ticketIds.join(", ")}</div>
                    </td>
                    <td className="py-3"><SeveritateBadge severitate={c.severitateMax} sursa={ai ? "llm" : "excel"} /></td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2"><span className="w-10 tabular-nums">{c.totalRaportari}</span>
                        <div className="h-1.5 w-24 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.max(4, (c.totalRaportari / max) * 100)}%` }} /></div></div>
                    </td>
                    <td className="py-3">{v ? <VerdictBadge verdict={v === "manual" ? "manual" : v} /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-3 pr-2"><div className="flex flex-wrap gap-1">{statusuri.map((s) => <StatusBadge key={s} status={s} />)}</div></td>
                  </tr>
                  {open && ts.map((t) => (
                    <tr key={t.id} className="bg-muted/30 text-xs">
                      <td />
                      <td className="py-2 pr-4 pl-5"><span className="font-mono text-muted-foreground">{t.id}</span> · {t.titlu}</td>
                      <td className="py-2"><SeveritateBadge severitate={t.severitate} sursa={t.severitateSursa} /></td>
                      <td className="py-2 tabular-nums">{t.nrRaportari}</td>
                      <td className="py-2">{t.ultimaVerificare ? <VerdictBadge verdict={t.ultimaVerificare.verdict} /> : "—"}</td>
                      <td className="py-2 pr-2"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {lista.length > 8 && (
        <button type="button" onClick={() => setToate(!toate)} className="mt-4 text-sm font-semibold text-primary hover:underline">{toate ? "Arată mai puține" : `Vezi toate (${lista.length})`}</button>
      )}
    </section>
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
          <Prioritati />
          <SintezaExecutiva data={data} />
          <div className="mt-7">
            <DonutChart data={data} />
          </div>
        </>
      )}
    </>
  );
}
