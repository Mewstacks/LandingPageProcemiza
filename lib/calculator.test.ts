import { describe, expect, it } from "vitest";
import {
  K,
  STEP_KINDS,
  calculate,
  defaultCoverage,
  hourlyFromSalary,
  runsPerMonth,
  type CalcInput,
  type Step,
} from "./calculator";

const step = (minutes: number | null, kind: Step["kind"], coverage: number | null = null): Step => ({ minutes, kind, coverage });

/** Conferir notas: 40 por semana, 4 passos de 10 minutos no total, R$ 27 a hora. */
const base: CalcInput = {
  runs: 40,
  period: "semana",
  steps: [step(2, "buscar"), step(4, "conferir"), step(3, "dados"), step(1, "avisar")],
  hourlyBRL: 27,
  exceptions: 0.1,
  rework: null,
};

function ok(input: CalcInput) {
  const r = calculate(input);
  if (r.status !== "ok") throw new Error(`esperava ok, veio ${JSON.stringify(r)}`);
  return r;
}

describe("calculate", () => {
  describe("fixtures calculadas à mão", () => {
    it("40 notas por semana, 4 passos, R$ 27/h", () => {
      const r = ok(base);
      // por execução: 2×0,75 + 4×0,9 + 3×0,95 + 1×0,95 = 8,9 min automatizáveis, × 0,9 de exceções = 8,01
      expect(r.perRunMinutes).toBe(10);
      expect(r.perRunSaved).toBeCloseTo(8.01, 6);
      expect(r.perRunRemain).toBeCloseTo(1.99, 6);
      // 40 × 52/12 = 173,33 execuções por mês
      expect(r.runsMonth).toBeCloseTo(173.3333, 4);
      expect(r.hoursBefore).toBeCloseTo(28.8889, 4);
      expect(r.hoursReturned).toBeCloseTo(23.14, 6);
      expect(r.hoursAfter).toBeCloseTo(5.7489, 4);
      expect(r.brlMonth).toBeCloseTo(624.78, 4);
      expect(r.brlYear).toBeCloseTo(7497.36, 3);
      expect(r.fte).toBeCloseTo(23.14 / 220, 6);
    });

    it("30 pedidos por dia no WhatsApp, 4 passos, R$ 40/h", () => {
      const r = ok({
        ...base,
        runs: 30,
        period: "dia",
        hourlyBRL: 40,
        steps: [step(1, "decidir"), step(2, "buscar"), step(3, "dados"), step(2, "avisar")],
      });
      // 30 × 21 = 630 execuções; 1×0,2 + 2×0,75 + 3×0,95 + 2×0,95 = 6,45 min × 0,9 = 5,805 de 8
      expect(r.runsMonth).toBe(630);
      expect(r.perRunMinutes).toBe(8);
      expect(r.perRunSaved).toBeCloseTo(5.805, 6);
      expect(r.hoursBefore).toBeCloseTo(84, 6);
      expect(r.hoursReturned).toBeCloseTo(60.9525, 4);
      expect(r.share).toBeCloseTo(0.725625, 6);
      expect(r.brlMonth).toBeCloseTo(2438.1, 3);
      expect(r.brlYear).toBeCloseTo(29257.2, 2);
    });
  });

  describe("períodos", () => {
    it("dia vale 21 dias úteis, semana 52/12 e mês fica como está", () => {
      expect(runsPerMonth(10, "dia")).toBe(210);
      expect(runsPerMonth(12, "semana")).toBeCloseTo(52);
      expect(runsPerMonth(7, "mes")).toBe(7);
    });

    it("converte cada frequência para execuções por mês", () => {
      expect(ok({ ...base, runs: 10, period: "dia" }).runsMonth).toBe(10 * K.WORKDAYS_MONTH);
      expect(ok({ ...base, runs: 12, period: "semana" }).runsMonth).toBeCloseTo((12 * 52) / 12, 6);
      expect(ok({ ...base, runs: 40, period: "mes" }).runsMonth).toBe(40);
    });
  });

  describe("a conta sai dos passos, não de um percentual fixo", () => {
    it("cada passo volta cobertura × (1 − exceções) do seu tempo", () => {
      const r = ok(base);
      expect(r.steps.map((s) => s.minutes)).toEqual([2, 4, 3, 1]);
      expect(r.steps[0].coverage).toBe(0.75);
      expect(r.steps[0].savedMinutes).toBeCloseTo(2 * 0.75 * 0.9);
      expect(r.steps[1].savedMinutes).toBeCloseTo(4 * 0.9 * 0.9);
      expect(r.perRunMinutes).toBe(10);
      expect(r.perRunSaved).toBeCloseTo(8.01);
      expect(r.perRunRemain).toBeCloseTo(1.99);
    });

    it("horas e reais do mês fecham entre si", () => {
      const r = ok(base);
      expect(r.hoursAfter).toBeCloseTo(r.hoursBefore - r.hoursReturned);
      expect(r.share).toBeCloseTo(0.801, 3);
      expect(r.brlMonth).toBeCloseTo(r.hoursReturned * 27);
      expect(r.brlYear).toBeCloseTo((r.brlMonth as number) * 12);
      expect(r.fte).toBeCloseTo(r.hoursReturned / 220);
    });

    it("o percentual devolvido muda com a composição do processo", () => {
      const repetitive = ok({ ...base, steps: [step(5, "dados"), step(5, "avisar")] });
      const human = ok({ ...base, steps: [step(5, "decidir"), step(5, "pessoas")] });
      expect(repetitive.share).toBeGreaterThan(0.85);
      expect(human.share).toBeLessThan(0.2);
      expect(repetitive.share).not.toBeCloseTo(human.share, 1);
    });

    it("sem exceções volta cobertura inteira; com metade, metade dela", () => {
      const none = ok({ ...base, exceptions: 0 });
      expect(none.perRunSaved).toBeCloseTo(2 * 0.75 + 4 * 0.9 + 3 * 0.95 + 1 * 0.95);
      const half = ok({ ...base, exceptions: 0.5 });
      expect(half.perRunSaved).toBeCloseTo(none.perRunSaved / 2);
    });

    it("a cobertura de um passo pode ser trocada pela pessoa", () => {
      const r = ok({ ...base, exceptions: 0, steps: [step(10, "conferir", 0.5)] });
      expect(r.steps[0].coverage).toBe(0.5);
      expect(r.perRunSaved).toBeCloseTo(5);
      expect(defaultCoverage("conferir")).toBe(0.9);
    });

    it("passo que não automatiza (0%) é válido e devolve zero", () => {
      const r = ok({ ...base, steps: [step(5, "decidir", 0)] });
      expect(r.hoursReturned).toBe(0);
      expect(r.share).toBe(0);
      expect(r.brlMonth).toBe(0);
    });

    it("linha em branco é ignorada, não vira erro", () => {
      const r = ok({ ...base, steps: [...base.steps, step(null, "dados")] });
      expect(r.steps).toHaveLength(4);
    });

    it("sem custo/hora devolve só horas", () => {
      const r = ok({ ...base, hourlyBRL: null });
      expect(r.brlMonth).toBeNull();
      expect(r.brlYear).toBeNull();
      expect(r.hoursReturned).toBeCloseTo(23.14, 6);
    });

    it("todo tipo de passo tem uma cobertura entre 0 e 1", () => {
      for (const kind of STEP_KINDS) {
        expect(kind.coverage).toBeGreaterThanOrEqual(0);
        expect(kind.coverage).toBeLessThanOrEqual(1);
      }
      expect(defaultCoverage("dados")).toBeGreaterThan(defaultCoverage("buscar"));
      expect(defaultCoverage("buscar")).toBeGreaterThan(defaultCoverage("decidir"));
    });
  });

  describe("retrabalho", () => {
    it("soma as horas de refazer e devolve a mesma fração automatizada", () => {
      const r = ok({ ...base, rework: { percent: 0.1, minutes: 20 } });
      const reworkBefore = (173.3333 * 0.1 * 20) / 60; // 5,78 h
      expect(r.rework?.hoursBefore).toBeCloseTo(reworkBefore, 3);
      expect(r.rework?.hoursReturned).toBeCloseTo(reworkBefore * 0.801, 3);
      expect(r.hoursBefore).toBeCloseTo(r.stepsHoursMonth + reworkBefore, 3);
      expect(r.hoursReturned).toBeGreaterThan(ok(base).hoursReturned);
    });

    it("sem os dois números não há retrabalho", () => {
      expect(ok({ ...base, rework: { percent: 0.1, minutes: null } }).rework).toBeNull();
      expect(ok({ ...base, rework: { percent: null, minutes: null } }).rework).toBeNull();
      expect(ok({ ...base, rework: { percent: 0, minutes: 30 } }).rework).toBeNull();
    });
  });

  describe("entradas ruins viram erro com campo e motivo, nunca ajuste silencioso", () => {
    it("vazio quando falta o tempo", () => {
      expect(calculate({ ...base, runs: null })).toEqual({ status: "empty" });
      expect(calculate({ ...base, steps: [] })).toEqual({ status: "empty" });
      expect(calculate({ ...base, steps: [step(null, "dados")] })).toEqual({ status: "empty" });
    });

    it.each([
      [{ runs: Number.NaN }, { field: "runs", reason: "nan" }],
      [{ runs: Number.POSITIVE_INFINITY }, { field: "runs", reason: "nan" }],
      [{ runs: -1 }, { field: "runs", reason: "negative" }],
      [{ runs: 0 }, { field: "runs", reason: "zero" }],
      [{ runs: 1_000_000, period: "mes" }, { field: "runs", reason: "too_large" }],
      [{ steps: [step(Number.NaN, "dados")] }, { field: "minutes", reason: "nan", step: 0 }],
      [{ steps: [step(-3, "dados")] }, { field: "minutes", reason: "negative", step: 0 }],
      [{ steps: [step(0, "dados")] }, { field: "minutes", reason: "zero", step: 0 }],
      [{ steps: [step(K.MAX_MINUTES_STEP + 1, "dados")] }, { field: "minutes", reason: "too_large", step: 0 }],
      [{ steps: [step(2, "dados", 1.5)] }, { field: "coverage", reason: "too_large", step: 0 }],
      [{ steps: [step(2, "dados", -0.1)] }, { field: "coverage", reason: "negative", step: 0 }],
      [{ steps: [step(2, "dados", Number.NaN)] }, { field: "coverage", reason: "nan", step: 0 }],
      [{ runs: 90_000, period: "mes", steps: [step(600, "dados")] }, { field: "runs", reason: "too_large" }],
      [{ hourlyBRL: -1 }, { field: "hourlyBRL", reason: "negative" }],
      [{ hourlyBRL: K.MAX_BRL_HOUR + 1 }, { field: "hourlyBRL", reason: "too_large" }],
      [{ hourlyBRL: Number.NaN }, { field: "hourlyBRL", reason: "nan" }],
      [{ exceptions: 0.6 }, { field: "exceptions", reason: "too_large" }],
      [{ exceptions: -0.1 }, { field: "exceptions", reason: "negative" }],
      [{ exceptions: Number.NaN }, { field: "exceptions", reason: "nan" }],
      [{ rework: { percent: 1.2, minutes: 10 } }, { field: "reworkPercent", reason: "too_large" }],
      [{ rework: { percent: -0.1, minutes: 10 } }, { field: "reworkPercent", reason: "negative" }],
      [{ rework: { percent: 0.1, minutes: -5 } }, { field: "reworkMinutes", reason: "negative" }],
      [{ rework: { percent: 0.1, minutes: K.MAX_MINUTES_STEP + 1 } }, { field: "reworkMinutes", reason: "too_large" }],
    ] as const)("rejeita %j", (patch, expected) => {
      expect(calculate({ ...base, ...patch })).toEqual({ status: "invalid", ...expected });
    });

    it("erro de passo diz qual passo é", () => {
      const steps = [step(2, "dados"), step(-3, "dados"), step(4, "dados")];
      expect(calculate({ ...base, steps })).toEqual({ status: "invalid", field: "minutes", reason: "negative", step: 1 });
    });

    it("passos demais", () => {
      const many = Array.from({ length: K.MAX_STEPS + 1 }, () => step(1, "dados"));
      expect(calculate({ ...base, steps: many })).toEqual({ status: "invalid", field: "minutes", reason: "too_large", step: K.MAX_STEPS });
    });
  });

  describe("tetos", () => {
    it("aceita exatamente os tetos", () => {
      expect(calculate({ ...base, steps: [step(K.MAX_MINUTES_STEP, "dados")] }).status).toBe("ok");
      expect(calculate({ ...base, runs: K.MAX_RUNS_MONTH, period: "mes", steps: [step(60, "dados")] }).status).toBe("ok");
      expect(calculate({ ...base, steps: Array.from({ length: K.MAX_STEPS }, () => step(1, "dados")) }).status).toBe("ok");
      expect(calculate({ ...base, exceptions: 0 }).status).toBe("ok");
      expect(calculate({ ...base, exceptions: K.MAX_EXCEPTIONS }).status).toBe("ok");
      expect(calculate({ ...base, hourlyBRL: K.MAX_BRL_HOUR }).status).toBe("ok");
      expect(calculate({ ...base, hourlyBRL: 0 }).status).toBe("ok");
      expect(calculate({ ...base, steps: [step(5, "dados", 0)] }).status).toBe("ok");
      expect(calculate({ ...base, steps: [step(5, "dados", 1)] }).status).toBe("ok");
      expect(calculate({ ...base, rework: { percent: 1, minutes: K.MAX_MINUTES_STEP } }).status).toBe("ok");
    });

    it("valores enormes mas válidos não viram NaN", () => {
      const r = ok({
        runs: K.MAX_RUNS_MONTH,
        period: "mes",
        steps: [step(60, "dados")],
        hourlyBRL: K.MAX_BRL_HOUR,
        exceptions: 0,
        rework: { percent: 1, minutes: 60 },
      });
      for (const value of [r.hoursBefore, r.hoursReturned, r.hoursAfter, r.share, r.fte, r.brlMonth, r.brlYear]) {
        expect(Number.isFinite(value ?? Number.NaN)).toBe(true);
      }
      expect(r.share).toBeGreaterThan(0);
      expect(r.share).toBeLessThanOrEqual(1);
    });
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
    expect(hourlyFromSalary(1000, -0.1)).toBeNull();
  });
});
