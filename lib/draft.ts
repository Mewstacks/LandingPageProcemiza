import { COST, type Pay, type Regime } from "./cost";
import { evidenceOf, type Kind } from "./evidence";
import { LIMITS, type Period, type Plan, type Routine } from "./plan";

/**
 * O que a pessoa está montando na tela: rotinas escolhidas em degraus (toque e slider, sem texto livre
 * além do salário) e quem as faz. Guardado no `sessionStorage`; tudo que volta de lá é validado.
 */

/** 1 min a 8 h. Degraus apertados no que a rotina costuma ser (minutos) e largos nas horas. */
export const MINUTE_STOPS = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 480] as const;
/** 1 a 100 execuções no período. */
export const RUN_STOPS = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50, 100] as const;
/** Benefícios por mês (VT, VR, plano), em reais. */
export const BENEFIT_STOPS = [0, 500, 1000, 1500] as const;

export const PERIODS: readonly { id: Period; label: string; per: string }[] = [
  { id: "dia", label: "Dia", per: "por dia" },
  { id: "semana", label: "Semana", per: "por semana" },
  { id: "mes", label: "Mês", per: "por mês" },
];

export type Draft = {
  routines: Routine[];
  mode: "bruto" | "custo";
  salary: number;
  regime: Regime;
  benefits: number;
  monthly: number;
};

export const DEFAULT_ROUTINE: Routine = { kind: "dados", minutes: 30, runs: 5, period: "semana" };

/** Nasce preenchida: a pessoa tem uma conta pronta antes de tocar em qualquer coisa. */
export const DEFAULT_DRAFT: Draft = { routines: [DEFAULT_ROUTINE], mode: "bruto", salary: 4500, regime: "simples", benefits: 0, monthly: 7000 };

export function toPlan(d: Draft): Plan {
  const pay: Pay = d.mode === "bruto" ? { mode: "bruto", salary: d.salary, regime: d.regime, benefits: d.benefits } : { mode: "custo", monthly: d.monthly };
  return { routines: d.routines, pay };
}

/** O degrau mais próximo (empate fica com o menor). Número que não é finito não tem degrau. */
export function snap(stops: readonly number[], n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  let best = stops[0];
  for (const stop of stops) {
    if (Math.abs(stop - n) < Math.abs(best - n)) best = stop;
  }
  return best;
}

export type Stored = { v: 5; draft: Draft };

const money = (n: unknown, max: number, fallback: number) => (typeof n === "number" && Number.isFinite(n) && n > 0 && n <= max ? Math.round(n) : fallback);

export function sanitize(raw: unknown): Draft | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { v, draft } = raw as { v?: unknown; draft?: unknown };
  if (v !== 5 || typeof draft !== "object" || draft === null) return null;
  const d = draft as Record<string, unknown>;
  if (!Array.isArray(d.routines) || d.routines.length < 1 || d.routines.length > LIMITS.MAX_ROUTINES) return null;

  const routines: Routine[] = [];
  for (const item of d.routines) {
    const r = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    const kind = evidenceOf(r.kind as Kind)?.id;
    const period = PERIODS.find((p) => p.id === r.period)?.id;
    const minutes = snap(MINUTE_STOPS, r.minutes);
    const runs = snap(RUN_STOPS, r.runs);
    if (!kind || !period || minutes === null || runs === null) return null;
    routines.push({ kind, minutes, runs, period });
  }

  return {
    routines,
    mode: d.mode === "custo" ? "custo" : "bruto",
    salary: money(d.salary, COST.MAX_SALARY, DEFAULT_DRAFT.salary),
    regime: d.regime === "presumido" ? "presumido" : "simples",
    benefits: BENEFIT_STOPS.find((b) => b === d.benefits) ?? 0,
    monthly: money(d.monthly, COST.MAX_MONTHLY_COST, DEFAULT_DRAFT.monthly),
  };
}

/** "30 minutos", "1 hora", "1 hora e 30 minutos": o valor do slider como o leitor de tela lê. */
export function spokenMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min - h * 60;
  const hours = h === 0 ? "" : h === 1 ? "1 hora" : `${h} horas`;
  const minutes = m === 0 ? "" : m === 1 ? "1 minuto" : `${m} minutos`;
  return [hours, minutes].filter(Boolean).join(" e ");
}
