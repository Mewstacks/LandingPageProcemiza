import {
  calculate,
  hourlyFromSalary,
  K,
  STEP_KINDS,
  type CalcField,
  type CalcInput,
  type CalcReason,
  type CalcResult,
  type Period,
  type Step,
  type StepKind,
} from "./calculator";
import { parseDecimalPtBR } from "./format";

/**
 * O que a pessoa digita (texto cru) e como vira a entrada da conta. Puro: o provider só guarda o
 * estado e chama estas funções, então tudo aqui tem teste.
 */
export type Regime = "clt" | "simples";
export type CostMode = "salario" | "hora";

export type StepFields = { id: string; name: string; minutes: string; kind: StepKind };

export type RoutineFields = {
  routine: string;
  runs: string;
  period: Period;
  steps: StepFields[];
  costMode: CostMode;
  cost: string;
  regime: Regime;
  /** Em %. Vazio = padrão (K.DEFAULT_EXCEPTIONS). */
  exceptions: string;
  /** Retrabalho: % das execuções refeitas e minutos para refazer. */
  reworkPercent: string;
  reworkMinutes: string;
  /** Automatizável por tipo, em %. Ausente ou vazio = padrão do tipo. */
  coverage: Partial<Record<StepKind, string>>;
};

export const LIMIT = { name: 80, number: 12 } as const;

const DEFAULT_KIND: StepKind = "dados";

const BASE = {
  costMode: "salario",
  cost: "",
  regime: "clt",
  exceptions: "",
  reworkPercent: "",
  reworkMinutes: "",
} as const satisfies Partial<RoutineFields>;

export type Preset = { label: string; routine: string; runs: string; period: Period; steps: readonly StepFields[] };

const step = (n: number, name: string, minutes: string, kind: StepKind): StepFields => ({ id: `s${n}`, name, minutes, kind });

/** Atalhos: só preenchem os campos. Os minutos são exemplos, a pessoa troca. */
export const PRESETS: readonly Preset[] = [
  {
    label: "Notas fiscais",
    routine: "Conferir notas fiscais",
    runs: "40",
    period: "semana",
    steps: [
      step(1, "Baixar o XML", "2", "buscar"),
      step(2, "Conferir valores e impostos", "4", "conferir"),
      step(3, "Lançar no sistema", "3", "dados"),
      step(4, "Avisar o fornecedor", "1", "avisar"),
    ],
  },
  {
    label: "WhatsApp",
    routine: "Responder pedidos no WhatsApp",
    runs: "30",
    period: "dia",
    steps: [
      step(1, "Entender o pedido", "1", "decidir"),
      step(2, "Ver o estoque", "2", "buscar"),
      step(3, "Digitar no sistema", "3", "dados"),
      step(4, "Confirmar com o cliente", "2", "avisar"),
    ],
  },
  {
    label: "Entre sistemas",
    routine: "Digitar dados entre sistemas",
    runs: "25",
    period: "dia",
    steps: [
      step(1, "Copiar do primeiro sistema", "2", "dados"),
      step(2, "Digitar no segundo", "3", "dados"),
      step(3, "Conferir se bateu", "1", "conferir"),
    ],
  },
  {
    label: "Relatório",
    routine: "Montar relatório mensal",
    runs: "1",
    period: "mes",
    steps: [
      step(1, "Juntar as planilhas", "180", "buscar"),
      step(2, "Consolidar os números", "240", "dados"),
      step(3, "Conferir", "120", "conferir"),
      step(4, "Escrever a análise", "180", "decidir"),
      step(5, "Enviar", "20", "avisar"),
    ],
  },
  {
    label: "Cadastros",
    routine: "Cadastrar clientes novos",
    runs: "15",
    period: "dia",
    steps: [
      step(1, "Receber os dados", "2", "buscar"),
      step(2, "Digitar no cadastro", "4", "dados"),
      step(3, "Conferir os documentos", "3", "conferir"),
      step(4, "Avisar o cliente", "1", "avisar"),
    ],
  },
  {
    label: "Conciliação",
    routine: "Conciliar o extrato do banco",
    runs: "1",
    period: "dia",
    steps: [
      step(1, "Baixar o extrato", "5", "buscar"),
      step(2, "Comparar com o sistema", "25", "conferir"),
      step(3, "Lançar as diferenças", "15", "dados"),
      step(4, "Resolver o que não bate", "15", "decidir"),
    ],
  },
  {
    label: "Orçamentos",
    routine: "Montar orçamentos",
    runs: "12",
    period: "semana",
    steps: [
      step(1, "Entender o pedido", "5", "decidir"),
      step(2, "Buscar os preços", "8", "buscar"),
      step(3, "Montar a proposta", "12", "dados"),
      step(4, "Enviar ao cliente", "2", "avisar"),
    ],
  },
];

