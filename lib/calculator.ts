/**
 * Conta da calculadora. Pura: sem React, sem Intl, sem arredondamento
 * (quem exibe arredonda). Nada é ajustado em silêncio: entrada ruim vira
 * `invalid` com o campo e o motivo.
 */
export const K = {
  /** Conservador: 22 inflaria. */
  WORKDAYS_MONTH: 21,
  WEEKS_MONTH: 52 / 12,
  /** 44 h/semana. Único ponto de mudança se a PEC das 40 h passar. */
  LEGAL_HOURS_MONTH: 220,
  MAX_H_PERSON_MONTH: 220,
  MAX_PEOPLE: 1000,
  MAX_BRL_HOUR: 10_000,
  EXPECTED: 0.8,
  OPTIMISTIC: 0.9,
  /** Regra de bolso (contabilidades): CLT geral +70%, Simples +50%. Editável. */
  ENCARGOS: { clt: 0.7, simples: 0.5 },
} as const;

export type TimeUnit = "min_dia" | "h_semana" | "h_mes";

export type CalcInput = {
  /** Só ecoa na tela e no WhatsApp; não entra na conta. */
  routine: string;
  /** Na unidade `unit`, por pessoa. `null` = campo vazio. */
  amount: number | null;
  unit: TimeUnit;
  /** Inteiro >= 1. */
  people: number;
  /** `null` = sem custo informado: só horas. */
  hourlyBRL: number | null;
  /** 0..1 */
  expected: number;
  /** expected..1 */
  optimistic: number;
};

export type Scenario = {
  pct: number;
  hours: number;
  brlMonth: number | null;
  brlYear: number | null;
};

export type CalcField = "amount" | "people" | "hourlyBRL" | "expected" | "optimistic";
export type CalcReason = "nan" | "negative" | "zero" | "too_large" | "order";

export type CalcResult =
  | { status: "empty" }
  | { status: "invalid"; field: CalcField; reason: CalcReason }
  | {
      status: "ok";
      perPersonMonth: number;
      totalMonth: number;
      expected: Scenario;
      optimistic: Scenario;
    };

/** Salário mensal → custo da hora: salário × (1 + encargos) ÷ 220. */
export function hourlyFromSalary(salary: number, encargos: number): number | null {
  if (!Number.isFinite(salary) || !Number.isFinite(encargos) || salary <= 0 || encargos < 0) return null;
  return (salary * (1 + encargos)) / K.LEGAL_HOURS_MONTH;
}

export function hoursPerPersonMonth(amount: number, unit: TimeUnit): number {
  switch (unit) {
    case "min_dia":
      return (amount / 60) * K.WORKDAYS_MONTH;
    case "h_semana":
      return amount * K.WEEKS_MONTH;
    case "h_mes":
      return amount;
  }
}

function invalid(field: CalcField, reason: CalcReason): CalcResult {
  return { status: "invalid", field, reason };
}

function scenario(totalMonth: number, pct: number, hourly: number | null): Scenario {
  const hours = totalMonth * pct;
  const brlMonth = hourly === null ? null : hours * hourly;
  return { pct, hours, brlMonth, brlYear: brlMonth === null ? null : brlMonth * 12 };
}

export function calculate(i: CalcInput): CalcResult {
  if (i.amount === null) return { status: "empty" };
  if (!Number.isFinite(i.amount)) return invalid("amount", "nan");
  if (i.amount < 0) return invalid("amount", "negative");
  if (i.amount === 0) return invalid("amount", "zero");

  if (!Number.isFinite(i.people) || !Number.isInteger(i.people)) return invalid("people", "nan");
  if (i.people < 1) return invalid("people", "zero");
  if (i.people > K.MAX_PEOPLE) return invalid("people", "too_large");

  if (i.hourlyBRL !== null) {
    if (!Number.isFinite(i.hourlyBRL)) return invalid("hourlyBRL", "nan");
    if (i.hourlyBRL < 0) return invalid("hourlyBRL", "negative");
    if (i.hourlyBRL > K.MAX_BRL_HOUR) return invalid("hourlyBRL", "too_large");
  }

  if (!Number.isFinite(i.expected)) return invalid("expected", "nan");
  if (i.expected <= 0) return invalid("expected", "zero");
  if (i.expected > 1) return invalid("expected", "too_large");
  if (!Number.isFinite(i.optimistic)) return invalid("optimistic", "nan");
  if (i.optimistic < i.expected) return invalid("optimistic", "order");
  if (i.optimistic > 1) return invalid("optimistic", "too_large");

  const perPersonMonth = hoursPerPersonMonth(i.amount, i.unit);
  if (perPersonMonth > K.MAX_H_PERSON_MONTH) return invalid("amount", "too_large");

  const totalMonth = perPersonMonth * i.people;
  return {
    status: "ok",
    perPersonMonth,
    totalMonth,
    expected: scenario(totalMonth, i.expected, i.hourlyBRL),
    optimistic: scenario(totalMonth, i.optimistic, i.hourlyBRL),
  };
}
