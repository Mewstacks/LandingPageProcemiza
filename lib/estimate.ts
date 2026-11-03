import { calculate, STEP_KINDS, type CalcResult, type Period, type StepKind } from "./calculator";
import { formatBRL, formatHours, formatPercent } from "./format";

/**
 * A entrada da calculadora: um tipo de trabalho, quanto leva cada vez e quantas vezes. Tudo escolhido
 * em degraus (slider e toque), então não existe texto para ler nem valor impossível: toda combinação
 * dá resultado. A conta continua em `calculate`; aqui só ficam os degraus, o estado guardado e a
 * frase que o leitor de tela recebe.
 */

/** 1 min a 8 h. Degraus apertados no que a rotina costuma ser (minutos) e largos nas horas. */
export const MINUTE_STOPS = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 480] as const;
/** 1 a 100 execuções no período. 100 por dia dá 2.100 por mês, bem abaixo do teto de `calculate`. */
export const RUN_STOPS = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50, 100] as const;
/** Custo da hora de quem faz, em reais. Sem custo, a calculadora mostra só horas. */
export const HOURLY_STOPS = [20, 40, 60, 100] as const;

export const PERIODS: readonly { id: Period; label: string; per: string }[] = [
  { id: "dia", label: "Dia", per: "por dia" },
  { id: "semana", label: "Semana", per: "por semana" },
  { id: "mes", label: "Mês", per: "por mês" },
];

export type Estimate = {
  kind: StepKind;
  minutes: number;
  runs: number;
  period: Period;
  /** `null` = só horas. */
  hourlyBRL: number | null;
};

/** Nasce preenchida: a pessoa vê um resultado antes de tocar em qualquer coisa. */
export const DEFAULT_ESTIMATE: Estimate = { kind: "dados", minutes: 30, runs: 5, period: "semana", hourlyBRL: null };

export type Ok = Extract<CalcResult, { status: "ok" }>;

export const kindOf = (id: StepKind) => STEP_KINDS.find((k) => k.id === id);
export const periodOf = (id: Period) => PERIODS.find((p) => p.id === id);

/** O degrau mais próximo (empate fica com o menor). Número que não é finito não tem degrau. */
export function snap(stops: readonly number[], n: number): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  let best = stops[0];
  for (const stop of stops) {
    if (Math.abs(stop - n) < Math.abs(best - n)) best = stop;
  }
  return best;
}

export function resultOf(e: Estimate): CalcResult {
  return calculate({ runs: e.runs, period: e.period, steps: [{ minutes: e.minutes, kind: e.kind }], hourlyBRL: e.hourlyBRL });
}

export type Stored = { v: 4; estimate: Estimate };

/** Valida o que veio do `sessionStorage`. Qualquer coisa fora do formato volta `null` (começa do padrão). */
export function sanitize(raw: unknown): Estimate | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { v, estimate } = raw as { v?: unknown; estimate?: unknown };
  if (v !== 4 || typeof estimate !== "object" || estimate === null) return null;
  const e = estimate as Record<string, unknown>;

  const kind = STEP_KINDS.find((k) => k.id === e.kind)?.id;
  const period = PERIODS.find((p) => p.id === e.period)?.id;
  const minutes = typeof e.minutes === "number" ? snap(MINUTE_STOPS, e.minutes) : null;
  const runs = typeof e.runs === "number" ? snap(RUN_STOPS, e.runs) : null;
  if (!kind || !period || minutes === null || runs === null) return null;

  const hourlyBRL = e.hourlyBRL === null ? null : (HOURLY_STOPS.find((h) => h === e.hourlyBRL) ?? undefined);
  if (hourlyBRL === undefined) return null;

  return { kind, minutes, runs, period, hourlyBRL };
}

/** "30 minutos", "1 hora", "1 hora e 30 minutos": o valor do slider como o leitor de tela lê. */
export function spokenMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min - h * 60;
  const hours = h === 0 ? "" : h === 1 ? "1 hora" : `${h} horas`;
  const minutes = m === 0 ? "" : m === 1 ? "1 minuto" : `${m} minutos`;
  return [hours, minutes].filter(Boolean).join(" e ");
}

/** O que o leitor de tela ouve: a faixa em horas, o tempo de hoje e, se houver custo, os reais. */
export function spokenSummary(e: Estimate): string {
  const result = resultOf(e);
  if (result.status !== "ok") return "";
  const { low, high } = result;
  const label = kindOf(e.kind)?.label ?? "";
  if (low.hoursReturned < 0.05) {
    return `${label}: pede gente. O ganho aqui é pequeno, até ${formatHours(high.hoursReturned)} horas por mês.`;
  }
  const money = low.brlMonth !== null && high.brlMonth !== null ? ` De ${formatBRL(low.brlMonth)} a ${formatBRL(high.brlMonth)} por mês.` : "";
  return `Devolve de ${formatHours(low.hoursReturned)} a ${formatHours(high.hoursReturned)} horas por mês, ${formatPercent(low.share)} a ${formatPercent(high.share)} do tempo. Hoje são ${formatHours(result.hoursBefore)} horas.${money}`;
}
