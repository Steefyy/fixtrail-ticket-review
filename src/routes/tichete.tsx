import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Search, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/AppHeader";
import { TicketDetails, TicketVerification } from "@/components/TicketDetails";
import { SeveritateBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTickets, useClusters } from "@/hooks/useVerifix";
import { filterTickets, parseTicketFilters, ticketVerdict, type TicketFilters } from "@/lib/ticketFilters";
import { cn } from "@/lib/utils";
import { STATUSURI, SEVERITATE_RANG } from "@/types";

export const Route = createFileRoute("/tichete")({
  validateSearch: parseTicketFilters,
  head: () => ({
    meta: [
      { title: "Tichete · AfterCheck" },
      { name: "description", content: "Lista prioritizată a tichetelor în AfterCheck." },
      { property: "og:title", content: "Tichete · AfterCheck" },
      { property: "og:description", content: "Lista prioritizată a tichetelor în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TicketsPage,
});

function MultiFilter({ label, options, values, onChange }: { label: string; options: string[]; values: string[]; onChange: (values: string[] | undefined) => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="justify-between">{label}{values.length > 0 && <span className="tone-info rounded-full px-1.5 text-xs tabular-nums">{values.length}</span>}<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="start">{options.map((value) => <DropdownMenuCheckboxItem key={value} checked={values.includes(value)} onSelect={(e) => e.preventDefault()} onCheckedChange={(checked) => { const next = checked ? [...values, value] : values.filter((v) => v !== value); onChange(next.length ? next : undefined); }}>{value}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>;
}

function TicketsPage() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  const ticketsQuery = useTickets();
  const clustersQuery = useClusters();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tickets = ticketsQuery.data ?? [];
  const visible = filterTickets(tickets, filters);
  const update = (patch: Partial<TicketFilters>) => void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const quick = (search: TicketFilters) => void navigate({ search });
  const shortcuts = [
    { label: "Toate", count: tickets.length, search: {}, active: !Object.values(filters).some((v) => Array.isArray(v) ? v.length : v) },
    { label: "Redeschise de agent", count: tickets.filter((t) => t.redeschisDeAgent).length, search: { redeschisDeAgent: true }, active: !!filters.redeschisDeAgent },
    { label: "Confirmate", count: tickets.filter((t) => ticketVerdict(t) === "trecut").length, search: { verdict: "trecut" }, active: filters.verdict === "trecut" },
    { label: "Verificare manuală", count: tickets.filter((t) => ticketVerdict(t) === "manual").length, search: { verdict: "manual" }, active: filters.verdict === "manual" },
    { label: "Noi", count: tickets.filter((t) => t.status === "Nou").length, search: { status: ["Nou"] }, active: filters.status?.length === 1 && filters.status[0] === "Nou" },
  ];
  return <TooltipProvider delayDuration={250}>
    <PageHeader title="Tichete" />
    <div className="mb-5 flex flex-wrap gap-2">{shortcuts.map((s) => <Button key={s.label} variant="outline" aria-pressed={s.active} className={cn("rounded-full", s.active && "border-primary/40 bg-accent text-accent-foreground")} onClick={() => quick(s.search)}>{s.label}<span className="tabular-nums text-muted-foreground">{ticketsQuery.isPending ? "—" : s.count}</span></Button>)}</div>
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="relative min-w-0 basis-full sm:basis-auto sm:flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Caută tichete" placeholder="Caută ID, titlu sau descriere" value={filters.q ?? ""} onChange={(e) => update({ q: e.target.value || undefined })} className="pl-9" /></div>
      <MultiFilter label="Status" options={STATUSURI} values={filters.status ?? []} onChange={(status) => update({ status })} />
      <MultiFilter label="Severitate" options={Object.keys(SEVERITATE_RANG)} values={filters.severitate ?? []} onChange={(severitate) => update({ severitate })} />
      <Select value={filters.categorie ?? "all"} onValueChange={(v) => update({ categorie: v === "all" ? undefined : v })}><SelectTrigger aria-label="Categorie" className="w-auto min-w-36 max-w-full"><SelectValue placeholder="Categorie" /></SelectTrigger><SelectContent><SelectItem value="all">Toate categoriile</SelectItem>{[...new Set(tickets.map((t) => t.categorie))].sort().map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      <Select value={filters.verdict ?? "all"} onValueChange={(v) => update({ verdict: v === "all" ? undefined : v })}><SelectTrigger aria-label="Verdict agent" className="w-auto min-w-40 max-w-full"><SelectValue /></SelectTrigger><SelectContent>{([["all", "Toate verdictele"], ["trecut", "Trecut"], ["picat", "Picat"], ["eroare", "Eroare"], ["manual", "Verificare manuală"], ["neverificat", "Neverificat"]] as const).map(([v, label]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}</SelectContent></Select>
      <label className="flex items-center gap-2 text-xs"><Switch checked={!!filters.testabil} onCheckedChange={(v) => update({ testabil: v || undefined })} />Doar testabile</label>
      <label className="flex items-center gap-2 text-xs"><Switch checked={!!filters.redeschisDeAgent} onCheckedChange={(v) => update({ redeschisDeAgent: v || undefined })} />Doar redeschise de agent</label>
      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Resetează filtrele" onClick={() => quick({})}><RotateCcw /></Button></TooltipTrigger><TooltipContent>Resetează filtrele</TooltipContent></Tooltip>
    </div>
    {ticketsQuery.error ? <div role="alert" className="py-8 text-sm text-destructive"><p>{ticketsQuery.error.message}</p><Button variant="outline" className="mt-3" onClick={() => void ticketsQuery.refetch()}>Încearcă din nou</Button></div> : ticketsQuery.isPending ? <div className="grid gap-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div> : !tickets.length ? <div className="py-16 text-center"><p>Încă nu ai importat tichete</p><Button asChild variant="link" className="mt-2"><Link to="/import">Importă tichete →</Link></Button></div> : !visible.length ? <div className="py-16 text-center"><p>Niciun tichet nu corespunde filtrelor</p><Button variant="outline" className="mt-4" onClick={() => quick({})}>Resetează filtrele</Button></div> : <>
      <p className="mb-3 text-xs tabular-nums text-muted-foreground">{visible.length} din {tickets.length} tichete</p>
      <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-sm"><table className="w-full min-w-[1180px] text-left text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr>{["#", "ID", "Titlu", "Categorie", "Severitate", "Raportări", "Status", "Versiune fix", "Ultima verificare"].map((h) => <th key={h} className="px-4 py-4 font-medium">{h}</th>)}</tr></thead><tbody>{visible.map((t) => <tr key={t.id} tabIndex={0} aria-label={`Deschide ${t.id}`} onClick={() => setSelectedId(t.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(t.id); } }} className={cn("cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", t.redeschisDeAgent && "shadow-[inset_3px_0_0_var(--destructive)]")}>
        <td className="px-4 py-4 tabular-nums text-muted-foreground">{t.prioritate}</td><td className="px-4 py-4 font-mono text-xs text-primary">{t.id}</td><td className="max-w-80 px-4 py-4"><div className="truncate font-medium" title={t.titlu}>{t.titlu}</div><p className="mt-1 truncate text-xs text-muted-foreground" title={t.descriere}>{t.descriere}</p></td><td className="px-4 py-4 text-xs">{t.categorie}</td><td className="px-4 py-4"><SeveritateBadge severitate={t.severitate} sursa={t.severitateSursa} /></td><td className="px-4 py-4 tabular-nums"><Tooltip><TooltipTrigger asChild><span tabIndex={0}>{t.nrRaportari}</span></TooltipTrigger><TooltipContent>{t.totalRaportariCluster} în total pe problemă</TooltipContent></Tooltip></td><td className="px-4 py-4"><StatusBadge status={t.status} /></td><td className="px-4 py-4 text-xs tabular-nums">{t.versiuneFix ?? "—"}</td><td className="min-w-44 px-4 py-4"><TicketVerification ticket={t} /></td>
      </tr>)}</tbody></table></div>
    </>}
    <TicketDetails ticket={tickets.find((t) => t.id === selectedId)} tickets={tickets} clusters={clustersQuery.data ?? []} onSelect={setSelectedId} onClose={() => setSelectedId(null)} />
  </TooltipProvider>;
}
