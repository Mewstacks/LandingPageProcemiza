import { describe, expect, it } from "vitest";
import {
  K,
  STEP_KINDS,
  calculate,
  hourlyFromSalary,
  rangeOf,
  runsPerMonth,
  type CalcInput,
  type Step,
} from "./calculator";

const step = (minutes: number, kind: Step["kind"]): Step => ({ minutes, kind });

/** Conferir notas: 40 por semana, 4 passos de 10 minutos no total, R$ 27 a hora. */
const base: CalcInput = {
  runs: 40,
  period: "semana",
  steps: [step(2, "buscar"), step(4, "conferir"), step(3, "dados"), step(1, "avisar")],
  hourlyBRL: 27,
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
      // por execução, piso: 2×0,64 + 4×0,69 + 3×0,69 + 1×0,69 = 6,8 min; teto: 10 × 0,93 = 9,3 min
      expect(r.perRunMinutes).toBe(10);
      expect(r.low.perRunSaved).toBeCloseTo(6.8, 6);
      expect(r.high.perRunSaved).toBeCloseTo(9.3, 6);
      // 40 × 52/12 = 173,33 execuções por mês
      expect(r.runsMonth).toBeCloseTo(173.3333, 4);
      expect(r.hoursBefore).toBeCloseTo(28.8889, 4);
      expect(r.low.hoursReturned).toBeCloseTo(19.6444, 4);
      expect(r.high.hoursReturned).toBeCloseTo(26.8667, 4);
      expect(r.low.hoursAfter).toBeCloseTo(9.2444, 4);
      expect(r.high.hoursAfter).toBeCloseTo(2.0222, 4);
      expect(r.low.brlMonth).toBeCloseTo(530.4, 3);
      expect(r.high.brlMonth).toBeCloseTo(725.4, 3);
      expect(r.low.brlYear).toBeCloseTo(6364.8, 2);
      expect(r.high.brlYear).toBeCloseTo(8704.8, 2);
      expect(r.low.fte).toBeCloseTo(19.6444 / 220, 6);
    });

    it("30 pedidos por dia no WhatsApp, 4 passos, R$ 40/h", () => {
      const r = ok({
        ...base,
        runs: 30,
        period: "dia",
        hourlyBRL: 40,
        steps: [step(1, "decidir"), step(2, "buscar"), step(3, "dados"), step(2, "avisar")],
      });
      // 30 × 21 = 630 execuções; piso: 0 + 1,28 + 2,07 + 1,38 = 4,73 de 8; teto: 0,18 + 1,86 + 2,79 + 1,86 = 6,69
      expect(r.runsMonth).toBe(630);
      expect(r.perRunMinutes).toBe(8);
      expect(r.low.perRunSaved).toBeCloseTo(4.73, 6);
      expect(r.high.perRunSaved).toBeCloseTo(6.69, 6);
      expect(r.hoursBefore).toBeCloseTo(84, 6);
      expect(r.low.hoursReturned).toBeCloseTo(49.665, 4);
      expect(r.high.hoursReturned).toBeCloseTo(70.245, 4);
      expect(r.low.share).toBeCloseTo(0.59125, 6);
      expect(r.high.share).toBeCloseTo(0.83625, 6);
      expect(r.low.brlMonth).toBeCloseTo(1986.6, 3);
      expect(r.high.brlYear).toBeCloseTo(33717.6, 2);
    });

    it("relatório mensal de 12 h: 1 por mês, 5 passos", () => {
      const r = ok({
        runs: 1,
        period: "mes",
        hourlyBRL: null,
        steps: [step(180, "buscar"), step(240, "dados"), step(120, "conferir"), step(180, "decidir"), step(20, "avisar")],
      });
      expect(r.hoursBefore).toBeCloseTo(12.3333, 4);
      expect(r.low.hoursReturned).toBeCloseTo(6.29, 4);
      expect(r.high.hoursReturned).toBeCloseTo(9.22, 4);
    });

    it("R$ 3.500 de salário: CLT 66% e Simples 33% (fixtures da especificação)", () => {
      const clt = hourlyFromSalary(3500, K.ENCARGOS.clt) as number;
      const simples = hourlyFromSalary(3500, K.ENCARGOS.simples) as number;
      expect(clt).toBeCloseTo(26.4091, 4);
      expect(simples).toBeCloseTo(21.1591, 4);
      expect(ok({ ...base, hourlyBRL: clt }).low.brlMonth).toBeCloseTo(518.79, 2);
      expect(ok({ ...base, hourlyBRL: clt }).high.brlMonth).toBeCloseTo(709.52, 2);
      expect(ok({ ...base, hourlyBRL: simples }).low.brlMonth).toBeCloseTo(415.66, 2);
      expect(ok({ ...base, hourlyBRL: simples }).high.brlMonth).toBeCloseTo(568.47, 2);
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
    it("cada passo volta a faixa do seu tipo sobre o seu tempo", () => {
      const r = ok(base);
      expect(r.steps.map((s) => s.minutes)).toEqual([2, 4, 3, 1]);
      expect(r.steps[0].floor).toBe(0.64);
      expect(r.steps[0].ceiling).toBe(0.93);
      expect(r.steps[0].savedLow).toBeCloseTo(2 * 0.64);
      expect(r.steps[0].savedHigh).toBeCloseTo(2 * 0.93);
      expect(r.steps[1].savedLow).toBeCloseTo(4 * 0.69);
      expect(r.steps[1].savedHigh).toBeCloseTo(4 * 0.93);
    });

    it("horas e reais do mês fecham entre si, nas duas pontas", () => {
      const r = ok(base);
      for (const s of [r.low, r.high]) {
        expect(s.hoursAfter).toBeCloseTo(r.hoursBefore - s.hoursReturned);
        expect(s.brlMonth).toBeCloseTo(s.hoursReturned * 27);
        expect(s.brlYear).toBeCloseTo((s.brlMonth as number) * 12);
        expect(s.fte).toBeCloseTo(s.hoursReturned / 220);
        expect(s.share).toBeCloseTo(s.hoursReturned / r.hoursBefore);
      }
      expect(r.low.share).toBeCloseTo(0.68, 6);
      expect(r.high.share).toBeCloseTo(0.93, 6);
    });

    it("o piso nunca passa do teto e o teto nunca passa de 93% do tempo", () => {
      for (const a of STEP_KINDS) {
        for (const b of STEP_KINDS) {
          const r = ok({ ...base, steps: [step(7, a.id), step(13, b.id)] });
          expect(r.low.hoursReturned).toBeLessThanOrEqual(r.high.hoursReturned);
          expect(r.high.share).toBeLessThanOrEqual(0.93 + 1e-12);
          expect(r.low.share).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it("a parte devolvida muda com a composição do processo", () => {
      const repetitive = ok({ ...base, steps: [step(5, "dados"), step(5, "avisar")] });
      const human = ok({ ...base, steps: [step(5, "decidir"), step(5, "pessoas")] });
      expect(repetitive.low.share).toBeGreaterThan(0.6);
      expect(human.high.share).toBeLessThan(0.2);
      expect(human.low.share).toBe(0);
    });

    it("passo que não automatiza no piso (julgamento) é válido e devolve zero nele", () => {
      const r = ok({ ...base, steps: [step(5, "decidir")] });
      expect(r.low.hoursReturned).toBe(0);
      expect(r.low.share).toBe(0);
      expect(r.low.brlMonth).toBe(0);
      expect(r.high.hoursReturned).toBeGreaterThan(0);
    });

    it("sem custo/hora devolve só horas", () => {
      const r = ok({ ...base, hourlyBRL: null });
      for (const s of [r.low, r.high]) {
        expect(s.brlMonth).toBeNull();
        expect(s.brlYear).toBeNull();
      }
      expect(r.low.hoursReturned).toBeCloseTo(19.6444, 4);
    });

    it("todo tipo de passo tem rótulo curto único e fonte", () => {
      expect(new Set(STEP_KINDS.map((kind) => kind.short)).size).toBe(STEP_KINDS.length);
      expect(new Set(STEP_KINDS.map((kind) => kind.id)).size).toBe(STEP_KINDS.length);
      for (const kind of STEP_KINDS) {
        expect(kind.short.length).toBeLessThanOrEqual(10);
        expect(kind.source).toMatch(/MGI 2017/);
      }
    });

    it("todo tipo de passo tem faixa entre 0 e 1, com piso até o teto", () => {
      for (const kind of STEP_KINDS) {
        expect(kind.floor).toBeGreaterThanOrEqual(0);
        expect(kind.ceiling).toBeLessThanOrEqual(1);
        expect(kind.floor).toBeLessThanOrEqual(kind.ceiling);
      }
      expect(rangeOf("dados").floor).toBeGreaterThan(rangeOf("buscar").floor - 1e-12);
      expect(rangeOf("buscar").floor).toBeGreaterThan(rangeOf("decidir").floor);
      expect(rangeOf("decidir").ceiling).toBeLessThan(rangeOf("pessoas").ceiling);
    });

    it("tipo desconhecido (estado velho) não automatiza nada em vez de quebrar", () => {
      expect(rangeOf("outro" as never)).toEqual({ floor: 0, ceiling: 0 });
    });
  });

  describe("entradas ruins viram erro com campo e motivo, nunca ajuste silencioso", () => {
    it("vazio quando falta o tempo", () => {
      expect(calculate({ ...base, runs: null })).toEqual({ status: "empty" });
      expect(calculate({ ...base, steps: [] })).toEqual({ status: "empty" });
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
      [{ steps: [step(K.MIN_MINUTES_STEP / 2, "dados")] }, { field: "minutes", reason: "too_small", step: 0 }],
      [{ steps: [step(K.MAX_MINUTES_STEP + 1, "dados")] }, { field: "minutes", reason: "too_large", step: 0 }],
      [{ runs: 90_000, period: "mes", steps: [step(600, "dados")] }, { field: "runs", reason: "too_large" }],
      [{ hourlyBRL: -1 }, { field: "hourlyBRL", reason: "negative" }],
      [{ hourlyBRL: K.MAX_BRL_HOUR + 1 }, { field: "hourlyBRL", reason: "too_large" }],
      [{ hourlyBRL: Number.NaN }, { field: "hourlyBRL", reason: "nan" }],
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
      expect(calculate({ ...base, steps: [step(K.MIN_MINUTES_STEP, "dados")] }).status).toBe("ok");
      expect(calculate({ ...base, runs: K.MAX_RUNS_MONTH, period: "mes", steps: [step(60, "dados")] }).status).toBe("ok");
      expect(calculate({ ...base, steps: Array.from({ length: K.MAX_STEPS }, () => step(1, "dados")) }).status).toBe("ok");
      expect(calculate({ ...base, hourlyBRL: K.MAX_BRL_HOUR }).status).toBe("ok");
      expect(calculate({ ...base, hourlyBRL: 0 }).status).toBe("ok");
    });

    it("valores enormes mas válidos não viram NaN", () => {
      const r = ok({ runs: K.MAX_RUNS_MONTH, period: "mes", steps: [step(60, "dados")], hourlyBRL: K.MAX_BRL_HOUR });
      for (const s of [r.low, r.high]) {
        for (const value of [r.hoursBefore, s.hoursReturned, s.hoursAfter, s.share, s.fte, s.brlMonth, s.brlYear]) {
          expect(Number.isFinite(value ?? Number.NaN)).toBe(true);
        }
        expect(s.share).toBeGreaterThan(0);
        expect(s.share).toBeLessThanOrEqual(1);
      }
    });
  });
});

describe("hourlyFromSalary", () => {
  it("R$ 3.000 CLT (+66%) / 220", () => {
    expect(hourlyFromSalary(3000, K.ENCARGOS.clt)).toBeCloseTo(22.6364, 3);
  });
  it("Simples (+33%)", () => {
    expect(hourlyFromSalary(3500, K.ENCARGOS.simples)).toBeCloseTo(21.1591, 3);
  });
  it("entrada inválida devolve null", () => {
    expect(hourlyFromSalary(0, 0.7)).toBeNull();
    expect(hourlyFromSalary(-10, 0.7)).toBeNull();
    expect(hourlyFromSalary(Number.NaN, 0.7)).toBeNull();
    expect(hourlyFromSalary(1000, -0.1)).toBeNull();
  });
});

describe("encargos", () => {
  // Cada parcela vem da lei (FGTS 8%, INSS patronal 20%, RAT 1% a 3%) ou da provisão de 13º e férias.
  const provision = 0.0833 + 0.1111;
  const onBase = 1 + provision;

  it("CLT: composição entre 61% e 64%, e o valor usado cobre a rescisão sem passar de 3 pontos", () => {
    for (const rat of [0.01, 0.02, 0.03]) {
      const total = provision + 0.08 * onBase + 0.2 * onBase + rat * onBase + 0.058 * onBase;
      expect(total).toBeGreaterThan(0.61);
      expect(total).toBeLessThan(0.64);
      expect(K.ENCARGOS.clt - total).toBeGreaterThan(0);
      expect(K.ENCARGOS.clt - total).toBeLessThan(0.06);
    }
  });

  it("Simples: provisão mais FGTS dá 29%, e o valor usado cobre a rescisão", () => {
    const total = provision + 0.08 * onBase;
    expect(total).toBeCloseTo(0.29, 2);
    expect(K.ENCARGOS.simples - total).toBeGreaterThan(0);
    expect(K.ENCARGOS.simples - total).toBeLessThan(0.06);
  });
});