export function fromPreset(p: Preset): RoutineFields {
  return { ...BASE, coverage: {}, routine: p.routine, runs: p.runs, period: p.period, steps: p.steps.map((s) => ({ ...s })) };
}

/** Estado de partida: a página nunca nasce vazia. */
export function initialFields(): RoutineFields {
  return fromPreset(PRESETS[0]);
}

export function blankFields(): RoutineFields {
  return { ...BASE, coverage: {}, routine: "", runs: "", period: "semana", steps: [blankStep("s1")] };
}

export function blankStep(id: string): StepFields {
  return { id, name: "", minutes: "", kind: DEFAULT_KIND };
}

export function isBlank(f: RoutineFields): boolean {
  return JSON.stringify(f) === JSON.stringify(blankFields());
}

export function nextStepId(steps: readonly StepFields[]): string {
  let max = 0;
  for (const s of steps) {
    const n = Number(s.id.slice(1));
    if (s.id.startsWith("s") && Number.isInteger(n) && n > max) max = n;
  }
  return `s${max + 1}`;
}

/** Passo novo de um tipo, já com o tempo de partida do tipo (a pessoa só ajusta). */
export function addStepOf(f: RoutineFields, kind: StepKind): RoutineFields {
  if (f.steps.length >= K.MAX_STEPS) return f;
  const minutes = String(STEP_KINDS.find((k) => k.id === kind)?.minutes ?? 2);
  return { ...f, steps: [...f.steps, { id: nextStepId(f.steps), name: "", minutes, kind }] };
}

/** Nunca zera a lista: o último passo volta em branco. */
export function removeStep(f: RoutineFields, id: string): RoutineFields {
  const steps = f.steps.filter((s) => s.id !== id);
  return { ...f, steps: steps.length > 0 ? steps : [blankStep("s1")] };
}

