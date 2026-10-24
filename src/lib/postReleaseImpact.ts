import type { PostReleaseImpact } from "@/types";

export const impactConclusions = {
  fix_confirmat: { label: "Fix confirmat", tone: "tone-success", explanation: "Testul tehnic a trecut, iar reclamațiile au scăzut după release." },
  necesita_monitorizare: { label: "Necesită monitorizare", tone: "tone-warning", explanation: "Testul tehnic a trecut, dar reclamațiile nu au scăzut suficient." },
  fix_invalidat: { label: "Fix invalidat", tone: "tone-danger", explanation: "Verificarea tehnică a picat, iar problema trebuie redeschisă." },
} as const;

export function impactTrend(impact: PostReleaseImpact, complaints = false) {
  if (impact.trend === "stabil") return { label: "Fără schimbare", tone: "tone-neutral" };
  const percentage = Math.abs(impact.schimbareProcent).toLocaleString("ro-RO", { maximumFractionDigits: 1 });
  return {
    label: `${impact.trend === "scadere" ? "↓" : "↑"} ${percentage}%${complaints ? " reclamații" : ""}`,
    tone: impact.trend === "scadere" ? "tone-success" : "tone-danger",
  };
}

export const countReducedProblems = (impacts: PostReleaseImpact[]) =>
  impacts.filter((impact) => impact.concluzie === "fix_confirmat").length;

export function findLatestImpact(impacts: PostReleaseImpact[], ticketId: string, version?: string) {
  return impacts.filter((impact) => impact.ticketId === ticketId && (!version || impact.versiune === version))
    .sort((a, b) => b.dataRelease.localeCompare(a.dataRelease))[0];
}