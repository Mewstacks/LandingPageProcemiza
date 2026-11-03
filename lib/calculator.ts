/**
 * Conta da calculadora. Pura: sem React, sem Intl, sem arredondamento (quem exibe arredonda).
 * Nada é ajustado em silêncio: entrada ruim vira `invalid` com o campo e o motivo.
 *
 * O ganho sai do processo que a pessoa descreve: cada passo tem o seu tempo e o seu tipo de
 * trabalho, e cada tipo tem uma faixa (piso e teto) do que dá para automatizar, com fonte. A
 * resposta é sempre uma faixa, nunca um número único.
 *
 * O que a conta NÃO desconta: custo de implantar e manter a automação, custo de interrupção e
 * ganhos de qualidade. Horas devolvidas só viram dinheiro se forem reaproveitadas.
 */
export const K = {
  /** Conservador: 22 inflaria. */
  WORKDAYS_MONTH: 21,
  WEEKS_MONTH: 52 / 12,
  /** 44 h/semana (CF, art. 7º, XIII). Único ponto de mudança se a PEC das 40 h passar. */
  LEGAL_HOURS_MONTH: 220,
  MAX_STEPS: 10,
  /** 30 segundos: abaixo disso o número é erro de digitação, não rotina. */
  MIN_MINUTES_STEP: 0.5,
  MAX_MINUTES_STEP: 600,
  MAX_RUNS_MONTH: 100_000,
  MAX_HOURS_MONTH: 100_000,
  MAX_BRL_HOUR: 10_000,
  MAX_SALARY: 200_000,
  /**
   * Encargos sobre o salário, com provisão de 13º e férias, FGTS 8%, e no CLT INSS patronal 20%,
   * RAT 1% a 3% e terceiros ~5,8%: 61% a 63% mais ~3% de rescisão = ~66%. No Simples (anexos I, II,
   * III e V) a patronal e os terceiros saem da folha: 29% mais a mesma provisão = ~33%.
   */
  ENCARGOS: { clt: 0.66, simples: 0.33 },
  /** Quanto o tempo informado pode estar errado para mais, na linha de sensibilidade. */
  SENSITIVITY: 0.25,
} as const;

export type Period = "dia" | "semana" | "mes";

/**
 * Tipo de trabalho do passo e a faixa do que dá para automatizar quando o dado é digital e a regra
 * é clara. `floor` é o potencial técnico médio da categoria (McKinsey Global Institute, jan/2017,
 * Exhibit 8: processar dados 69%, coletar dados 64%); `ceiling` é o que um processo estruturado
 * entregou sem humano depois de melhoria contínua (Xchanging, LSE 2015: 93%, já líquido das
 * exceções). Julgamento e conversa: piso 0 (sem ganho realizado comprovado), teto = potencial MGI
 * (aplicar expertise 18%, interagir com stakeholders 20%).
 * "Avisar" entra em processar dados por classificação nossa.
 */
export type StepKind = "dados" | "conferir" | "avisar" | "buscar" | "decidir" | "pessoas";

export const STEP_KINDS: readonly { id: StepKind; label: string; short: string; floor: number; ceiling: number; source: string }[] = [
  { id: "dados", label: "Copiar ou digitar", short: "Copiar", floor: 0.69, ceiling: 0.93, source: "MGI 2017 · Xchanging 2015" },
  { id: "conferir", label: "Conferir com regra", short: "Conferir", floor: 0.69, ceiling: 0.93, source: "MGI 2017 · Xchanging 2015" },
  { id: "avisar", label: "Avisar ou enviar", short: "Avisar", floor: 0.69, ceiling: 0.93, source: "MGI 2017 · Xchanging 2015" },
  { id: "buscar", label: "Procurar ou juntar", short: "Procurar", floor: 0.64, ceiling: 0.93, source: "MGI 2017 · Xchanging 2015" },
  { id: "decidir", label: "Analisar ou decidir", short: "Analisar", floor: 0, ceiling: 0.18, source: "MGI 2017" },
  { id: "pessoas", label: "Falar com gente", short: "Conversar", floor: 0, ceiling: 0.2, source: "MGI 2017" },
];

/** Tipo desconhecido (estado velho do storage) não automatiza nada, em vez de quebrar a conta. */
export function rangeOf(kind: StepKind): { floor: number; ceiling: number } {
  const found = STEP_KINDS.find((k) => k.id === kind);
  return found ? { floor: found.floor, ceiling: found.ceiling } : { floor: 0, ceiling: 0 };
}

export type Step = {
  /** Minutos por execução, só o tempo de mão na tarefa. */
  minutes: number;
  kind: StepKind;
};

export type CalcInput = {
  /** Quantas vezes o processo roda em `period`. `null` = vazio. */
  runs: number | null;
  period: Period;
  steps: readonly Step[];
  /** `null` = sem custo informado: só horas. */
  hourlyBRL: number | null;
};

