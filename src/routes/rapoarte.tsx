import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppHeader";
import { VerdictBadge } from "@/components/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { useReports } from "@/hooks/useVerifix";

export const Route = createFileRoute("/rapoarte")({
  head: () => ({
    meta: [
      { title: "Rapoarte · AfterCheck" },
      { name: "description", content: "Rapoartele AI Testing Agent în AfterCheck." },
      { property: "og:title", content: "Rapoarte · AfterCheck" },
      { property: "og:description", content: "Rapoartele AI Testing Agent în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rapoarte,
});

function Rapoarte() {
  const { data, error } = useReports();
  const nav = useNavigate();
  const lista = [...(data ?? [])].sort((a, b) => b.data.localeCompare(a.data));
  return (
    <>
      <PageHeader title="Rapoarte" subtitle="Ce a verificat agentul, pas cu pas." />
      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}
      {!data ? (
        <Skeleton className="h-80 w-full rounded-3xl" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border/50 bg-card p-4 shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="p-3 font-medium">Data</th><th className="p-3 font-medium">Tichet</th><th className="p-3 font-medium">Versiune</th><th className="p-3 font-medium">Verdict</th><th className="p-3 font-medium">Pasul picat</th><th className="p-3 font-medium">Durată</th></tr>
            </thead>
            <tbody>
              {lista.map((r) => {
                const picat = r.pasi.find((p) => p.rezultat === "picat");
                return (
                  <tr key={r.id} onClick={() => nav({ to: "/rapoarte/$id", params: { id: r.id } })} className="cursor-pointer border-t border-border/60 hover:bg-muted/40">
                    <td className="p-3 tabular-nums">{new Date(r.data).toLocaleString("ro-RO")}</td>
                    <td className="p-3 font-mono text-xs">{r.ticketId}</td>
                    <td className="p-3 tabular-nums">v{r.versiuneTestata}</td>
                    <td className="p-3"><VerdictBadge verdict={r.verdict} /></td>
                    <td className="p-3 text-muted-foreground">{picat ? `${picat.nr}. ${picat.actiune}` : "—"}</td>
                    <td className="p-3 tabular-nums">{r.durataSecunde}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
