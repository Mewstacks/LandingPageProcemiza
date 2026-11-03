import {
  K,
  STEP_KINDS,
  calculate,
  hourlyFromSalary,
  type CalcInput,
  type CalcResult,
  type Period,
  type StepKind,
} from "./calculator";
import { formatBRL, formatBRL2, formatMinutes } from "./format";
import { cleanName, parseDuration, parseFrequency, parseMoney, runsFit } from "./parse";
import { PRESETS } from "./presets";

/**
 * A conversa da calculadora, sem IA: uma máquina de estados pura. O estado são só as respostas; a
 * lista de balões, a pergunta da vez, os chips e o resultado saem delas. Corrigir uma resposta é
 * apagar aquela resposta: as seguintes que ainda valem continuam guardadas e voltam à tela assim que
 * a pergunta apagada for respondida de novo.
 */
export type Regime = "clt" | "simples";

export type Cost =
  | { mode: "pular" }
  /** `direct`: veio de um chip de valor, sem perguntar o número depois. */
  | { mode: "hora"; value: number | null; direct: boolean }
  | { mode: "salario"; value: number | null; regime: Regime | null };

export type Answers = {
  name: string | null;
  period: Period | null;
  runs: number | null;
  /** Sempre na ordem de STEP_KINDS. */
  kinds: StepKind[];
  kindsDone: boolean;
  minutes: Partial<Record<StepKind, number>>;
  /** Tipos cujos minutos vieram de um modelo e a pessoa ainda não mexeu. */
  fromModel: StepKind[];
  cost: Cost | null;
};

export function initialAnswers(): Answers {
  return { name: null, period: null, runs: null, kinds: [], kindsDone: false, minutes: {}, fromModel: [], cost: null };
}

export type NodeId = "name" | "period" | "runs" | "kinds" | "minutes" | "costMode" | "cost" | "regime" | "done";
export type Node = { id: NodeId; kind?: StepKind };

export const nodeKey = (n: Node): string => (n.kind ? `${n.id}:${n.kind}` : n.id);

/** A ordem fixa da conversa, com o que as respostas já dadas pedem a mais. */
export function plan(a: Answers): Node[] {
  const nodes: Node[] = [{ id: "name" }, { id: "period" }, { id: "runs" }, { id: "kinds" }];
  if (a.kindsDone) for (const kind of a.kinds) nodes.push({ id: "minutes", kind });
  nodes.push({ id: "costMode" });
  const cost = a.cost;
  if (cost && cost.mode === "hora" && !cost.direct) nodes.push({ id: "cost" });
  if (cost && cost.mode === "salario") nodes.push({ id: "cost" }, { id: "regime" });
  nodes.push({ id: "done" });
  return nodes;
}

export function isAnswered(n: Node, a: Answers): boolean {
  switch (n.id) {
    case "name":
      return a.name !== null;
    case "period":
      return a.period !== null;
    case "runs":
      return a.runs !== null;
    case "kinds":
      return a.kindsDone && a.kinds.length > 0;
    case "minutes":
      return n.kind !== undefined && a.minutes[n.kind] !== undefined;
    case "costMode":
      return a.cost !== null;
    case "cost":
      return a.cost !== null && a.cost.mode !== "pular" && a.cost.value !== null;
    case "regime":
      return a.cost !== null && a.cost.mode === "salario" && a.cost.regime !== null;
    case "done":
      return false;
  }
}

/** A primeira pergunta sem resposta; `done` quando acabou. */
export function currentNode(a: Answers): Node {
  return plan(a).find((n) => !isAnswered(n, a)) ?? { id: "done" };
}

const PERIOD_NOUN: Record<Period, string> = { dia: "dia", semana: "semana", mes: "mês" };
const EVERY: Record<Period, string> = { dia: "Todo dia", semana: "Toda semana", mes: "Todo mês" };
const PER: Record<Period, string> = { dia: "Por dia", semana: "Por semana", mes: "Por mês" };