export type CalcField = "runs" | "minutes" | "hourlyBRL";
export type CalcReason = "nan" | "negative" | "zero" | "too_small" | "too_large";

export type StepResult = {
  minutes: number;
  kind: StepKind;
  floor: number;
  ceiling: number;
  /** Minutos por execução que voltam no piso e no teto. */
  savedLow: number;
  savedHigh: number;
};

/** Uma ponta da faixa. */
export type Scenario = {
  /** Minutos por execução que voltam. */
  perRunSaved: number;
  hoursReturned: number;
  hoursAfter: number;
  /** Parte do tempo que volta, 0..1. Sai da conta; nunca é digitada. */
  share: number;
  /** Pessoas equivalentes (horas devolvidas ÷ 220 h). */
  fte: number;
  brlMonth: number | null;
  brlYear: number | null;
};

export type CalcResult =
  | { status: "empty" }
  | { status: "invalid"; field: CalcField; reason: CalcReason; /** posição do passo, quando o erro é de um passo */ step?: number }
  | {
      status: "ok";
      runsMonth: number;
      /** Minutos por execução, antes da automação. */
      perRunMinutes: number;
      steps: StepResult[];
      hoursBefore: number;
      low: Scenario;
      high: Scenario;
    };

/** Salário mensal → custo da hora: salário × (1 + encargos) ÷ 220. */
export function hourlyFromSalary(salary: number, encargos: number): number | null {
  if (!Number.isFinite(salary) || !Number.isFinite(encargos) || salary <= 0 || encargos < 0) return null;
  return (salary * (1 + encargos)) / K.LEGAL_HOURS_MONTH;
}

/** Execuções por mês: por dia útil, por semana ou já por mês. */
export function runsPerMonth(runs: number, period: Period): number {
  switch (period) {
    case "dia":
      return runs * K.WORKDAYS_MONTH;
    case "semana":
      return runs * K.WEEKS_MONTH;
    case "mes":
      return runs;
  }
}

function invalid(field: CalcField, reason: CalcReason, step?: number): CalcResult {
  return step === undefined ? { status: "invalid", field, reason } : { status: "invalid", field, reason, step };
}

export function calculate(i: CalcInput): CalcResult {
  if (i.runs === null || i.steps.length === 0) return { status: "empty" };

  if (!Number.isFinite(i.runs)) return invalid("runs", "nan");
  if (i.runs < 0) return invalid("runs", "negative");
  if (i.runs === 0) return invalid("runs", "zero");

  if (i.steps.length > K.MAX_STEPS) return invalid("minutes", "too_large", K.MAX_STEPS);
  for (const [index, step] of i.steps.entries()) {
    if (!Number.isFinite(step.minutes)) return invalid("minutes", "nan", index);
    if (step.minutes < 0) return invalid("minutes", "negative", index);
    if (step.minutes === 0) return invalid("minutes", "zero", index);
    if (step.minutes < K.MIN_MINUTES_STEP) return invalid("minutes", "too_small", index);
    if (step.minutes > K.MAX_MINUTES_STEP) return invalid("minutes", "too_large", index);
  }

  if (i.hourlyBRL !== null) {
    if (!Number.isFinite(i.hourlyBRL)) return invalid("hourlyBRL", "nan");
    if (i.hourlyBRL < 0) return invalid("hourlyBRL", "negative");
    if (i.hourlyBRL > K.MAX_BRL_HOUR) return invalid("hourlyBRL", "too_large");
  }

  const runsMonth = runsPerMonth(i.runs, i.period);
  if (runsMonth > K.MAX_RUNS_MONTH) return invalid("runs", "too_large");

  const steps: StepResult[] = i.steps.map((step) => {
    const { floor, ceiling } = rangeOf(step.kind);
    return { minutes: step.minutes, kind: step.kind, floor, ceiling, savedLow: step.minutes * floor, savedHigh: step.minutes * ceiling };
  });
  const perRunMinutes = steps.reduce((sum, s) => sum + s.minutes, 0);

  const hoursBefore = (perRunMinutes * runsMonth) / 60;
  if (hoursBefore > K.MAX_HOURS_MONTH) return invalid("runs", "too_large");

  const scenario = (perRunSaved: number): Scenario => {
    const hoursReturned = (perRunSaved * runsMonth) / 60;
    const brlMonth = i.hourlyBRL === null ? null : hoursReturned * i.hourlyBRL;
    return {
      perRunSaved,
      hoursReturned,
      hoursAfter: hoursBefore - hoursReturned,
      share: hoursReturned / hoursBefore,
      fte: hoursReturned / K.LEGAL_HOURS_MONTH,
      brlMonth,
      brlYear: brlMonth === null ? null : brlMonth * 12,
    };
  };

  return {
    status: "ok",
    runsMonth,
    perRunMinutes,
    steps,
    hoursBefore,
    low: scenario(steps.reduce((sum, s) => sum + s.savedLow, 0)),
    high: scenario(steps.reduce((sum, s) => sum + s.savedHigh, 0)),
  };
}
