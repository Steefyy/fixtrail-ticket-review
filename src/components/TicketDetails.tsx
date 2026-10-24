import { Link } from "@tanstack/react-router";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { SeveritateBadge, StatusBadge, VerdictBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRunVerification, useSchedulerStatus } from "@/hooks/useVerifix";
import { ticketVerdict, verificationDisabledReason } from "@/lib/ticketFilters";
import { dataSimplaLabel } from "@/lib/dates";
import type { Cluster, Ticket } from "@/types";

export function TicketVerification({ ticket }: { ticket: Ticket }) {
  const verdict = ticketVerdict(ticket);
  return <div className="flex flex-wrap items-center gap-2">
    {verdict === "neverificat" ? <span className="text-muted-foreground">—</span> : <VerdictBadge verdict={verdict === "manual" ? "manual" : ticket.ultimaVerificare?.verdict ?? "manual"} />}
    {ticket.ultimaVerificare && <time dateTime={ticket.ultimaVerificare.data} title={ticket.ultimaVerificare.data} className="text-xs text-muted-foreground">{relativeTime(ticket.ultimaVerificare.data)}</time>}
  </div>;
}

function relativeTime(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : formatDistanceToNow(date, { addSuffix: true, locale: ro });
}

export function TicketDetails({ ticket, tickets, clusters, onSelect, onClose }: {
  ticket: Ticket | undefined; tickets: Ticket[]; clusters: Cluster[]; onSelect: (id: string) => void; onClose: () => void;
}) {
  const run = useRunVerification();
  const scheduler = useSchedulerStatus();
  const busy = run.isPending || !!scheduler.data?.ruleazaAcum;
  const reason = ticket ? verificationDisabledReason(ticket) ?? (busy ? "O verificare este deja în curs." : undefined) : undefined;
  const cluster = clusters.find((c) => c.id === ticket?.clusterId);
  return <Sheet open={!!ticket} onOpenChange={(open) => { if (!open) onClose(); }}>
    <SheetContent className="w-full overflow-y-auto sm:w-[560px] sm:max-w-[560px]">
      {ticket && <>
        <SheetHeader className="pr-6 text-left">
          <SheetDescription className="font-mono text-primary">{ticket.id}</SheetDescription>
          <SheetTitle className="break-words text-xl">{ticket.titlu}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-wrap gap-2"><StatusBadge status={ticket.status} /><SeveritateBadge severitate={ticket.severitate} sursa={ticket.severitateSursa} />{ticket.redeschisDeAgent && <span className="tone-danger rounded-full px-2.5 py-1 text-xs">Redeschis de agent</span>}</div>
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-border py-5 text-sm">
          {[["Canal", ticket.canal], ["Categorie", ticket.categorie], ["Funcționalitate", ticket.functionalitate], ["Echipă", ticket.echipa], ["Versiune raportată", ticket.versiuneRaportata], ["Versiune fix", ticket.versiuneFix ?? "—"], ["Fix livrat", dataSimplaLabel(ticket.dataLivrareFix)], ["Deschis", dataSimplaLabel(ticket.dataDeschiderii)]].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words">{value}</dd></div>)}
          <div className="col-span-2"><dt className="text-xs text-muted-foreground">Tichet legat</dt><dd>{ticket.tichetLegat ? <Button variant="link" className="h-auto px-0 py-1" disabled={!tickets.some((t) => t.id === ticket.tichetLegat)} onClick={() => { if (ticket.tichetLegat) onSelect(ticket.tichetLegat); }}>{ticket.tichetLegat}</Button> : "—"}</dd></div>
        </dl>
        <section className="mt-6"><h3 className="font-semibold">Descriere</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{ticket.descriere}</p></section>
        <section className="mt-6"><h3 className="font-semibold">Pași de verificare</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{ticket.pasiVerificare || "Fără pași: necesită verificare manuală"}</p></section>
        <section className="mt-6 border-t border-border pt-5"><h3 className="mb-3 font-semibold">Ultima verificare</h3><TicketVerification ticket={ticket} />{ticket.ultimaVerificare && <Button asChild variant="link" className="mt-2 px-0"><Link to="/rapoarte/$id" params={{ id: ticket.ultimaVerificare.raportId }}>Deschide raportul →</Link></Button>}</section>
        <section className="mt-6 border-t border-border pt-5"><h3 className="font-semibold">Aceeași problemă</h3>{cluster && <p className="mt-1 text-xs text-muted-foreground">{cluster.titlu} · {cluster.totalRaportari} raportări</p>}<ul className="mt-2 grid gap-1">{tickets.filter((t) => t.clusterId === ticket.clusterId && t.id !== ticket.id).map((t) => <li key={t.id}><Button variant="ghost" className="h-auto w-full justify-start whitespace-normal px-0 py-2 text-left" onClick={() => onSelect(t.id)}><span className="shrink-0 font-mono text-primary">{t.id}</span><span className="min-w-0 truncate">{t.titlu}</span></Button></li>)}</ul>{!tickets.some((t) => t.clusterId === ticket.clusterId && t.id !== ticket.id) && <p className="mt-2 text-sm text-muted-foreground">Niciun alt tichet.</p>}</section>
        <div className="mt-7 border-t border-border pt-5"><Tooltip><TooltipTrigger asChild><span tabIndex={reason ? 0 : undefined} className="inline-block max-w-full"><Button variant="premium" className="h-auto min-h-10 max-w-full whitespace-normal text-left" disabled={!!reason} onClick={() => run.mutate([ticket.id], { onError: (e) => toast.error(e.message) })}>{busy ? <Loader2 className="animate-spin" /> : <PlayCircle />}{busy ? "Se verifică…" : "Verifică acum doar acest tichet"}</Button></span></TooltipTrigger>{reason && <TooltipContent>{reason}</TooltipContent>}</Tooltip></div>
      </>}
    </SheetContent>
  </Sheet>;
}