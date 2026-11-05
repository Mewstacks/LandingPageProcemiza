import { COST, multiplier, productiveHoursYear } from "./cost";
import { evidenceOf, SOURCES, type Source } from "./evidence";
import { formatBRL, formatBRL2, formatFixed, formatHours, formatMinutes, formatPercent } from "./format";
import { evaluate, type Outcome, type Plan } from "./plan";
import { encodePlan } from "./share";

/**
 * O relatório como dados já formatados. Uma função pura alimenta o e-mail, o PDF e a página:
 * os três mostram sempre os mesmos números. Texto honesto: faixa, não promessa.
 */
export type Lead = { email: string; company: string; wantsContact: boolean; whatsapp?: string };

export type ReportRow = { label: string; time: string; freq: string; hoursNow: string; hoursBack: string; brlYear: string };

export type ReportModel = {
  id: string;
  dateLabel: string;
  subject: string;
  preheader: string;
  headline: { ceiling: string; hoursBack: string; people: string; share: string; threeYears: string };
  /** Só para a equipe e o CRMew: nunca vai ao relatório do lead. */
  internal: { prudent: string };
  rows: ReportRow[];
  totals: { hoursNow: string; hoursBack: string; brlYear: string };
  how: string[];
  invest: { m12: string; m24: string };
  sensitivity: string;
  outside: string[];
  sources: readonly Source[];
  limits: string;
  reportUrl: string;
  whatsappText: string;
  vigencia: string;
};

const PERIOD = { dia: "por dia", semana: "por semana", mes: "por mês" } as const;

const OUTSIDE = [
  "Erros e retrabalho que a rotina manual produz hoje",
  "Prazo: fechamento, resposta ao cliente, conferência",
  "Crescer o volume sem contratar na mesma proporção",
  "Custo de implantar e de manter a automação (entra na conversa, não nesta conta)",
];

const LIMITS_TEXT =
  "Teto, não promessa: é o potencial técnico que a pesquisa descreve como máximo teórico. Não há estudo com PMEs brasileiras. As horas devolvidas só viram dinheiro se forem reaproveitadas.";

function fnv(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function reportId(plan: Plan, email: string, now: Date): string {
  const day = now.toISOString().slice(0, 10).replace(/-/g, "");
  const tag = fnv(`${encodePlan(plan)}|${email.toLowerCase()}|${day}`).toString(36).toUpperCase().padStart(4, "0").slice(-4);
  return `PRC-${day}-${tag}`;
}

export function buildReport(plan: Plan, lead: Lead, now: Date, origin: string, whatsappBase: string): ReportModel | null {
  const out = evaluate(plan);
  if (out.status !== "ok") return null;
  return model(plan, out, lead, now, origin, whatsappBase);
}

function model(plan: Plan, o: Outcome, lead: Lead, now: Date, origin: string, whatsappBase: string): ReportModel {
  const id = reportId(plan, lead.email, now);
  const ceiling = formatBRL(o.ceiling.brlYear);
  const prudent = formatBRL(o.prudent.brlYear);

  const rows: ReportRow[] = o.lines.map((l) => ({
    label: evidenceOf(l.routine.kind)?.label ?? "",
    time: formatMinutes(l.routine.minutes),
    freq: `${l.routine.runs} ${PERIOD[l.routine.period]}`,
    hoursNow: `${formatHours(l.hoursBefore)} h`,
    hoursBack: `até ${formatHours(l.ceiling.hours)} h`,
    brlYear: `até ${formatBRL(l.ceiling.brlYear)}`,
  }));

  const how: string[] = [];
  if (plan.pay.mode === "bruto") {
    const regime = plan.pay.regime === "simples" ? "Simples Nacional" : "Lucro presumido ou real";
    how.push(
      `Salário bruto de ${formatBRL(plan.pay.salary)} em ${regime}: a empresa paga ${formatFixed(multiplier(plan.pay.regime), 2)}× o bruto por mês (13º, férias com 1/3, FGTS de 8%, encargos patronais do regime e multa do FGTS provisionada)${plan.pay.benefits > 0 ? `, mais ${formatBRL(plan.pay.benefits)} por mês de benefícios informados` : ""}.`,
    );
  } else {
    how.push(`Custo total informado de ${formatBRL(plan.pay.monthly)} por mês, usado como está.`);
  }
  how.push(
    `Custo anual ÷ ${formatHours(productiveHoursYear())} horas realmente trabalhadas por ano (jornada de ${COST.HORAS_SEMANA} h, 30 dias de férias, ${COST.FERIADOS_UTEIS} feriados úteis) = ${formatBRL2(o.hourly)} por hora.`,
  );
  const kinds = [...new Set(plan.routines.map((r) => r.kind))].map(evidenceOf).filter((e) => e !== undefined);
  how.push(
    `Teto da parte do tempo que volta, por tipo de trabalho: ${kinds.map((k) => `${k.short} ${formatPercent(k.ceiling)}`).join(", ")}.`,
  );

  const text = `Olá! Pedi o relatório ${id} no site: até ${ceiling} por ano devolvidos. Quero conversar sobre automatizar essas rotinas.`;

  return {
    id,
    dateLabel: new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(now),
    subject: `Seu relatório: até ${ceiling} por ano devolvidos`,
    preheader: "Conta por rotina, premissas e fontes. PDF em anexo.",
    headline: {
      ceiling,
      hoursBack: `até ${formatHours(o.ceiling.hours)} h por mês`,
      people: `até ${formatFixed(o.ceiling.fte, 1)} pessoa${o.ceiling.fte >= 1.05 ? "s" : ""} em tempo integral`,
      share: `até ${formatPercent(o.ceiling.share)} do tempo de hoje`,
      threeYears: `até ${formatBRL(o.threeYears.ceiling)}`,
    },
    internal: { prudent },
    rows,
    totals: {
      hoursNow: `${formatHours(o.hoursBefore)} h`,
      hoursBack: `até ${formatHours(o.ceiling.hours)} h`,
      brlYear: `até ${formatBRL(o.ceiling.brlYear)}`,
    },
    how,
    invest: { m12: formatBRL(o.ceiling.brlYear), m24: formatBRL(o.ceiling.brlYear * 2) },
    sensitivity: `Se o tempo informado estiver 25% alto, o teto cai para ${formatBRL(o.ceiling.brlYear * 0.75)} por ano.`,
    outside: OUTSIDE,
    sources: SOURCES,
    limits: LIMITS_TEXT,
    reportUrl: `${origin}/relatorio#${encodePlan(plan)}`,
    whatsappText: `${whatsappBase}?text=${encodeURIComponent(text)}`,
    vigencia: COST.VIGENCIA,
  };
}
