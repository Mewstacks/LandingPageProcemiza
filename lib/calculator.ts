/**
 * Conta da calculadora. Pura: sem React, sem Intl, sem arredondamento (quem exibe arredonda).
 * Nada é ajustado em silêncio: entrada ruim vira `invalid` com o campo e o motivo.
 *
 * O ganho sai do processo que a pessoa descreve, não de um percentual fixo: cada passo tem o
 * seu tempo e o seu tipo de trabalho, e o que volta é a soma do que dá para automatizar em
 * cada passo, descontadas as vezes em que uma pessoa ainda precisa entrar.
 */
export const K = {
  /** Conservador: 22 inflaria. */
  WORKDAYS_MONTH: 21,
  WEEKS_MONTH: 52 / 12,
  /** 44 h/semana. Único ponto de mudança se a PEC das 40 h passar. */
  LEGAL_HOURS_MONTH: 220,
  MAX_STEPS: 10,
  MAX_MINUTES_STEP: 600,
  MAX_RUNS_MONTH: 100_000,
  MAX_HOURS_MONTH: 100_000,
  MAX_BRL_HOUR: 10_000,
  /** Das execuções automáticas, quantas ainda passam por uma pessoa. */
  MAX_EXCEPTIONS: 0.5,
  DEFAULT_EXCEPTIONS: 0.1,
  /** Regra de bolso (contabilidades): CLT geral +70%, Simples +50%. Editável. */
  ENCARGOS: { clt: 0.7, simples: 0.5 },
} as const;

export type Period = "dia" | "semana" | "mes";

/**
 * Tipo de trabalho do passo e o quanto dele dá para automatizar quando o dado é digital e a
 * regra é clara. Premissa à vista: a pessoa pode trocar o valor de cada passo.
 * Regra fixa e dado digital automatizam quase tudo; procurar informação, parte; julgamento e
 * conversa, quase nada.
 */
export type StepKind = "dados" | "conferir" | "avisar" | "buscar" | "decidir" | "pessoas";

export const STEP_KINDS: readonly { id: StepKind; label: string; coverage: number }[] = [
  { id: "dados", label: "Copiar ou digitar", coverage: 0.95 },
  { id: "conferir", label: "Conferir com regra", coverage: 0.9 },
  { id: "avisar", label: "Avisar ou enviar", coverage: 0.95 },
  { id: "buscar", label: "Procurar ou juntar", coverage: 0.75 },
  { id: "decidir", label: "Analisar ou decidir", coverage: 0.2 },
  { id: "pessoas", label: "Falar com gente", coverage: 0.1 },
];

export function defaultCoverage(kind: StepKind): number {
  return STEP_KINDS.find((k) => k.id === kind)?.coverage ?? 0;
}

export type Step = {
  /** Minutos por execução, só o tempo de mão na tarefa. `null` = linha em branco (ignorada). */
  minutes: number | null;
  kind: StepKind;
  /** 0..1. `null` = padrão do tipo. */
  coverage: number | null;
};

export type CalcInput = {
  /** Quantas vezes o processo roda em `period`. `null` = vazio. */
  runs: number | null;
  period: Period;
  steps: readonly Step[];
  /** `null` = sem custo informado: só horas. */
  hourlyBRL: number | null;
  /** 0..MAX_EXCEPTIONS */
  exceptions: number;
  /** Retrabalho: % das execuções refeitas e minutos para refazer. `null` = não informado. */
  rework: { percent: number | null; minutes: number | null } | null;
};

export type CalcField =
  | "runs"
  | "minutes"
  | "coverage"
  | "hourlyBRL"
  | "exceptions"
  | "reworkPercent"
  | "reworkMinutes";
export type CalcReason = "nan" | "negative" | "zero" | "too_large";

export type StepResult = {
  minutes: number;
  kind: StepKind;
  /** Quanto do passo é automatizável (já com o padrão do tipo aplicado). */
  coverage: number;
  /** Minutos por execução que voltam (cobertura × (1 − exceções)). */
  savedMinutes: number;
  remainMinutes: number;
};

