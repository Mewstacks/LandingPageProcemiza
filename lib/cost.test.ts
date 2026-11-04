import { describe, expect, it } from "vitest";
import { annualCost, hourlyCost, multiplier, productiveHoursMonth, productiveHoursYear } from "./cost";

describe("horas produtivas", () => {
  it("44 h, 5x2, 30 dias de férias e 9 feriados dão cerca de 2.026 h por ano", () => {
    expect(productiveHoursYear()).toBeCloseTo(2026.5, 0);
    expect(productiveHoursMonth()).toBeCloseTo(168.9, 0);
  });
});

describe("multiplicador sobre o bruto (com multa FGTS provisionada)", () => {
  it("Presumido/Real fica perto de 1,54 e Simples perto de 1,24", () => {
    expect(multiplier("presumido")).toBeCloseTo(1.544, 2);
    expect(multiplier("simples")).toBeCloseTo(1.236, 2);
  });
});

describe("custo da hora", () => {
  it("R$ 5.000 bruto no Presumido: cerca de R$ 45,7 por hora produtiva", () => {
    expect(hourlyCost({ mode: "bruto", salary: 5000, regime: "presumido", benefits: 0 })).toBeCloseTo(45.73, 1);
  });
  it("R$ 3.000 bruto no Simples: cerca de R$ 22 por hora", () => {
    expect(hourlyCost({ mode: "bruto", salary: 3000, regime: "simples", benefits: 0 })).toBeCloseTo(21.95, 1);
  });
  it("benefícios entram no custo anual", () => {
    const sem = annualCost({ mode: "bruto", salary: 3000, regime: "simples", benefits: 0 });
    const com = annualCost({ mode: "bruto", salary: 3000, regime: "simples", benefits: 700 });
    expect(com! - sem!).toBeCloseTo(8400, 5);
  });
  it("custo total digitado só multiplica por 12", () => {
    expect(annualCost({ mode: "custo", monthly: 7000 })).toBe(84000);
  });
  it.each([
    [{ mode: "bruto", salary: 0, regime: "simples", benefits: 0 }],
    [{ mode: "bruto", salary: -1, regime: "simples", benefits: 0 }],
    [{ mode: "bruto", salary: Number.NaN, regime: "simples", benefits: 0 }],
    [{ mode: "bruto", salary: 1e9, regime: "simples", benefits: 0 }],
    [{ mode: "bruto", salary: 3000, regime: "simples", benefits: -5 }],
    [{ mode: "custo", monthly: 0 }],
    [{ mode: "custo", monthly: Number.POSITIVE_INFINITY }],
  ] as const)("entrada impossível %j volta null", (pay) => {
    expect(annualCost(pay)).toBeNull();
    expect(hourlyCost(pay)).toBeNull();
  });
});
