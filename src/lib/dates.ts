import { format } from "date-fns";
import { ro } from "date-fns/locale";

// Câmpurile de tip „date only” vin de la backend ca „2026-08-17”.
// Se afișează fix așa, fără oră și fără conversie de fus orar.
const DATA_SIMPLA_LA_INCEPUT = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s]|$)/;

export function eDataSimpla(iso: string): boolean {
  return DATA_SIMPLA_LA_INCEPUT.test(iso.trim());
}

// Pentru câmpurile care sunt mereu o dată calendaristică (fără oră în înțeles).
// Nu folosește Date, deci nu se mută niciodată pe altă zi din cauza fusului orar.
export function dataSimplaLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = DATA_SIMPLA_LA_INCEPUT.exec(iso.trim());
  if (!m) return dateLabel(iso);
  const [, an, luna, zi] = m;
  return `${zi}.${luna}.${an}`;
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