const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const nbsp = (s: string) => s.replace(/[  ]/g, " ");

function money(v: number): string {
  return Number.isInteger(v) ? formatBRL(v) : formatBRL2(v);
}

export function question(n: Node, a: Answers): string {
  switch (n.id) {
    case "name":
      return "O que se repete?";
    case "period":
      return "Com que frequência?";
    case "runs":
      return `Quantas vezes por ${a.period ? PERIOD_NOUN[a.period] : "período"}?`;
    case "kinds":
      return "O que você faz nela?";
    case "minutes":
      return `Quanto leva ${n.kind ? (STEP_KINDS.find((k) => k.id === n.kind)?.short ?? "").toLowerCase() : ""}?`;
    case "costMode":
      return "E a hora de quem faz?";
    case "cost":
      return a.cost?.mode === "salario" ? "Qual o salário?" : "Qual o valor da hora?";
    case "regime":
      return "Regime da empresa?";
    case "done":
      return "";
  }
}

/** O que a pessoa "disse": o texto do balão da direita. */
export function answerText(n: Node, a: Answers): string | null {
  if (!isAnswered(n, a)) return null;
  switch (n.id) {
    case "name":
      return a.name;
    case "period":
      return a.period === null ? null : a.runs === null ? EVERY[a.period] : PER[a.period];
    case "runs":
      return a.runs === null ? null : nbsp(number.format(a.runs));
    case "kinds":
      return a.kinds.map((id) => STEP_KINDS.find((k) => k.id === id)?.short ?? id).join(", ");
    case "minutes":
      return n.kind ? formatMinutes(a.minutes[n.kind] as number) : null;
    case "costMode": {
      const c = a.cost;
      if (!c) return null;
      if (c.mode === "pular") return "Pular";
      if (c.mode === "salario") return "Salário";
      return c.direct && c.value !== null ? `${money(c.value)}/h` : "Outra hora";
    }
    case "cost": {
      const c = a.cost;
      if (!c || c.mode === "pular" || c.value === null) return null;
      return c.mode === "hora" ? `${money(c.value)}/h` : `${money(c.value)} por mês`;
    }
    case "regime":
      return a.cost?.mode === "salario" ? (a.cost.regime === "simples" ? "Simples" : "Lucro presumido ou real") : null;
    case "done":
      return null;
  }
}

export type Turn = { key: string; node: Node; question: string; answer: string | null };

/** Os balões: tudo até a primeira pergunta sem resposta, inclusive ela. */
export function turns(a: Answers): Turn[] {
  const out: Turn[] = [];
  for (const node of plan(a)) {
    if (node.id === "done") break;
    const answer = answerText(node, a);
    out.push({ key: nodeKey(node), node, question: question(node, a), answer });
    if (answer === null) break;
  }
  return out;
}

/**
 * Com a conversa completa os balões dão lugar a uma lista curta de respostas, cada uma tocável para
 * corrigir. Cada rótulo diz a que pergunta responde (os minutos levam o nome do tipo).
 */
export function summary(a: Answers): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  for (const node of plan(a)) {
    if (node.id === "done") break;
    const answer = answerText(node, a);
    if (answer === null) continue;
    const key = nodeKey(node);
    if (node.id === "runs") out.push({ key, label: a.runs === 1 ? "1 vez" : `${answer} vezes` });
    else if (node.id === "period") out.push({ key, label: a.period ? PER[a.period].toLowerCase() : answer });
    else if (node.id === "minutes") out.push({ key, label: `${STEP_KINDS.find((k) => k.id === node.kind)?.short ?? ""} ${answer}`.trim() });
    else out.push({ key, label: answer });
  }
  return out;
}

