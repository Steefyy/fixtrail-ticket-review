import { SlidersHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import type { TicketFilters } from "@/lib/ticketFilters";
import { STATUSURI, SEVERITATE_RANG } from "@/types";

export const VERDICT_OPTIONS = [
  ["trecut", "Fix confirmat"], ["picat", "Fix invalidat"], ["eroare", "Eroare"],
  ["manual", "Verificare manuală"], ["neverificat", "Neverificat"],
] as const;

function FilterFields({ filters, categories, update }: {
  filters: TicketFilters; categories: string[]; update: (patch: Partial<TicketFilters>) => void;
}) {
  return <div className="grid gap-6">
    {([['status', 'Status', STATUSURI], ['severitate', 'Severitate', Object.keys(SEVERITATE_RANG)]] as const).map(([key, label, options]) =>
      <fieldset key={key}><legend className="mb-3 text-sm font-semibold">{label}</legend><div className="grid gap-3">{options.map((value) =>
        <label key={value} className="flex items-center gap-2.5 text-sm"><Checkbox checked={filters[key]?.includes(value) ?? false} onCheckedChange={(checked) => {
          const values = filters[key] ?? [];
          const next = checked === true ? [...values, value] : values.filter((v) => v !== value);
          update({ [key]: next.length ? next : undefined });
        }} />{value}</label>
      )}</div></fieldset>
    )}
    <div className="grid gap-4">
      <div><label htmlFor="ticket-category" className="mb-2 block text-sm font-semibold">Categorie</label><Select value={filters.categorie ?? "all"} onValueChange={(value) => update({ categorie: value === "all" ? undefined : value })}><SelectTrigger id="ticket-category" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Toate categoriile</SelectItem>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
      <div><label htmlFor="ticket-verdict" className="mb-2 block text-sm font-semibold">Verdict</label><Select value={filters.verdict ?? "all"} onValueChange={(value) => update({ verdict: value === "all" ? undefined : value })}><SelectTrigger id="ticket-verdict" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Toate verdictele</SelectItem>{VERDICT_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
    </div>
    <div className="grid gap-4 border-t border-border pt-4">
      <label className="flex items-center justify-between gap-3 text-sm">Doar testabile<Switch checked={!!filters.testabil} onCheckedChange={(v) => update({ testabil: v || undefined })} /></label>
      <label className="flex items-center justify-between gap-3 text-sm">Doar redeschise de agent<Switch checked={!!filters.redeschisDeAgent} onCheckedChange={(v) => update({ redeschisDeAgent: v || undefined })} /></label>
    </div>
  </div>;
}

export function TicketFiltersPanel({ filters, categories, count, update }: {
  filters: TicketFilters; categories: string[]; count: number; update: (patch: Partial<TicketFilters>) => void;
}) {
  const mobile = useIsMobile();
  const trigger = <Button variant="outline" className="h-11"><SlidersHorizontal />Filtre{count > 0 && <span className="tabular-nums">· {count}</span>}</Button>;
  const fields = <FilterFields filters={filters} categories={categories} update={update} />;
  return mobile ? <Sheet><SheetTrigger asChild>{trigger}</SheetTrigger><SheetContent className="w-full overflow-y-auto sm:max-w-full"><SheetHeader className="mb-6 text-left"><SheetTitle>Filtre</SheetTitle></SheetHeader>{fields}<SheetClose asChild><Button className="mt-6 w-full"><Check />Gata</Button></SheetClose></SheetContent></Sheet> :
    <Popover><PopoverTrigger asChild>{trigger}</PopoverTrigger><PopoverContent align="end" className="max-h-[75dvh] w-80 overflow-y-auto p-5" aria-label="Filtre"><h2 className="mb-5 font-semibold">Filtre</h2>{fields}</PopoverContent></Popover>;
}