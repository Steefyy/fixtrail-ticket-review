import { usePostReleaseImpacts } from "@/hooks/useVerifix";
import { findLatestImpact, impactConclusions, impactTrend } from "@/lib/postReleaseImpact";
import { cn } from "@/lib/utils";
import type { PostReleaseImpact } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function DemoImpactBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="tone-neutral inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium">Date demo</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">În producție, datele pot proveni din Zendesk, Intercom, App Store sau Google Play.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ImpactTrendBadge({ impact, complaints = false }: { impact: PostReleaseImpact; complaints?: boolean }) {
  const trend = impactTrend(impact, complaints);
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium tabular-nums", trend.tone)}>{trend.label}</span>;
}

export function PostReleaseImpactCard({ ticketId, version }: { ticketId: string; version: string }) {
  const { data, isPending, error } = usePostReleaseImpacts();
  const impact = findLatestImpact(data ?? [], ticketId, version);
  const conclusion = impact ? impactConclusions[impact.concluzie] : undefined;
  return (
    <section aria-labelledby="impact-heading" className="mb-6 rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="impact-heading" className="font-semibold">Impact după release</h2>
        {impact && <DemoImpactBadge />}
      </div>
      {isPending ? <Skeleton className="mt-4 h-28 w-full rounded-xl" /> : error ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">Impactul post-release nu a putut fi încărcat.</p>
      ) : !impact || !conclusion ? (
        <p className="mt-3 text-sm text-muted-foreground">Impactul post-release nu este încă disponibil.</p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-2 items-center gap-4 sm:grid-cols-3">
            <div><dt className="text-xs text-muted-foreground">Reclamații înainte</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{impact.reclamatiiInainte}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Reclamații după</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{impact.reclamatiiDupa}</dd></div>
            <div className="col-span-2 sm:col-span-1"><dt className="mb-1 text-xs text-muted-foreground">Evoluție</dt><dd><ImpactTrendBadge impact={impact} /></dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <span>v{impact.versiune}</span>
            <span>{impact.zileAnalizate} zile înainte / {impact.zileAnalizate} zile după</span>
            <span className={cn("rounded-full px-2.5 py-1 font-medium", conclusion.tone)}>{conclusion.label}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{conclusion.explanation}</p>
        </>
      )}
    </section>
  );
}