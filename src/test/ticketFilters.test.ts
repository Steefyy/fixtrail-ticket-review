import { describe, expect, it } from "vitest";
import { createMockState } from "@/lib/mockData";
import { filterTickets, parseTicketFilters, ticketVerdict, verificationDisabledReason } from "@/lib/ticketFilters";

const tickets = createMockState().tickets;
const base = tickets[0];
if (!base) throw new Error("Missing ticket fixture");

describe("filtre tichete", () => {
  it("citește statusul simplu din URL și selecțiile multiple", () => {
    expect(parseTicketFilters({ status: "În lucru", verdict: "picat" })).toMatchObject({ status: ["În lucru"], verdict: "picat" });
    expect(parseTicketFilters({ status: ["Nou", "În lucru"] }).status).toEqual(["Nou", "În lucru"]);
  });
  it("folosește prioritatea din backend, nu severitatea", () => {
    expect(filterTickets([{ ...base, id: "A", prioritate: 9, severitate: "Critică" }, { ...base, id: "B", prioritate: 2, severitate: "Mică" }], {}).map((t) => t.id)).toEqual(["B", "A"]);
  });
  it("caută în ID, titlu și descriere", () => {
    const t = { ...base, id: "ID-unic", titlu: "Titlu distinct", descriere: "Descriere specială" };
    for (const q of ["id-unic", "DISTINCT", "specială"]) expect(filterTickets([t], { q })).toHaveLength(1);
    expect(filterTickets([t], { q: "inexistent" })).toHaveLength(0);
  });
  it("combină toate filtrele", () => {
    const t = { ...base, status: "În lucru" as const, severitate: "Mare" as const, categorie: "Plăți", testabil: true, redeschisDeAgent: true, ultimaVerificare: { verdict: "picat" as const, data: "", versiuneTestata: "", raportId: "" } };
    const f = { status: ["Nou", "În lucru"], severitate: ["Mare"], categorie: "Plăți", verdict: "picat", testabil: true, redeschisDeAgent: true };
    expect(filterTickets([t, { ...t, testabil: false }, { ...t, redeschisDeAgent: false }, { ...t, categorie: "Altele" }, { ...t, severitate: "Mică" }, { ...t, status: "Închis – nu se reproduce" }, { ...t, ultimaVerificare: null }], f)).toEqual([t]);
  });
  it("verificarea manuală are prioritate pentru fixuri netestabile", () => {
    expect(ticketVerdict({ ...base, status: "Rezolvat – fix livrat", testabil: false })).toBe("manual");
    expect(ticketVerdict({ ...base, status: "Nou", ultimaVerificare: null })).toBe("neverificat");
  });
  it("Doar testabile și Doar redeschise filtrează valorile true", () => {
    expect(filterTickets([{ ...base, id: "yes", testabil: true, redeschisDeAgent: true }, { ...base, id: "no", testabil: false, redeschisDeAgent: false }], { testabil: true, redeschisDeAgent: true }).map((t) => t.id)).toEqual(["yes"]);
  });
  it("verificarea individuală este permisă doar pentru fix livrat testabil", () => {
    expect(verificationDisabledReason({ ...base, status: "Rezolvat – fix livrat", testabil: true })).toBeUndefined();
    expect(verificationDisabledReason({ ...base, status: "Nou", testabil: true })).toBeDefined();
    expect(verificationDisabledReason({ ...base, status: "Rezolvat – fix livrat", testabil: false })).toBeDefined();
  });
});