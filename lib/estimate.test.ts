import { describe, expect, it } from "vitest";
import { STEP_KINDS, type Period } from "./calculator";
import {
  DEFAULT_ESTIMATE,
  HOURLY_STOPS,
  MINUTE_STOPS,
  PERIODS,
  RUN_STOPS,
  resultOf,
  sanitize,
  snap,
  spokenMinutes,
  spokenSummary,
  type Estimate,
} from "./estimate";

describe("snap", () => {
  it.each([
    [MINUTE_STOPS, 30, 30],
    [MINUTE_STOPS, 31, 30],
    [MINUTE_STOPS, 38, 45],
    [MINUTE_STOPS, 0, 1],
    [MINUTE_STOPS, 100_000, 480],
    [RUN_STOPS, 7, 6],
    [RUN_STOPS, 500, 100],
  ])("%j: %d encaixa em %d", (stops, n, out) => expect(snap(stops, n)).toBe(out));

  it("recusa o que não é número finito", () => {
    expect(snap(MINUTE_STOPS, Number.NaN)).toBeNull();
    expect(snap(MINUTE_STOPS, Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("resultOf", () => {
  it("o padrão já tem resultado: 30 min, 5 por semana, copiar", () => {
    const result = resultOf(DEFAULT_ESTIMATE);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    // 5 × 52/12 = 21,67 execuções por mês; 30 min cada
    expect(result.runsMonth).toBeCloseTo(21.667, 3);
    expect(result.hoursBefore).toBeCloseTo(10.833, 3);
    expect(result.low.hoursReturned).toBeCloseTo(10.833 * 0.69, 2);
    expect(result.high.hoursReturned).toBeCloseTo(10.833 * 0.93, 2);
    expect(result.low.brlMonth).toBeNull();
  });

  it("o custo da hora vira reais por mês nas duas pontas", () => {
    const result = resultOf({ ...DEFAULT_ESTIMATE, hourlyBRL: 40 });
    if (result.status !== "ok") throw new Error("esperava ok");
    expect(result.low.brlMonth).toBeCloseTo(result.low.hoursReturned * 40, 6);
    expect(result.high.brlMonth).toBeCloseTo(result.high.hoursReturned * 40, 6);
  });

  it("analisar e conversar não têm piso: o ganho comprovado é zero", () => {
    for (const kind of ["decidir", "pessoas"] as const) {
      const result = resultOf({ ...DEFAULT_ESTIMATE, kind });
      if (result.status !== "ok") throw new Error("esperava ok");
      expect(result.low.hoursReturned).toBe(0);
      expect(result.high.hoursReturned).toBeGreaterThan(0);
    }
  });

  it("toda combinação de degraus dá faixa finita, com piso ≤ teto ≤ hoje", () => {
    let count = 0;
    for (const kind of STEP_KINDS.map((k) => k.id)) {
      for (const minutes of MINUTE_STOPS) {
        for (const runs of RUN_STOPS) {
          for (const period of PERIODS.map((p) => p.id)) {
            for (const hourlyBRL of [null, ...HOURLY_STOPS]) {
              const result = resultOf({ kind, minutes, runs, period, hourlyBRL });
              count += 1;
              if (result.status !== "ok") throw new Error(`recusou ${JSON.stringify({ kind, minutes, runs, period, hourlyBRL })}`);
              expect(Number.isFinite(result.hoursBefore)).toBe(true);
              expect(result.low.hoursReturned).toBeGreaterThanOrEqual(0);
              expect(result.low.hoursReturned).toBeLessThanOrEqual(result.high.hoursReturned);
              expect(result.high.hoursReturned).toBeLessThanOrEqual(result.hoursBefore);
              if (hourlyBRL !== null) expect(result.low.brlMonth).toBeCloseTo(result.low.hoursReturned * hourlyBRL, 6);
            }
          }
        }
      }
    }
    expect(count).toBe(6 * MINUTE_STOPS.length * RUN_STOPS.length * 3 * (HOURLY_STOPS.length + 1));
  });
});

describe("sanitize", () => {
  const stored = (over: Record<string, unknown> = {}) => ({ v: 4, estimate: { ...DEFAULT_ESTIMATE, ...over } });

  it("volta o que foi guardado", () => {
    const estimate: Estimate = { kind: "conferir", minutes: 90, runs: 20, period: "dia", hourlyBRL: 60 };
    expect(sanitize({ v: 4, estimate })).toEqual(estimate);
  });

  it("valor fora do degrau encaixa no mais próximo", () => {
    expect(sanitize(stored({ minutes: 31, runs: 7 }))).toEqual({ ...DEFAULT_ESTIMATE, minutes: 30, runs: 6 });
  });

  it.each([
    ["nulo", null],
    ["texto", "oi"],
    ["outra versão", { v: 3, answers: {} }],
    ["sem estimate", { v: 4 }],
    ["tipo desconhecido", stored({ kind: "voar" })],
    ["período desconhecido", stored({ period: "ano" })],
    ["minutos NaN", stored({ minutes: Number.NaN })],
    ["minutos texto", stored({ minutes: "30" })],
    ["custo fora dos degraus", stored({ hourlyBRL: 55 })],
    ["custo negativo", stored({ hourlyBRL: -40 })],
  ])("descarta estado quebrado: %s", (_name, raw) => expect(sanitize(raw)).toBeNull());
});

describe("spokenSummary", () => {
  it("lê a faixa em horas por mês", () => {
    const text = spokenSummary(DEFAULT_ESTIMATE);
    expect(text).toMatch(/Devolve de 7,5 a 10 horas por mês, 69% a 93% do tempo/);
    expect(text).toMatch(/Hoje são 11 horas/);
  });

  it("diz que o passo pede gente quando o piso é zero", () => {
    expect(spokenSummary({ ...DEFAULT_ESTIMATE, kind: "decidir" })).toMatch(/pede gente/);
  });

  it("inclui os reais quando há custo", () => {
    expect(spokenSummary({ ...DEFAULT_ESTIMATE, hourlyBRL: 40 })).toMatch(/De R\$ [\d.]+ a R\$ [\d.]+ por mês/);
  });
});

describe("spokenMinutes", () => {
  it.each([
    [1, "1 minuto"],
    [30, "30 minutos"],
    [60, "1 hora"],
    [90, "1 hora e 30 minutos"],
    [120, "2 horas"],
    [480, "8 horas"],
  ])("%d → %s", (min, out) => expect(spokenMinutes(min)).toBe(out));
});

describe("períodos", () => {
  it("são os três do cálculo", () => {
    const ids: Period[] = PERIODS.map((p) => p.id);
    expect(ids).toEqual(["dia", "semana", "mes"]);
  });
});
