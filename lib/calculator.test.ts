import { describe, expect, it } from "vitest";
import { calculate, hourlyFromSalary, K, type CalcInput } from "./calculator";

const base: CalcInput = {
  routine: "Conferir notas fiscais",
  amount: 30,
  unit: "min_dia",
  people: 3,
  hourlyBRL: 40,
  expected: 0.8,
  optimistic: 0.9,
};

function ok(input: CalcInput) {
  const r = calculate(input);
  if (r.status !== "ok") throw new Error(`esperava ok, veio ${JSON.stringify(r)}`);
  return r;
}

describe("calculate", () => {
  it("30 min/dia x 3 pessoas x R$ 40/h", () => {
    const r = ok(base);
    expect(r.perPersonMonth).toBeCloseTo(10.5, 6);
    expect(r.totalMonth).toBeCloseTo(31.5, 6);
    expect(r.expected.hours).toBeCloseTo(25.2, 6);
    expect(r.expected.brlMonth).toBeCloseTo(1008, 6);
    expect(r.expected.brlYear).toBeCloseTo(12096, 6);
    expect(r.optimistic.hours).toBeCloseTo(28.35, 6);
  });

  it("converte cada unidade para horas por pessoa/mês", () => {
    expect(ok({ ...base, unit: "h_semana", amount: 10, people: 1 }).perPersonMonth).toBeCloseTo((10 * 52) / 12, 6);
    expect(ok({ ...base, unit: "h_mes", amount: 40, people: 1 }).perPersonMonth).toBe(40);
    expect(ok({ ...base, unit: "min_dia", amount: 60, people: 1 }).perPersonMonth).toBe(K.WORKDAYS_MONTH);
  });

  it("sem custo/hora devolve só horas", () => {
    const r = ok({ ...base, hourlyBRL: null });
    expect(r.expected.brlMonth).toBeNull();
    expect(r.expected.brlYear).toBeNull();
    expect(r.expected.hours).toBeCloseTo(25.2, 6);
  });

  it("vazio quando falta o tempo", () => {
    expect(calculate({ ...base, amount: null })).toEqual({ status: "empty" });
  });

  it.each([
    [{ amount: Number.NaN }, "amount", "nan"],
    [{ amount: Number.POSITIVE_INFINITY }, "amount", "nan"],
    [{ amount: -5 }, "amount", "negative"],
    [{ amount: 0 }, "amount", "zero"],
    [{ people: 0 }, "people", "zero"],
    [{ people: 1.5 }, "people", "nan"],
    [{ people: K.MAX_PEOPLE + 1 }, "people", "too_large"],
    [{ hourlyBRL: -1 }, "hourlyBRL", "negative"],
    [{ hourlyBRL: K.MAX_BRL_HOUR + 1 }, "hourlyBRL", "too_large"],
    [{ unit: "h_mes" as const, amount: 221 }, "amount", "too_large"],
    [{ expected: 0.95, optimistic: 0.9 }, "optimistic", "order"],
    [{ expected: 1.2 }, "expected", "too_large"],
    [{ expected: 0 }, "expected", "zero"],
  ] as const)("rejeita %j", (patch, field, reason) => {
    expect(calculate({ ...base, ...patch })).toEqual({ status: "invalid", field, reason });
  });

  it("aceita exatamente o teto de horas por pessoa", () => {
    expect(calculate({ ...base, unit: "h_mes", amount: K.MAX_H_PERSON_MONTH }).status).toBe("ok");
  });

  it("valores enormes mas válidos não viram NaN", () => {
    const r = ok({ ...base, people: K.MAX_PEOPLE, unit: "h_mes", amount: K.MAX_H_PERSON_MONTH, hourlyBRL: K.MAX_BRL_HOUR });
    expect(Number.isFinite(r.expected.brlYear ?? NaN)).toBe(true);
  });
});

describe("hourlyFromSalary", () => {
  it("R$ 3.000 CLT (+70%) / 220", () => {
    expect(hourlyFromSalary(3000, K.ENCARGOS.clt)).toBeCloseTo(23.1818, 3);
  });
  it("Simples (+50%)", () => {
    expect(hourlyFromSalary(3500, K.ENCARGOS.simples)).toBeCloseTo(23.8636, 3);
  });
  it("entrada inválida devolve null", () => {
    expect(hourlyFromSalary(0, 0.7)).toBeNull();
    expect(hourlyFromSalary(-10, 0.7)).toBeNull();
    expect(hourlyFromSalary(Number.NaN, 0.7)).toBeNull();
  });
});
