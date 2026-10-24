import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ShieldCheck, Play, LayoutDashboard, Ticket, FileText, Upload, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";
import { useRunVerification, useSchedulerStatus } from "@/hooks/useVerifix";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Prezentare generală", icon: LayoutDashboard },
  { to: "/tichete", label: "Tichete", icon: Ticket },
  { to: "/rapoarte", label: "Rapoarte", icon: FileText },
  { to: "/import", label: "Import", icon: Upload },
  { to: "/setari", label: "Setări", icon: Settings },
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
    <div className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground lg:flex">
      <span className="relative flex h-2 w-2">
        {running && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
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

function Sidebar() {
  const { rol, setRol } = useRole();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-sidebar px-4 py-5 md:flex">
      <Link to="/" className="mb-8 flex items-center gap-2 px-2 text-lg font-semibold tracking-tight">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </span>
        Verifix
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: n.to === "/" }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            activeProps={{ className: "!bg-sidebar-accent !text-sidebar-accent-foreground font-medium" }}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Rol</p>
        <div className="grid grid-cols-2 rounded-lg border bg-muted p-0.5 text-xs" role="group" aria-label="Rol">
          {(["pm", "dev"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRol(r)}
              className={cn(
                "rounded-md px-2 py-1.5 font-medium transition-colors",
                rol === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r === "pm" ? "Product Manager" : "Developer"}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const run = useRunVerification();
  const sched = useSchedulerStatus();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const curent = NAV.find((n) => n.to === path)?.label ?? "Verifix";
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/90 px-6 backdrop-blur">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Verifix</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{curent}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <SchedulerIndicator />
        <Button onClick={() => run.mutate(undefined)} disabled={run.isPending || sched.data?.ruleazaAcum}>
          <Play className="h-3.5 w-3.5" /> Verifică acum
        </Button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <nav className="flex gap-1 overflow-x-auto border-b px-4 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="px-3 py-2 text-sm text-muted-foreground" activeProps={{ className: "!text-primary font-medium" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Placeholder({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
