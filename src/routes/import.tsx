import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { PageHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useImport } from "@/hooks/useVerifix";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import · AfterCheck" },
      { name: "description", content: "Importă tichete din Excel în AfterCheck." },
      { property: "og:title", content: "Import · AfterCheck" },
      { property: "og:description", content: "Importă tichete din Excel în AfterCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImportPage,
});

function ImportPage() {
  const imp = useImport();
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const trimite = (f?: File) => {
    if (f) imp.mutate(f);
  };
  return (
    <>
      <PageHeader title="Import" subtitle="Încarcă un fișier Excel." />
      <div
        role="button"
        tabIndex={0}
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); trimite(e.dataTransfer.files[0]); }}
        className={cn("grid cursor-pointer place-items-center gap-3 rounded-3xl border-2 border-dashed border-border bg-card p-14 text-center transition-colors", drag && "border-primary bg-primary/5")}
      >
        {imp.isPending ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <Upload className="h-8 w-8 text-primary" />}
        <p className="font-medium">{imp.isPending ? "Se importă…" : "Trage aici fișierul .xlsx sau apasă ca să-l alegi"}</p>
        <input ref={ref} type="file" accept=".xlsx" className="hidden" onChange={(e) => { trimite(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {imp.error && <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{imp.error.message}</p>}
      {imp.data && (
        <div className="mt-6 rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <p className="font-medium tabular-nums">
            {imp.data.importate} tichete importate · {imp.data.severitatiCompletateDeAI} severități completate de AI · {imp.data.clustere} probleme identificate
          </p>
          <Button asChild variant="premium" className="mt-4"><Link to="/">Mergi la Prezentare generală</Link></Button>
        </div>
      )}
    </>
  );
}
