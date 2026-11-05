import { describe, expect, it } from "vitest";
import type { Plan } from "./plan";
import { buildReport, reportId, type Lead } from "./report";

const plan: Plan = {
  routines: [
    { kind: "dados", minutes: 30, runs: 5, period: "semana" },
    { kind: "conferir", minutes: 60, runs: 2, period: "dia" },
  ],
  pay: { mode: "bruto", salary: 5000, regime: "presumido", benefits: 0 },
};
const lead: Lead = { email: "ana@miolo.com.br", company: "Miolo", wantsContact: true, whatsapp: "54999990000" };
const now = new Date("2026-11-04T15:00:00Z");

describe("relatório", () => {
  const r = buildReport(plan, lead, now, "https://www.procemiza.com.br", "https://wa.me/555494898181")!;

  it("monta com número, linhas e totais", () => {
    expect(r).not.toBeNull();
    expect(r.rows).toHaveLength(2);
    // nada que a pessoa digitou (nome, empresa) volta no relatório que ela recebe
    expect("company" in r).toBe(false);
    expect("firstName" in r).toBe(false);
    expect(r.subject).toMatch(/^Seu relatório: até R\$ [\d.]+ por ano devolvidos$/);
    expect(r.internal.prudent).toMatch(/R\$/);
    expect(JSON.stringify({ ...r, internal: null })).not.toMatch(/prudente/i);
  });
  it("id tem o formato PRC-AAAAMMDD-XXXX e é estável para o mesmo pedido", () => {
    expect(r.id).toMatch(/^PRC-20261104-[0-9A-Z]{4}$/);
    expect(reportId(plan, lead.email, now)).toBe(r.id);
  });
  it("explica a conta: custo por hora e horas produtivas", () => {
    expect(r.how.join(" ")).toMatch(/R\$ 4\d,\d\d por hora/);
    expect(r.how.join(" ")).toMatch(/horas realmente trabalhadas/);
  });
  it("link do relatório carrega só a simulação, nada pessoal", () => {
    expect(r.reportUrl.startsWith("https://www.procemiza.com.br/relatorio#r=")).toBe(true);
    expect(r.reportUrl).not.toMatch(/miolo|souza|@|ana%/i);
  });
  it("whatsapp leva o número do relatório", () => {
    expect(decodeURIComponent(r.whatsappText)).toContain(r.id);
  });
  it("simulação inválida não vira relatório", () => {
    expect(buildReport({ routines: [], pay: plan.pay }, lead, now, "x", "y")).toBeNull();
  });
});