export type Action =
  | { type: "text"; text: string }
  | { type: "model"; label: string }
  | { type: "period"; value: Period }
  | { type: "runs"; value: number }
  | { type: "toggleKind"; kind: StepKind }
  | { type: "kindsDone" }
  | { type: "minutes"; value: number }
  | { type: "costMode"; mode: "hora" | "salario" | "pular" }
  | { type: "hourly"; value: number }
  | { type: "money"; value: number }
  | { type: "regime"; value: Regime }
  | { type: "rewind"; key: string }
  | { type: "reset" };

export const MESSAGES = {
  name: "Escreva o nome, ou toque num modelo.",
  duration: "Não entendi o tempo. Toque ou escreva, como 15 min.",
  durationRange: "O tempo vai de 30 segundos a 10 h. Quanto leva cada vez?",
  frequency: "Não entendi a frequência. Escreva, como 40 por semana.",
  frequencyRange: "Passa de 100 mil por mês. Escreva um número menor.",
  money: "Não entendi o valor. Escreva, como 3500.",
  hourRange: "A hora vai de R$ 1 a R$ 10 mil.",
  salaryRange: "O salário vai de R$ 1 a R$ 200 mil.",
  tap: "Toque numa das opções.",
  limits: "Esse volume passa dos limites da calculadora. Reduza as vezes ou o tempo.",
  unknown: "Não consegui usar essa resposta.",
} as const;

export type Applied = { answers: Answers; error: string | null };

const KIND_IDS = new Set<string>(STEP_KINDS.map((k) => k.id));

export function toInput(a: Answers): CalcInput {
  const steps = STEP_KINDS.filter((k) => a.kinds.includes(k.id) && a.minutes[k.id] !== undefined).map((k) => ({
    kind: k.id,
    minutes: a.minutes[k.id] as number,
  }));
  const cost = a.cost;
  let hourlyBRL: number | null = null;
  if (cost?.mode === "hora") hourlyBRL = cost.value;
  else if (cost?.mode === "salario" && cost.value !== null && cost.regime !== null) {
    hourlyBRL = hourlyFromSalary(cost.value, K.ENCARGOS[cost.regime]);
  }
  // Sem período ainda, a conta usa "mês" (o menor multiplicador): só serve para checar o teto.
  return { runs: a.runs, period: a.period ?? "mes", steps, hourlyBRL };
}

/** O resultado só existe com a conversa completa. */
export function resultOf(a: Answers): CalcResult | null {
  return currentNode(a).id === "done" ? calculate(toInput(a)) : null;
}

function withKinds(a: Answers, kinds: StepKind[]): Answers {
  const ordered = STEP_KINDS.map((k) => k.id).filter((id) => kinds.includes(id));
  const minutes: Partial<Record<StepKind, number>> = {};
  for (const id of ordered) if (a.minutes[id] !== undefined) minutes[id] = a.minutes[id];
  return { ...a, kinds: ordered, minutes, fromModel: a.fromModel.filter((id) => ordered.includes(id)) };
}

function setMinutes(a: Answers, kind: StepKind, value: number): Answers {
  return { ...a, minutes: { ...a.minutes, [kind]: value }, fromModel: a.fromModel.filter((id) => id !== kind) };
}

function fromModel(label: string): Answers | null {
  const preset = PRESETS.find((p) => p.label === label);
  if (!preset) return null;
  const minutes: Partial<Record<StepKind, number>> = {};
  for (const [min, kind] of preset.steps) minutes[kind] = (minutes[kind] ?? 0) + min;
  const kinds = STEP_KINDS.map((k) => k.id).filter((id) => minutes[id] !== undefined);
  return { ...initialAnswers(), name: preset.routine, kinds, kindsDone: true, minutes, fromModel: kinds };
}

