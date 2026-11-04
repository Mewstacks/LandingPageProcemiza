import type { Pay, Regime } from "./cost";
import { evidenceOf, type Kind } from "./evidence";
import { evaluate, type Period, type Plan, type Routine } from "./plan";

/**
 * A simulação como texto de fragmento de URL (`/relatorio#r=...&p=...`). Só números e degraus: nada
 * pessoal. O fragmento não vai ao servidor. Quem lê valida tudo de novo: um link pode ser forjado.
 */
export function encodePlan(plan: Plan): string {
  const r = plan.routines.map((x) => [x.kind, x.minutes, x.runs, x.period].join(".")).join(",");
  const p =
    plan.pay.mode === "custo"
      ? `custo.${plan.pay.monthly}`
      : ["bruto", plan.pay.salary, plan.pay.regime, plan.pay.benefits].join(".");
  return `r=${r}&p=${p}`;
}

export function decodePlan(fragment: string): Plan | null {
  const params = new URLSearchParams(fragment.replace(/^#/, ""));
  const r = params.get("r");
  const p = params.get("p");
  if (!r || !p || r.length > 400 || p.length > 80) return null;

  const routines: Routine[] = [];
  for (const part of r.split(",")) {
    const [kind, minutes, runs, period] = part.split(".");
    if (!kind || !evidenceOf(kind as Kind)) return null;
    routines.push({ kind: kind as Kind, minutes: Number(minutes), runs: Number(runs), period: period as Period });
  }

  const f = p.split(".");
  let pay: Pay;
  if (f[0] === "custo") {
    pay = { mode: "custo", monthly: Number(f[1]) };
  } else if (f[0] === "bruto") {
    if (f[2] !== "simples" && f[2] !== "presumido") return null;
    pay = { mode: "bruto", salary: Number(f[1]), regime: f[2] as Regime, benefits: Number(f[3] ?? 0) };
  } else {
    return null;
  }

  const plan: Plan = { routines, pay };
  return evaluate(plan).status === "ok" ? plan : null;
}
