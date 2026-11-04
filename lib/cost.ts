/**
 * Custo da hora de quem faz a rotina, em reais. Puro: sem React, sem Intl.
 *
 * Custo anual ÷ horas produtivas do ano (não ÷ 220 h pagas, que inclui férias, feriados e descanso
 * semanal e subestima a hora em cerca de 18% a 21%). Fontes primárias e conta em
 * `docs/specs/calculadora-v5.md`. Constantes com vigência: a jornada muda com a EC 141/2026.
 */
export const COST = {
  /** Data em que as constantes foram conferidas. */
  VIGENCIA: "2026-11",
  FGTS: 0.08,
  /** Multa do FGTS (40% do saldo), provisionada como se todo contrato fosse encerrado. */
  MULTA_FGTS: 0.4,
  /** 12 salários + 13º + 1/3 de férias (Lei 8.036 art. 15, CLT art. 130). */
  SALARIOS_ANO: 12 + 1 + 1 / 3,
  /** Encargo patronal sobre a folha: Simples (anexos I, II, III, V) 0; Presumido/Real INSS 20% + RAT 2% + Terceiros 5,8%. */
  PATRONAL: { simples: 0, presumido: 0.2 + 0.02 + 0.058 },
  HORAS_SEMANA: 44,
  DIAS_SEMANA: 5,
  FERIAS_DIAS: 30,
  FERIADOS_UTEIS: 9,
  MAX_SALARY: 200_000,
  MAX_BENEFITS: 50_000,
  MAX_MONTHLY_COST: 2_000_000,
} as const;

export type Regime = "simples" | "presumido";

export type Pay =
  | { mode: "bruto"; salary: number; regime: Regime; /** VT, VR, plano: R$ por mês, opcional */ benefits: number }
  | { mode: "custo"; monthly: number };

/** Horas realmente trabalhadas no ano: semanas do ano menos férias e feriados úteis. */
export function productiveHoursYear(): number {
  const weeks = 365 / 7 - COST.FERIAS_DIAS / 7 - COST.FERIADOS_UTEIS / COST.DIAS_SEMANA;
  return COST.HORAS_SEMANA * weeks;
}

export function productiveHoursMonth(): number {
  return productiveHoursYear() / 12;
}

/** `null` quando a entrada não é um valor possível. */
export function annualCost(pay: Pay): number | null {
  if (pay.mode === "custo") {
    const m = pay.monthly;
    return Number.isFinite(m) && m > 0 && m <= COST.MAX_MONTHLY_COST ? m * 12 : null;
  }
  const { salary, regime, benefits } = pay;
  if (!Number.isFinite(salary) || salary <= 0 || salary > COST.MAX_SALARY) return null;
  if (!Number.isFinite(benefits) || benefits < 0 || benefits > COST.MAX_BENEFITS) return null;
  const base = salary * COST.SALARIOS_ANO;
  const charges = base * (COST.FGTS + COST.PATRONAL[regime]);
  const fine = base * COST.FGTS * COST.MULTA_FGTS;
  return base + charges + fine + benefits * 12;
}

export function hourlyCost(pay: Pay): number | null {
  const annual = annualCost(pay);
  return annual === null ? null : annual / productiveHoursYear();
}

/** Custo mensal da empresa por R$ 1 de salário bruto, sem benefícios. Só para o relatório explicar. */
export function multiplier(regime: Regime): number {
  return (COST.SALARIOS_ANO * (1 + COST.FGTS + COST.PATRONAL[regime] + COST.FGTS * COST.MULTA_FGTS)) / 12;
}