export function patchStep(f: RoutineFields, id: string, patch: Partial<Omit<StepFields, "id">>): RoutineFields {
  return { ...f, steps: f.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
}

export type FieldError = { field: CalcField | "cost"; reason: CalcReason; step?: number; kind?: StepKind };

export type RoutineView = {
  /** true = ninguém editou ainda; os números vêm do atalho que está na tela. */
  isExample: boolean;
  routine: string;
  input: CalcInput;
  result: CalcResult;
  hourly: number | null;
  /** Nome de cada passo preenchido, na ordem de `result.steps`. */
  stepNames: string[];
  /** Para cada linha digitada, a posição em `result.steps` (null = linha em branco). */
  slots: (number | null)[];
  errors: FieldError[];
};

/** "" → null; ilegível → NaN (vira erro `nan`); senão o número. */
function num(text: string): number | null {
  if (text.trim() === "") return null;
  return parseDecimalPtBR(text) ?? Number.NaN;
}

function pct(text: string): number | null {
  const n = num(text);
  return n === null ? null : n / 100;
}

export function kindLabel(kind: StepKind): string {
  return STEP_KINDS.find((k) => k.id === kind)?.label ?? kind;
}

export function deriveView(f: RoutineFields, edited: boolean): RoutineView {
  const steps: Step[] = f.steps.map((s) => ({ minutes: num(s.minutes), kind: s.kind, coverage: pct(f.coverage[s.kind] ?? "") }));

  const costRaw = num(f.cost);
  let hourly: number | null = null;
  if (costRaw !== null) {
    if (Number.isNaN(costRaw)) hourly = Number.NaN;
    else if (f.costMode === "salario") hourly = hourlyFromSalary(costRaw, K.ENCARGOS[f.regime]) ?? Number.NaN;
    else hourly = costRaw;
  }

  const exceptions = f.exceptions.trim() === "" ? K.DEFAULT_EXCEPTIONS : (pct(f.exceptions) ?? Number.NaN);
  const reworkPercent = pct(f.reworkPercent);
  const reworkMinutes = num(f.reworkMinutes);

  const input: CalcInput = {
    runs: num(f.runs),
    period: f.period,
    steps,
    hourlyBRL: hourly,
    exceptions,
    rework: reworkPercent === null && reworkMinutes === null ? null : { percent: reworkPercent, minutes: reworkMinutes },
  };

  const result = calculate(input);

  const errors: FieldError[] = [];
  if (result.status === "invalid") {
    const error: FieldError = { field: result.field === "hourlyBRL" ? "cost" : result.field, reason: result.reason };
    if (result.step !== undefined) {
      error.step = result.step;
      if (result.field === "coverage") error.kind = f.steps[result.step]?.kind;
    }
    errors.push(error);
  }

  const stepNames = f.steps.flatMap((s, i) => (steps[i].minutes === null ? [] : [s.name.trim() || kindLabel(s.kind)]));
  let filled = 0;
  const slots = steps.map((s) => (s.minutes === null ? null : filled++));

  return {
    isExample: !edited,
    routine: f.routine.trim() || "Seu processo",
    input,
    result,
    hourly,
    stepNames,
    slots,
    errors,
  };
}

/* ------------------------------ persistência ------------------------------ */

export type Stored = { v: 2; edited: boolean; fields: RoutineFields };

const KIND_IDS = new Set<string>(STEP_KINDS.map((k) => k.id));
const PERIODS = new Set<string>(["dia", "semana", "mes"]);
const COST_MODES = new Set<string>(["salario", "hora"]);
const REGIMES = new Set<string>(["clt", "simples"]);

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function text(x: unknown, max: number): string {
  return typeof x === "string" ? x.slice(0, max) : "";
}

/** Lê o que veio do storage. Qualquer coisa fora do formato derruba tudo e volta o padrão (null). */
export function sanitize(raw: unknown): { fields: RoutineFields; edited: boolean } | null {
  if (!isRecord(raw) || raw.v !== 2 || !isRecord(raw.fields)) return null;
  const f = raw.fields;
  if (!Array.isArray(f.steps) || f.steps.length === 0 || f.steps.length > K.MAX_STEPS) return null;
  if (typeof f.period !== "string" || !PERIODS.has(f.period)) return null;
  if (typeof f.costMode !== "string" || !COST_MODES.has(f.costMode)) return null;
  if (typeof f.regime !== "string" || !REGIMES.has(f.regime)) return null;

  const seen = new Set<string>();
  const steps: StepFields[] = [];
  for (const s of f.steps) {
    if (!isRecord(s) || typeof s.kind !== "string" || !KIND_IDS.has(s.kind)) return null;
    const id = text(s.id, 12);
    if (id === "" || seen.has(id)) return null;
    seen.add(id);
    steps.push({ id, name: text(s.name, LIMIT.name), minutes: text(s.minutes, LIMIT.number), kind: s.kind as StepKind });
  }

  const coverage: Partial<Record<StepKind, string>> = {};
  if (isRecord(f.coverage)) {
    for (const [kind, value] of Object.entries(f.coverage)) {
      if (KIND_IDS.has(kind) && typeof value === "string") coverage[kind as StepKind] = value.slice(0, LIMIT.number);
    }
  }

  return {
    edited: raw.edited === true,
    fields: {
      routine: text(f.routine, LIMIT.name),
      runs: text(f.runs, LIMIT.number),
      period: f.period as Period,
      steps,
      costMode: f.costMode as CostMode,
      cost: text(f.cost, LIMIT.number),
      regime: f.regime as Regime,
      exceptions: text(f.exceptions, LIMIT.number),
      reworkPercent: text(f.reworkPercent, LIMIT.number),
      reworkMinutes: text(f.reworkMinutes, LIMIT.number),
      coverage,
    },
  };
}
