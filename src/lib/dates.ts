import { format } from "date-fns";
import { ro } from "date-fns/locale";

// Câmpurile de tip „date only” vin de la backend ca „2026-08-17”.
// Se afișează fix așa, fără oră și fără conversie de fus orar.
const DATA_SIMPLA = /^(\d{4})-(\d{2})-(\d{2})$/;

export function eDataSimpla(iso: string): boolean {
  return DATA_SIMPLA.test(iso.trim());
}

export function formatDateSimpla(iso: string): string {
  const m = DATA_SIMPLA.exec(iso.trim());
  if (!m) return "—";
  const [, an, luna, zi] = m;
  return `${zi}.${luna}.${an}`;
}

export function formatDataOra(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "dd.MM.yyyy HH:mm", { locale: ro });
}

export function dateLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  return eDataSimpla(iso) ? formatDateSimpla(iso) : formatDataOra(iso);
}
