import { describe, expect, it } from "vitest";
import type { Pay } from "./cost";
import { KINDS } from "./evidence";
import { evaluate, LIMITS, runsPerMonth, type Plan, type Routine } from "./plan";

const pay: Pay = { mode: "bruto", salary: 5000, regime: "presumido", benefits: 0 };
const copiar: Routine = { kind: "dados", minutes: 30, runs: 5, period: "semana" };

describe("execuções por mês", () => {
  it("dia = 21, semana = 52/12, mês = o próprio número", () => {
    expect(runsPerMonth(1, "dia")).toBe(21);
    expect(runsPerMonth(12, "semana")).toBeCloseTo(52, 5);
    expect(runsPerMonth(7, "mes")).toBe(7);
  });
});

describe("uma rotina", () => {
  const out = evaluate({ routines: [copiar], pay });
  it("30 min, 5 por semana: 10,83 h hoje e 60% a 90% voltam", () => {
    if (out.status !== "ok") throw new Error("esperava ok");
    expect(out.hoursBefore).toBeCloseTo(10.833, 2);
    expect(out.prudent.hours).toBeCloseTo(6.5, 2);
    expect(out.ceiling.hours).toBeCloseTo(9.75, 2);
    expect(out.prudent.share).toBeCloseTo(0.6, 5);
  });
  it("reais = horas × custo da hora × 12 por ano", () => {
    if (out.status !== "ok") throw new Error("esperava ok");
    expect(out.hourly).toBeCloseTo(45.73, 1);
    expect(out.prudent.brlYear).toBeCloseTo(out.prudent.hours * out.hourly * 12, 6);
  });
  it("teto de investimento: 12 meses = prudente anual, 24 meses = o dobro", () => {
    if (out.status !== "ok") throw new Error("esperava ok");
    expect(out.invest.m12).toBeCloseTo(out.prudent.brlYear, 6);
    expect(out.invest.m24).toBeCloseTo(out.prudent.brlYear * 2, 6);
    expect(out.threeYears.prudent).toBeCloseTo(out.prudent.brlYear * 3, 6);
  });
  it("sensibilidade corta 25% do prudente", () => {
    if (out.status !== "ok") throw new Error("esperava ok");
    expect(out.sensitivity.brlYear).toBeCloseTo(out.prudent.brlYear * 0.75, 6);
  });
});

describe("várias rotinas", () => {
  it("soma horas e reais de cada linha", () => {
    const out = evaluate({ routines: [copiar, { kind: "conferir", minutes: 60, runs: 2, period: "dia" }], pay });
    if (out.status !== "ok") throw new Error("esperava ok");
    expect(out.lines).toHaveLength(2);
    expect(out.prudent.hours).toBeCloseTo(out.lines[0].prudent.hours + out.lines[1].prudent.hours, 9);
    expect(out.hoursBefore).toBeCloseTo(10.833 + 42, 2);
  });
  it("custo total digitado serve no lugar do bruto", () => {
    const out = evaluate({ routines: [copiar], pay: { mode: "custo", monthly: 7000 } });
    if (out.status !== "ok") throw new Error("esperava ok");
    expect(out.hourly).toBeCloseTo((7000 * 12) / 2026.5, 1);
  });
});

describe("toda combinação de tipo, período e degrau dá resultado finito com prudente ≤ teto ≤ hoje", () => {
  const minutes = [1, 5, 30, 120, 480];
  const runs = [1, 5, 50, 100];
  const periods = ["dia", "semana", "mes"] as const;
  it("varredura", () => {
    for (const k of KINDS) {
      for (const m of minutes) {
        for (const r of runs) {
          for (const p of periods) {
            const out = evaluate({ routines: [{ kind: k.id, minutes: m, runs: r, period: p }], pay });
            if (out.status !== "ok") throw new Error(`invalido ${k.id} ${m} ${r} ${p}`);
            expect(Number.isFinite(out.prudent.brlYear)).toBe(true);
            expect(out.prudent.hours).toBeLessThanOrEqual(out.ceiling.hours + 1e-9);
            expect(out.ceiling.hours).toBeLessThanOrEqual(out.hoursBefore + 1e-9);
          }
        }
      }
    }
  });
  it("evidência: prudente ≤ teto em todo tipo e Analisar não tem prudente", () => {
    for (const k of KINDS) expect(k.prudent).toBeLessThanOrEqual(k.ceiling);
    expect(KINDS.find((k) => k.id === "decidir")?.prudent).toBe(0);
  });
});

describe("entrada inválida", () => {
  const bad = (r: Partial<Routine>, p: Pay = pay): Plan => ({ routines: [{ ...copiar, ...r }], pay: p });
  it.each([
    ["minutos zero", bad({ minutes: 0 }), "minutes"],
    ["minutos NaN", bad({ minutes: Number.NaN }), "minutes"],
    ["minutos demais", bad({ minutes: 601 }), "minutes"],
    ["execuções zero", bad({ runs: 0 }), "runs"],
    ["execuções demais", bad({ runs: LIMITS.MAX_RUNS + 1 }), "runs"],
    ["período desconhecido", bad({ period: "ano" as never }), "period"],
    ["tipo desconhecido", bad({ kind: "x" as never }), "kind"],
    ["salário zero", bad({}, { mode: "bruto", salary: 0, regime: "simples", benefits: 0 }), "pay"],
    ["sem rotina", { routines: [], pay }, "routines"],
    ["rotinas demais", { routines: Array.from({ length: LIMITS.MAX_ROUTINES + 1 }, () => copiar), pay }, "routines"],
  ])("%s", (_nome, plan, field) => {
    const out = evaluate(plan as Plan);
    expect(out.status).toBe("invalid");
    if (out.status === "invalid") expect(out.field).toBe(field);
  });
});
