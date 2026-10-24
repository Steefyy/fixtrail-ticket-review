import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";
import { useRunVerification, useSchedulerStatus } from "@/hooks/useVerifix";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Prezentare generală" },
  { to: "/tichete", label: "Tichete" },
  { to: "/rapoarte", label: "Rapoarte" },
  { to: "/import", label: "Import" },
  { to: "/setari", label: "Setări" },
] as const;

function relativ(iso: string | null, now: number, viitor: boolean) {
  if (!iso) return "—";
  const min = Math.max(0, Math.round(((viitor ? 1 : -1) * (new Date(iso).getTime() - now)) / 60000));
  if (viitor) return min === 0 ? "acum" : `în ${min} min`;
  return min === 0 ? "chiar acum" : `acum ${min} min`;
}

function SchedulerIndicator() {
  const { data } = useSchedulerStatus();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(i);
  }, []);
  const running = data?.ruleazaAcum;
  return (
    <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
      <span className="relative flex h-2 w-2">
        {running && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", running ? "bg-primary" : "bg-success")} />
      </span>
      {running ? (
        <span className="font-medium text-foreground">Agentul verifică acum…</span>
      ) : (
        <span>
          Ultima verificare: {relativ(data?.ultimaRulare ?? null, now, false)} · Următoarea{" "}
          {relativ(data?.urmatoareaRulare ?? null, now, true)}
        </span>
      )}
    </div>
  );
}

export function AppHeader() {
  const { rol, setRol } = useRole();
  const run = useRunVerification();
  const sched = useSchedulerStatus();
  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          Verifix
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <SchedulerIndicator />
          <div className="flex rounded-md border bg-muted p-0.5 text-xs" role="group" aria-label="Rol">
            {(["pm", "dev"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRol(r)}
                className={cn(
                  "rounded px-2.5 py-1 font-medium transition-colors",
                  rol === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r === "pm" ? "Product Manager" : "Developer"}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => run.mutate(undefined)} disabled={run.isPending || sched.data?.ruleazaAcum}>
            <Play className="h-3.5 w-3.5" /> Verifică acum
          </Button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: n.to === "/" }}
            className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "!border-primary !text-foreground font-medium" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Placeholder({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
