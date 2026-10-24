import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BadgeCheck, Play, LayoutDashboard, Ticket, FileText, Upload, Settings, ChevronRight, PanelLeftClose, PanelLeftOpen, BriefcaseBusiness, Code2 } from "lucide-react";
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
    <div className="hidden items-center gap-2.5 xl:flex">
      <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center" aria-hidden="true">
        <span className={cn("absolute inline-flex h-full w-full rounded-full bg-success", running ? "animate-ping opacity-75" : "animate-pulse opacity-60")} />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
      </span>
      <div className="flex items-center gap-2.5 rounded-full border border-border/70 bg-card px-3.5 py-2 text-xs tabular-nums text-muted-foreground shadow-sm">
        {running ? (
          <span className="font-medium text-foreground">Agentul verifică acum…</span>
        ) : (
          <span>
            Ultima verificare: {relativ(data?.ultimaRulare ?? null, now, false)} · Următoarea{" "}
            {relativ(data?.urmatoareaRulare ?? null, now, true)}
          </span>
        )}
      </div>
    </div>
  );
}

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { rol, setRol } = useRole();
  return (
    <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border/70 bg-sidebar py-8 transition-[width] duration-200 md:flex", collapsed ? "w-20 px-3" : "w-[264px] px-5")}>
      <Link to="/" aria-label="AfterCheck" className={cn("mb-10 flex items-center gap-2.5 text-xl font-semibold", collapsed ? "justify-center" : "px-2")}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-action">
          <BadgeCheck className="h-6 w-6" />
        </span>
        {!collapsed && "AfterCheck"}
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: n.to === "/" }}
            title={collapsed ? n.label : undefined}
            aria-label={n.label}
            className={cn("flex h-12 items-center gap-3 rounded-2xl text-sm text-muted-foreground transition-all hover:bg-sidebar-accent/60 hover:text-sidebar-foreground", collapsed ? "justify-center" : "px-4")}
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" }}
          >
            <n.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-sidebar-border/70 pt-6">
        {!collapsed && <p className="mb-3 px-2 text-xs font-medium text-muted-foreground">Rol</p>}
        <div className={cn("grid rounded-full border border-border/60 bg-muted/70 p-1 text-xs", collapsed ? "grid-cols-1 gap-1" : "grid-cols-2 gap-1")} role="group" aria-label="Rol">
          {(["pm", "dev"] as const).map((r) => {
            const activ = rol === r;
            const nume = r === "pm" ? "Product Manager" : "Developer";
            return (
              <button
                key={r}
                type="button"
                aria-pressed={activ}
                aria-label={nume}
                title={collapsed ? nume : undefined}
                onClick={() => setRol(r)}
                className={cn(
                  "flex h-10 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent px-2 text-[11px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activ
                    ? cn(r === "pm" ? "tone-success" : "tone-info", "font-semibold shadow-sm")
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {collapsed ? (r === "pm" ? <BriefcaseBusiness className="h-4 w-4" /> : <Code2 className="h-4 w-4" />) : nume}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function TopBar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const run = useRunVerification();
  const sched = useSchedulerStatus();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const curent = NAV.find((n) => n.to === path)?.label ?? "AfterCheck";
  return (
    <header className="sticky top-0 z-20 flex min-h-20 flex-wrap items-center gap-3 border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur sm:px-8">
      <Button variant="ghost" size="icon" onClick={onToggle} className="hidden shrink-0 text-muted-foreground md:inline-flex" aria-label={collapsed ? "Extinde meniul" : "Restrânge meniul"} title={collapsed ? "Extinde meniul" : "Restrânge meniul"}>
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">AfterCheck</span>
        <ChevronRight className="hidden h-3.5 w-3.5 sm:block" />
        <span className="hidden font-medium text-foreground sm:inline">{curent}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <SchedulerIndicator />
        <Button variant="premium" className="h-11 rounded-full px-5" onClick={() => run.mutate(undefined)} disabled={run.isPending || sched.data?.ruleazaAcum}>
          <Play className="h-3.5 w-3.5" /> Verifică acum
        </Button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <nav className="flex gap-1 overflow-x-auto border-b border-border/60 px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="shrink-0 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent" activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Placeholder({ text }: { text: string }) {
  return <div className="rounded-3xl border border-border/70 bg-card p-12 text-center text-sm text-muted-foreground shadow-sm">{text}</div>;
}
