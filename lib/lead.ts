import type { Pay } from "./cost";
import { evidenceOf, type Kind } from "./evidence";
import { evaluate, type Period, type Plan } from "./plan";
import type { Lead } from "./report";

/** Corpo do POST /api/relatorio, validado à mão: nada que veio do navegador é confiado. */
export type LeadRequest = {
  plan: Plan;
  lead: Lead;
  /** Armadilhas contra robô: campo escondido e tempo entre abrir e enviar. */
  trap: { website: string; elapsedMs: number };
  turnstile: string;
};

export type Parsed = { ok: true; value: LeadRequest } | { ok: false; field: string };

export const MIN_FILL_MS = 2500;
const EMAIL = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,255}\.[^\s@<>"]{2,}$/;

const clean = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

/** Refaz a simulação só com primitivos conferidos: nada do corpo original segue adiante. */
function rebuildPlan(routines: unknown, pay: unknown): Plan | null {
  if (!Array.isArray(routines) || routines.length > 5 || typeof pay !== "object" || pay === null) return null;
  const out: Plan["routines"][number][] = [];
  for (const item of routines) {
    const r = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    const kind = evidenceOf(r.kind as Kind)?.id;
    const period = (["dia", "semana", "mes"] as const).find((p) => p === r.period) as Period | undefined;
    if (!kind || !period || typeof r.minutes !== "number" || typeof r.runs !== "number") return null;
    out.push({ kind, period, minutes: r.minutes, runs: r.runs });
  }
  const p = pay as Record<string, unknown>;
  let clean: Pay;
  if (p.mode === "custo" && typeof p.monthly === "number") clean = { mode: "custo", monthly: p.monthly };
  else if (p.mode === "bruto" && typeof p.salary === "number" && typeof p.benefits === "number" && (p.regime === "simples" || p.regime === "presumido"))
    clean = { mode: "bruto", salary: p.salary, regime: p.regime, benefits: p.benefits };
  else return null;
  return { routines: out, pay: clean };
}

export function parseLeadRequest(body: unknown): Parsed {
  if (typeof body !== "object" || body === null) return { ok: false, field: "body" };
  const b = body as Record<string, unknown>;
  const l = (typeof b.lead === "object" && b.lead !== null ? b.lead : {}) as Record<string, unknown>;

  const name = clean(l.name, 120);
  const email = clean(l.email, 254).toLowerCase();
  const company = clean(l.company, 120);
  const wantsContact = l.wantsContact === true;
  const whatsapp = clean(l.whatsapp, 30).replace(/[^\d+]/g, "");

  if (name.length < 2) return { ok: false, field: "name" };
  if (!EMAIL.test(email)) return { ok: false, field: "email" };
  if (company.length < 2) return { ok: false, field: "company" };
  const digits = whatsapp.replace(/\D/g, "");
  if (wantsContact && (digits.length < 10 || digits.length > 13)) return { ok: false, field: "whatsapp" };

  const plan = rebuildPlan(b.routines, b.pay);
  if (!plan || evaluate(plan).status !== "ok") return { ok: false, field: "plan" };

  const trap = (typeof b.trap === "object" && b.trap !== null ? b.trap : {}) as Record<string, unknown>;
  return {
    ok: true,
    value: {
      plan,
      lead: { name, email, company, wantsContact, ...(wantsContact ? { whatsapp: digits } : {}) },
      trap: { website: clean(trap.website, 200), elapsedMs: typeof trap.elapsedMs === "number" ? trap.elapsedMs : 0 },
      turnstile: clean(b.turnstile, 2100),
    },
  };
}

/** Honeypot preenchido ou formulário enviado rápido demais = robô. */
export function looksLikeBot(t: LeadRequest["trap"]): boolean {
  return t.website !== "" || !(t.elapsedMs >= MIN_FILL_MS);
}
