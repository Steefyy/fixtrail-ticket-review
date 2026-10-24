import { SEVERITATE_RANG, type Ticket } from "@/types";

/** Severity first (Critică=1 … Mică=4, missing last), then cluster report total descending. */
export function comparaPrioritate(a: Ticket, b: Ticket): number {
  const ra = a.severitate ? SEVERITATE_RANG[a.severitate] : 5;
  const rb = b.severitate ? SEVERITATE_RANG[b.severitate] : 5;
  if (ra !== rb) return ra - rb;
  return b.totalRaportariCluster - a.totalRaportariCluster;
}

export function necesitaVerificareManuala(t: Ticket): boolean {
  return t.status === "Rezolvat – fix livrat" && !t.testabil;
}
