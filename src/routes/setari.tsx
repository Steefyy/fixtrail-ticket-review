import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchedulerStatus, useSettings, useUpdateSettings } from "@/hooks/useVerifix";
import type { Settings } from "@/types";

const VERSIUNI = Array.from({ length: 15 }, (_, i) => `3.${i}.0`);

export const Route = createFileRoute("/setari")({
  head: () => ({
    meta: [
      { title: "Setări · AfterCheck" },
      { name: "description", content: "Configurarea verificărilor în AfterCheck." },
      { property: "og:title", content: "Setări · AfterCheck" },
      { property: "og:description", content: "Configurarea verificărilor în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Setari,
});

const fmt = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString("ro-RO") : "—");

function Setari() {
  const { data } = useSettings();
  const { data: st } = useSchedulerStatus();
  const save = useUpdateSettings();
  const [f, setF] = useState<Settings | null>(null);
  useEffect(() => {
    if (data) setF({ ...data, versiuneLive: data.versiuneLive || "3.14.0" });
  }, [data]);
  return (
    <>
      <PageHeader title="Setări" />
      {!f ? (
        <Skeleton className="h-80 w-full rounded-3xl" />
      ) : (
        <form
          className="grid max-w-xl gap-6 rounded-3xl border border-border/50 bg-card p-6 shadow-sm sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(f, { onSuccess: () => toast.success("Setări salvate"), onError: (er) => toast.error(er.message) });
          }}
        >
          <div className="grid gap-2">
            <Label>Versiune live Wizz Bees</Label>
            <Select value={f.versiuneLive} onValueChange={(v) => setF({ ...f, versiuneLive: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{VERSIUNI.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Versiunea pe care o testează agentul. Alege una mai veche ca să simulezi o regresie.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interval">Interval verificare (minute)</Label>
            <Input id="interval" type="number" min={1} max={60} required value={f.intervalMinute} onChange={(e) => setF({ ...f, intervalMinute: Number(e.target.value) })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">URL Wizz Bees</Label>
            <Input id="url" type="url" required value={f.wizzBeesUrl} onChange={(e) => setF({ ...f, wizzBeesUrl: e.target.value })} />
          </div>
          <Button type="submit" variant="premium" disabled={save.isPending} className="justify-self-start">Salvează</Button>
        </form>
      )}
      <div className="mt-6 max-w-xl rounded-3xl border border-border/50 bg-card p-6 text-sm shadow-sm">
        <h2 className="mb-3 font-semibold">Starea agentului</h2>
        <p className="text-muted-foreground">{st?.ruleazaAcum ? "Rulează acum…" : "În așteptare"}</p>
        <p className="mt-2 tabular-nums">Ultima rulare: {fmt(st?.ultimaRulare)}</p>
        <p className="tabular-nums">Următoarea rulare: {fmt(st?.urmatoareaRulare)}</p>
      </div>
    </>
  );
}