function rewind(a: Answers, key: string): Answers {
  const [id, kind] = key.split(":") as [NodeId, StepKind | undefined];
  switch (id) {
    case "name":
      return { ...a, name: null };
    case "period":
      return { ...a, period: null };
    case "runs":
      return { ...a, runs: null };
    case "kinds":
      return { ...a, kindsDone: false };
    case "minutes":
      return kind && KIND_IDS.has(kind) ? { ...a, minutes: Object.fromEntries(Object.entries(a.minutes).filter(([k]) => k !== kind)), fromModel: a.fromModel.filter((k) => k !== kind) } : a;
    case "costMode":
      return { ...a, cost: null };
    case "cost":
      if (a.cost?.mode === "hora") return { ...a, cost: { mode: "hora", value: null, direct: false } };
      if (a.cost?.mode === "salario") return { ...a, cost: { ...a.cost, value: null } };
      return a;
    case "regime":
      return a.cost && a.cost.mode === "salario" ? { ...a, cost: { ...a.cost, regime: null } } : a;
    default:
      return a;
  }
}

function reject(a: Answers, error: string): Applied {
  return { answers: a, error };
}

function frequencyText(a: Answers, text: string): Applied {
  const f = parseFrequency(text);
  if (!f.ok) return reject(a, f.reason === "range" ? MESSAGES.frequencyRange : MESSAGES.frequency);
  return { answers: { ...a, runs: f.value.runs ?? a.runs, period: f.value.period ?? a.period }, error: null };
}

/** Aplica uma ação. Entrada ruim não muda nada: devolve as mesmas respostas e o texto do erro. */
export function apply(a: Answers, action: Action): Applied {
  const node = currentNode(a);
  let next: Answers;

  switch (action.type) {
    case "reset":
      return { answers: initialAnswers(), error: null };
    case "rewind":
      return { answers: rewind(a, action.key), error: null };
    case "model": {
      const m = fromModel(action.label);
      if (!m) return reject(a, MESSAGES.unknown);
      next = { ...m, period: a.period, runs: a.runs, cost: a.cost };
      break;
    }
    case "text": {
      if (node.id === "name") {
        const name = cleanName(action.text);
        if (name === null) return reject(a, MESSAGES.name);
        next = { ...a, name };
      } else if (node.id === "period" || node.id === "runs") {
        const r = frequencyText(a, action.text);
        if (r.error) return r;
        next = r.answers;
      } else if (node.id === "minutes" && node.kind) {
        const d = parseDuration(action.text);
        if (!d.ok) return reject(a, d.reason === "range" ? MESSAGES.durationRange : MESSAGES.duration);
        next = setMinutes(a, node.kind, d.value);
      } else if (node.id === "cost" && a.cost && a.cost.mode !== "pular") {
        const hora = a.cost.mode === "hora";
        const m = parseMoney(action.text, hora ? K.MAX_BRL_HOUR : K.MAX_SALARY);
        if (!m.ok) return reject(a, m.reason === "range" ? (hora ? MESSAGES.hourRange : MESSAGES.salaryRange) : MESSAGES.money);
        next = { ...a, cost: { ...a.cost, value: m.value } };
      } else {
        return reject(a, MESSAGES.tap);
      }
      break;
    }
    case "period":
      next = { ...a, period: action.value };
      break;
    case "runs":
      if (!Number.isFinite(action.value) || action.value <= 0) return reject(a, MESSAGES.frequency);
      next = { ...a, runs: action.value };
      break;
    case "toggleKind": {
      if (!KIND_IDS.has(action.kind)) return reject(a, MESSAGES.unknown);
      const has = a.kinds.includes(action.kind);
      next = withKinds({ ...a, kindsDone: false }, has ? a.kinds.filter((k) => k !== action.kind) : [...a.kinds, action.kind]);
      break;
    }
    case "kindsDone":
      if (a.kinds.length === 0) return reject(a, MESSAGES.tap);
      next = { ...a, kindsDone: true };
      break;
    case "minutes": {
      if (node.id !== "minutes" || !node.kind) return reject(a, MESSAGES.tap);
      const d = parseDuration(String(action.value));
      if (!d.ok) return reject(a, MESSAGES.durationRange);
      next = setMinutes(a, node.kind, d.value);
      break;
    }
    case "costMode":
      next =
        action.mode === "pular"
          ? { ...a, cost: { mode: "pular" } }
          : action.mode === "hora"
            ? { ...a, cost: { mode: "hora", value: null, direct: false } }
            : { ...a, cost: { mode: "salario", value: null, regime: null } };
      break;
    case "hourly":
      if (!(action.value > 0 && action.value <= K.MAX_BRL_HOUR)) return reject(a, MESSAGES.hourRange);
      next = { ...a, cost: { mode: "hora", value: action.value, direct: true } };
      break;
    case "money": {
      if (!a.cost || a.cost.mode === "pular") return reject(a, MESSAGES.tap);
      const max = a.cost.mode === "hora" ? K.MAX_BRL_HOUR : K.MAX_SALARY;
      if (!(action.value > 0 && action.value <= max)) return reject(a, a.cost.mode === "hora" ? MESSAGES.hourRange : MESSAGES.salaryRange);
      next = { ...a, cost: { ...a.cost, value: action.value } };
      break;
    }
    case "regime":
      if (!a.cost || a.cost.mode !== "salario") return reject(a, MESSAGES.tap);
      next = { ...a, cost: { ...a.cost, regime: action.value } };
      break;
  }

  if (next.runs !== null && !runsFit(next.runs, next.period)) return reject(a, MESSAGES.frequencyRange);
  if (calculate(toInput(next)).status === "invalid") return reject(a, MESSAGES.limits);
  return { answers: next, error: null };
}

