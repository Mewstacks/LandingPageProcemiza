import { describe, expect, it } from "vitest";
import { reportPdf } from "./pdf";
import type { Plan } from "./plan";
import { buildReport } from "./report";

const plan: Plan = {
  routines: [
    { kind: "dados", minutes: 30, runs: 5, period: "semana" },
    { kind: "conferir", minutes: 60, runs: 2, period: "dia" },
  ],
  pay: { mode: "bruto", salary: 5000, regime: "presumido", benefits: 0 },
};

describe("PDF do relatório", () => {
  it("renderiza vários seguidos no mesmo processo (bug de glifos do react-pdf 4.9)", async () => {
    for (const name of ["Ana Souza", "João Conceição", "Mário Ávila"]) {
      const r = buildReport(plan, { name, email: "a@b.com", company: "Açaí & Cia", wantsContact: false }, new Date(), "https://www.procemiza.com.br", "https://wa.me/555494898181")!;
      const buf = await reportPdf(r);
      expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
      expect(buf.length).toBeGreaterThan(5000);
    }
  }, 30000);
});
