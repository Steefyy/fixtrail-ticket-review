import { describe, expect, it } from "vitest";
import { createMockState } from "@/lib/mockData";
import { computeStats } from "@/lib/api";

describe("prioritizare", () => {
  const t = createMockState().tickets;
  it("severitatea are întâietate față de raportări", () => {
    const iCritic = t.findIndex((x) => x.id === "WB-1011"); // Critică, 18 raportări
    const iMare = t.findIndex((x) => x.id === "WB-1026"); // Mare, 388 raportări
    expect(iCritic).toBeLessThan(iMare);
  });
  it("la aceeași severitate, clusterul cu mai multe raportări e primul", () => {
    expect(t.find((x) => x.id === "WB-1040")!.prioritate).toBeLessThan(t.find((x) => x.id === "WB-1011")!.prioritate);
  });
  it("Rezolvat fără pași = verificare manuală", () => {
    const s = computeStats(t);
    expect(s.necesitaVerificareManuala).toBe(3);
    expect(s.fixuriInvalidate).toBe(3);
    expect(s.fixuriConfirmate).toBe(3);
  });
});