export type CalcResult =
  | { status: "empty" }
  | { status: "invalid"; field: CalcField; reason: CalcReason; /** posição do passo, quando o erro é de um passo */ step?: number }
  | {
      status: "ok";
      runsMonth: number;
      /** Minutos por execução, antes e depois. */
      perRunMinutes: number;
      perRunSaved: number;
      perRunRemain: number;
      steps: StepResult[];
      /** Horas por mês só dos passos (sem retrabalho). */
      stepsHoursMonth: number;
      rework: { hoursBefore: number; hoursReturned: number } | null;
      hoursBefore: number;
      hoursReturned: number;
      hoursAfter: number;
      /** Parte do tempo que volta, 0..1. Sai da conta; nunca é digitada. */
      share: number;
      /** Pessoas equivalentes (horas devolvidas ÷ 220 h). */
      fte: number;
      brlMonth: number | null;
      brlYear: number | null;
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
  const filled = i.steps.map((step, index) => ({ step, index })).filter(({ step }) => step.minutes !== null);
  if (i.runs === null || filled.length === 0) return { status: "empty" };

  if (!Number.isFinite(i.runs)) return invalid("runs", "nan");
  if (i.runs < 0) return invalid("runs", "negative");
  if (i.runs === 0) return invalid("runs", "zero");

  if (filled.length > K.MAX_STEPS) return invalid("minutes", "too_large", filled[K.MAX_STEPS].index);
  for (const { step, index } of filled) {
    const minutes = step.minutes as number;
    if (!Number.isFinite(minutes)) return invalid("minutes", "nan", index);
    if (minutes < 0) return invalid("minutes", "negative", index);
    if (minutes === 0) return invalid("minutes", "zero", index);
    if (minutes > K.MAX_MINUTES_STEP) return invalid("minutes", "too_large", index);
    if (step.coverage !== null) {
      if (!Number.isFinite(step.coverage)) return invalid("coverage", "nan", index);
      if (step.coverage < 0) return invalid("coverage", "negative", index);
      if (step.coverage > 1) return invalid("coverage", "too_large", index);
    }
  }

  if (i.hourlyBRL !== null) {
    if (!Number.isFinite(i.hourlyBRL)) return invalid("hourlyBRL", "nan");
    if (i.hourlyBRL < 0) return invalid("hourlyBRL", "negative");
    if (i.hourlyBRL > K.MAX_BRL_HOUR) return invalid("hourlyBRL", "too_large");
  }

  if (!Number.isFinite(i.exceptions)) return invalid("exceptions", "nan");
  if (i.exceptions < 0) return invalid("exceptions", "negative");
  if (i.exceptions > K.MAX_EXCEPTIONS) return invalid("exceptions", "too_large");

  const reworkPercent = i.rework?.percent ?? null;
  const reworkMinutes = i.rework?.minutes ?? null;
  if (reworkPercent !== null) {
    if (!Number.isFinite(reworkPercent)) return invalid("reworkPercent", "nan");
    if (reworkPercent < 0) return invalid("reworkPercent", "negative");
    if (reworkPercent > 1) return invalid("reworkPercent", "too_large");
  }
  if (reworkMinutes !== null) {
    if (!Number.isFinite(reworkMinutes)) return invalid("reworkMinutes", "nan");
    if (reworkMinutes < 0) return invalid("reworkMinutes", "negative");
    if (reworkMinutes > K.MAX_MINUTES_STEP) return invalid("reworkMinutes", "too_large");
  }

  const runsMonth = runsPerMonth(i.runs, i.period);
  if (runsMonth > K.MAX_RUNS_MONTH) return invalid("runs", "too_large");

  const steps: StepResult[] = filled.map(({ step }) => {
    const minutes = step.minutes as number;
    const coverage = step.coverage ?? defaultCoverage(step.kind);
    const savedMinutes = minutes * coverage * (1 - i.exceptions);
    return { minutes, kind: step.kind, coverage, savedMinutes, remainMinutes: minutes - savedMinutes };
  });
  const perRunMinutes = steps.reduce((sum, s) => sum + s.minutes, 0);
  const perRunSaved = steps.reduce((sum, s) => sum + s.savedMinutes, 0);
  const perRunRemain = perRunMinutes - perRunSaved;

  const stepsHoursMonth = (perRunMinutes * runsMonth) / 60;
  if (stepsHoursMonth > K.MAX_HOURS_MONTH) return invalid("runs", "too_large");

  // Erro nasce no passo manual: automatizar uma fração do tempo tira a mesma fração do retrabalho.
  const automatedShare = perRunSaved / perRunMinutes;
  const reworkBefore =
    reworkPercent !== null && reworkMinutes !== null ? (runsMonth * reworkPercent * reworkMinutes) / 60 : 0;
  const rework = reworkBefore > 0 ? { hoursBefore: reworkBefore, hoursReturned: reworkBefore * automatedShare } : null;

  const hoursBefore = stepsHoursMonth + reworkBefore;
  const hoursReturned = (perRunSaved * runsMonth) / 60 + (rework?.hoursReturned ?? 0);
  const brlMonth = i.hourlyBRL === null ? null : hoursReturned * i.hourlyBRL;

  return {
    status: "ok",
    runsMonth,
    perRunMinutes,
    perRunSaved,
    perRunRemain,
    steps,
    stepsHoursMonth,
    rework,
    hoursBefore,
    hoursReturned,
    hoursAfter: hoursBefore - hoursReturned,
    share: hoursReturned / hoursBefore,
    fte: hoursReturned / K.LEGAL_HOURS_MONTH,
    brlMonth,
    brlYear: brlMonth === null ? null : brlMonth * 12,
  };
}
