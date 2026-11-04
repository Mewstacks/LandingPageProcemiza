import { hourlyCost, productiveHoursMonth, type Pay } from "./cost";
import { evidenceOf, type Kind } from "./evidence";

/**
 * A simulação inteira: até 5 rotinas e quem as faz. Pura, sem arredondar (quem exibe arredonda).
 * Entrada ruim vira `invalid` com o motivo; nada é ajustado em silêncio. O servidor chama esta mesma
 * função para recalcular o que o navegador mostrou.
 *
 * Fora da conta: custo de implantar e manter, erros e retrabalho, prazo. Horas devolvidas só viram
 * dinheiro se forem reaproveitadas.
 */
export const LIMITS = {
  MAX_ROUTINES: 5,
  MIN_MINUTES: 0.5,
  MAX_MINUTES: 600,
  MAX_RUNS: 1000,
  WORKDAYS_MONTH: 21,
  WEEKS_MONTH: 52 / 12,
  /** Redução do tempo informado na linha de sensibilidade. */
  SENSITIVITY: 0.25,
} as const;

export type Period = "dia" | "semana" | "mes";

export type Routine = { kind: Kind; minutes: number; runs: number; period: Period };

export type Plan = { routines: readonly Routine[]; pay: Pay };

export type Side = { hours: number; brlMonth: number; brlYear: number };

export type Line = {
  routine: Routine;
  runsMonth: number;
  hoursBefore: number;
  prudent: Side;
  ceiling: Side;
};

export type Invalid = {
  status: "invalid";
  field: "routines" | "minutes" | "runs" | "period" | "kind" | "pay";
  index?: number;
};

export type Outcome = {
  status: "ok";
  hourly: number;
  hoursBefore: number;
  lines: Line[];
  prudent: Side & { fte: number; share: number };
  ceiling: Side & { fte: number; share: number };
  /** Quanto dá para investir e o prudente já pagar em 12 e em 24 meses. */
  invest: { m12: number; m24: number };
  threeYears: { prudent: number; ceiling: number };
  /** Prudente se o tempo informado estiver 25% alto. */
  sensitivity: Side;
};

export function runsPerMonth(runs: number, period: Period): number {
  return period === "dia" ? runs * LIMITS.WORKDAYS_MONTH : period === "semana" ? runs * LIMITS.WEEKS_MONTH : runs;
}

const PERIODS: readonly Period[] = ["dia", "semana", "mes"];

export function evaluate(plan: Plan): Outcome | Invalid {
  const { routines, pay } = plan;
  if (routines.length < 1 || routines.length > LIMITS.MAX_ROUTINES) return { status: "invalid", field: "routines" };

  const hourly = hourlyCost(pay);
  if (hourly === null || !Number.isFinite(hourly)) return { status: "invalid", field: "pay" };

  const lines: Line[] = [];
  for (const [index, r] of routines.entries()) {
    const ev = evidenceOf(r.kind);
    if (!ev) return { status: "invalid", field: "kind", index };
    if (!PERIODS.includes(r.period)) return { status: "invalid", field: "period", index };
    if (!Number.isFinite(r.minutes) || r.minutes < LIMITS.MIN_MINUTES || r.minutes > LIMITS.MAX_MINUTES) {
      return { status: "invalid", field: "minutes", index };
    }
    if (!Number.isFinite(r.runs) || r.runs <= 0 || r.runs > LIMITS.MAX_RUNS) return { status: "invalid", field: "runs", index };

    const runsMonth = runsPerMonth(r.runs, r.period);
    const hoursBefore = (r.minutes * runsMonth) / 60;
    const side = (share: number): Side => {
      const hours = hoursBefore * share;
      return { hours, brlMonth: hours * hourly, brlYear: hours * hourly * 12 };
    };
    lines.push({ routine: r, runsMonth, hoursBefore, prudent: side(ev.prudent), ceiling: side(ev.ceiling) });
  }

  const sum = (pick: (l: Line) => Side): Side => ({
    hours: lines.reduce((s, l) => s + pick(l).hours, 0),
    brlMonth: lines.reduce((s, l) => s + pick(l).brlMonth, 0),
    brlYear: lines.reduce((s, l) => s + pick(l).brlYear, 0),
  });
  const hoursBefore = lines.reduce((s, l) => s + l.hoursBefore, 0);
  const prudent = sum((l) => l.prudent);
  const ceiling = sum((l) => l.ceiling);
  const month = productiveHoursMonth();
  const cut = 1 - LIMITS.SENSITIVITY;

  return {
    status: "ok",
    hourly,
    hoursBefore,
    lines,
    prudent: { ...prudent, fte: prudent.hours / month, share: prudent.hours / hoursBefore },
    ceiling: { ...ceiling, fte: ceiling.hours / month, share: ceiling.hours / hoursBefore },
    invest: { m12: prudent.brlYear, m24: prudent.brlYear * 2 },
    threeYears: { prudent: prudent.brlYear * 3, ceiling: ceiling.brlYear * 3 },
    sensitivity: { hours: prudent.hours * cut, brlMonth: prudent.brlMonth * cut, brlYear: prudent.brlYear * cut },
  };
}