export type Chip = { key: string; label: string; pressed?: boolean; action: Action };

export type Composer = { placeholder: string; inputMode: "text" | "decimal"; label: string } | null;

const MINUTE_CHIPS: readonly [string, number][] = [
  ["1 min", 1],
  ["2 min", 2],
  ["5 min", 5],
  ["10 min", 10],
  ["30 min", 30],
  ["1 h", 60],
  ["3 h", 180],
];

/** Respostas de um toque da pergunta da vez. */
export function chips(a: Answers, node: Node = currentNode(a)): Chip[] {
  switch (node.id) {
    case "name":
      return PRESETS.map((p) => ({ key: p.label, label: p.label, action: { type: "model", label: p.label } }));
    case "period":
      return (["dia", "semana", "mes"] as const).map((p) => ({
        key: p,
        label: a.runs === null ? EVERY[p] : PER[p],
        action: { type: "period", value: p },
      }));
    case "runs":
      return [1, 5, 10, 20, 50].map((n) => ({ key: String(n), label: String(n), action: { type: "runs", value: n } }));
    case "kinds":
      return STEP_KINDS.map((k) => ({
        key: k.id,
        label: k.short,
        pressed: a.kinds.includes(k.id),
        action: { type: "toggleKind", kind: k.id },
      }));
    case "minutes":
      return MINUTE_CHIPS.map(([label, value]) => ({ key: label, label, action: { type: "minutes", value } }));
    case "costMode":
      return [
        ...[20, 40, 60].map((v): Chip => ({ key: `h${v}`, label: `R$ ${v}/h`, action: { type: "hourly", value: v } })),
        { key: "hora", label: "Outra hora", action: { type: "costMode", mode: "hora" } },
        { key: "salario", label: "Salário", action: { type: "costMode", mode: "salario" } },
        { key: "pular", label: "Pular", action: { type: "costMode", mode: "pular" } },
      ];
    case "cost":
      return a.cost?.mode === "salario"
        ? [2000, 3500, 5000].map((v) => ({ key: String(v), label: formatBRL(v), action: { type: "money", value: v } }))
        : [];
    case "regime":
      return [
        { key: "simples", label: "Simples", action: { type: "regime", value: "simples" } },
        { key: "clt", label: "Lucro presumido ou real", action: { type: "regime", value: "clt" } },
      ];
    case "done":
      return [];
  }
}

/** A caixa de texto da pergunta da vez (`null` = a pergunta só aceita toque). */
export function composer(a: Answers, node: Node = currentNode(a)): Composer {
  switch (node.id) {
    case "name":
      return { placeholder: "Conferir notas fiscais", inputMode: "text", label: "Tarefa" };
    case "period":
    case "runs":
      return { placeholder: "40 por semana", inputMode: "text", label: "Frequência" };
    case "minutes":
      return { placeholder: "15 min", inputMode: "text", label: "Tempo" };
    case "cost":
      return { placeholder: a.cost?.mode === "salario" ? "3500" : "27", inputMode: "decimal", label: a.cost?.mode === "salario" ? "Salário" : "Hora" };
    default:
      return null;
  }
}

/* ------------------------------ persistência ------------------------------ */

export type Stored = { v: 3; answers: Answers };

const PERIODS = new Set<string>(["dia", "semana", "mes"]);

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

const finite = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

function sanitizeCost(raw: unknown): Cost | null | undefined {
  if (raw === null) return null;
  if (!isRecord(raw)) return undefined;
  const value = raw.value === null ? null : finite(raw.value) ? raw.value : undefined;
  if (raw.mode === "pular") return { mode: "pular" };
  if (raw.mode === "hora") {
    if (value === undefined || (value !== null && !(value > 0 && value <= K.MAX_BRL_HOUR)) || typeof raw.direct !== "boolean") return undefined;
    if (raw.direct && value === null) return undefined;
    return { mode: "hora", value, direct: raw.direct };
  }
  if (raw.mode === "salario") {
    if (value === undefined || (value !== null && !(value > 0 && value <= K.MAX_SALARY))) return undefined;
    if (raw.regime !== null && raw.regime !== "clt" && raw.regime !== "simples") return undefined;
    return { mode: "salario", value, regime: raw.regime };
  }
  return undefined;
}

/** Lê o que veio do storage. Qualquer coisa fora do formato derruba tudo e volta null. */
export function sanitize(raw: unknown): Answers | null {
  if (!isRecord(raw) || raw.v !== 3 || !isRecord(raw.answers)) return null;
  const r = raw.answers;

  let name: string | null = null;
  if (r.name !== null) {
    if (typeof r.name !== "string") return null;
    name = cleanName(r.name);
  }
  if (r.period !== null && (typeof r.period !== "string" || !PERIODS.has(r.period))) return null;
  if (r.runs !== null && !(finite(r.runs) && r.runs > 0)) return null;
  if (!Array.isArray(r.kinds) || !r.kinds.every((k) => typeof k === "string" && KIND_IDS.has(k))) return null;
  if (new Set(r.kinds).size !== r.kinds.length) return null;
  if (typeof r.kindsDone !== "boolean" || !isRecord(r.minutes) || !Array.isArray(r.fromModel)) return null;

  const kinds = STEP_KINDS.map((k) => k.id).filter((id) => (r.kinds as string[]).includes(id));
  const minutes: Partial<Record<StepKind, number>> = {};
  for (const [kind, value] of Object.entries(r.minutes)) {
    if (!KIND_IDS.has(kind) || !kinds.includes(kind as StepKind)) return null;
    if (!finite(value) || value < K.MIN_MINUTES_STEP || value > K.MAX_MINUTES_STEP) return null;
    minutes[kind as StepKind] = value;
  }
  if (!r.fromModel.every((k) => typeof k === "string" && kinds.includes(k as StepKind))) return null;
  const cost = sanitizeCost(r.cost);
  if (cost === undefined) return null;

  const answers: Answers = {
    name,
    period: r.period as Period | null,
    runs: r.runs as number | null,
    kinds,
    kindsDone: r.kindsDone && kinds.length > 0,
    minutes,
    fromModel: r.fromModel as StepKind[],
    cost,
  };
  if (answers.runs !== null && !runsFit(answers.runs, answers.period)) return null;
  return calculate(toInput(answers)).status === "invalid" ? null : answers;
}
