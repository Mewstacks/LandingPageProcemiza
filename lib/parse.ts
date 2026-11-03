import { K, type Period } from "./calculator";
import { parseDecimalPtBR } from "./format";

/**
 * Leitura do que a pessoa escreve na conversa. Pura: texto entra, número sai, ou o motivo da recusa.
 * Regra de ouro: na dúvida, recusa. Ler "a cada 2 dias" como "2 por dia" seria uma conta errada
 * sem aviso; recusar só custa um toque num chip.
 */
export type Reason = "unreadable" | "range";
export type Parsed<T> = { ok: true; value: T } | { ok: false; reason: Reason };

const bad = (reason: Reason): { ok: false; reason: Reason } => ({ ok: false, reason });
const good = <T>(value: T): Parsed<T> => ({ ok: true, value });

/** Acima disto o texto não é uma resposta curta; também protege as expressões regulares. */
const MAX_INPUT = 60;

/** Minúsculas, sem acento, sem espaço de largura zero, algarismos largos viram comuns, espaços colapsados. */
export function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[​-‍⁠﻿]/g, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const NUMBER = "\\d+(?:[.,]\\d+)?";

/** "1.000" é mil, "1,5" e "1.5" são um e meio. */
function toNumber(text: string): number {
  if (/^\d{1,3}(\.\d{3})+$/.test(text)) return Number(text.replace(/\./g, ""));
  return Number(text.replace(",", "."));
}

const WORDS: Record<string, string> = {
  um: "1",
  uma: "1",
  dois: "2",
  duas: "2",
  tres: "3",
  quatro: "4",
  cinco: "5",
  seis: "6",
  sete: "7",
  oito: "8",
  nove: "9",
  dez: "10",
};

const HOUR = "(?:h|hr|hrs|hora|horas)";
const MINUTE = "(?:m|min|mins|minuto|minutos)";

function minutesInRange(minutes: number): Parsed<number> {
  if (!Number.isFinite(minutes) || minutes < K.MIN_MINUTES_STEP || minutes > K.MAX_MINUTES_STEP) return bad("range");
  return good(minutes);
}

/** Minutos por execução: "15", "1h30", "1,5 h", "meia hora", "duas horas", "1:30". */
export function parseDuration(text: string): Parsed<number> {
  if (text.length > MAX_INPUT) return bad("unreadable");
  let s = normalize(text);
  s = s.replace(/^(uns|umas|cerca de|mais ou menos|aprox\.?|~)\s*/, "").replace(/\s*(por vez|cada vez|cada)$/, "");
  s = s.replace(/\b(um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\b/g, (w) => WORDS[w]);
  if (s === "") return bad("unreadable");

  if (s === "meia hora") return minutesInRange(30);
  if (s === "hora e meia") return minutesInRange(90);

  let m = new RegExp(`^(${NUMBER}) ?${HOUR} e meia$`).exec(s);
  if (m) return minutesInRange(toNumber(m[1]) * 60 + 30);

  m = /^(\d+):(\d{2})$/.exec(s);
  if (m) return Number(m[2]) < 60 ? minutesInRange(Number(m[1]) * 60 + Number(m[2])) : bad("unreadable");

  m = new RegExp(`^(\\d+) ?${HOUR} ?(?:e )?(\\d+) ?${MINUTE}?$`).exec(s);
  if (m) return Number(m[2]) < 60 ? minutesInRange(Number(m[1]) * 60 + Number(m[2])) : bad("unreadable");

  m = new RegExp(`^(${NUMBER}) ?${HOUR}$`).exec(s);
  if (m) return minutesInRange(toNumber(m[1]) * 60);

  m = new RegExp(`^(${NUMBER}) ?${MINUTE}$`).exec(s);
  if (m) return minutesInRange(toNumber(m[1]));

  m = new RegExp(`^(${NUMBER})$`).exec(s);
  if (m) return minutesInRange(toNumber(m[1]));

  return bad("unreadable");
}

export type Frequency = { runs: number | null; period: Period | null };

const PERIOD_WORDS: readonly [Period, RegExp][] = [
  ["dia", /\b(dia|dias|diario|diaria|diarios|diariamente)\b/],
  ["semana", /\b(semana|semanas|semanal|semanalmente|segunda|terca|quarta|quinta|sexta)\b/],
  ["mes", /\b(mes|meses|mensal|mensalmente)\b/],
];

const ADVERB = /\b(diariamente|semanalmente|mensalmente|diario|diaria|semanal|mensal)\b/;

/**
 * Quantas vezes e em que período: "40 por semana", "3x ao dia", "todo dia", "toda segunda".
 * Só o número ("40") ou só o período ("por semana") também vale: a conversa pergunta o que falta.
 */
export function parseFrequency(text: string): Parsed<Frequency> {
  if (text.length > MAX_INPUT) return bad("unreadable");
  const s = normalize(text).replace(/^(uns|umas|cerca de|mais ou menos)\s*/, "");
  if (s === "") return bad("unreadable");
  // "-3" ou "1-2": o sinal e a faixa se perdem ao procurar o número, então recusa em vez de ler "3".
  if (/[-−–—]\s*\d/.test(s)) return bad("unreadable");

  const periods = PERIOD_WORDS.filter(([, word]) => word.test(s)).map(([period]) => period);
  if (periods.length > 1) return bad("unreadable");
  const period = periods[0] ?? null;

  const numbers = s.match(new RegExp(NUMBER, "g")) ?? [];
  if (numbers.length > 1) return bad("unreadable");

  let runs: number | null = null;
  if (numbers.length === 1) {
    // "a cada 2 dias", "durante 2 dias", "todo dia 5", "de 2 em 2 dias": o número não é a frequência.
    if (/\b(cada|durante|todo|toda|todos|todas)\b/.test(s) || /\bde \d+ em \d+\b/.test(s)) return bad("unreadable");
    if (period === null && !new RegExp(`^${NUMBER} ?(?:x|vez|vezes)?$`).test(s)) return bad("unreadable");
    runs = toNumber(numbers[0]);
  } else if (period !== null && (/^(todo|toda|todos|todas)\b/.test(s) || ADVERB.test(s))) {
    runs = 1;
  } else if (period === null) {
    return bad("unreadable");
  }

  if (runs !== null) {
    if (!Number.isFinite(runs) || runs <= 0) return bad("range");
    if (!runsFit(runs, period)) return bad("range");
  }
  return good({ runs, period });
}

/** Cabe no teto de execuções por mês? Sem período, só o teto bruto. */
export function runsFit(runs: number, period: Period | null): boolean {
  const perMonth = period === "dia" ? runs * K.WORKDAYS_MONTH : period === "semana" ? runs * K.WEEKS_MONTH : runs;
  return Number.isFinite(perMonth) && perMonth > 0 && perMonth <= K.MAX_RUNS_MONTH;
}

/** Reais: "3500", "3.500", "R$ 3.500,50", "3,5 mil". Maior que zero e até `max`. */
export function parseMoney(text: string, max: number): Parsed<number> {
  if (text.length > MAX_INPUT) return bad("unreadable");
  const s = normalize(text)
    .replace(/r\$|reais|real|por hora|\/ ?h\b|a hora|mensais|por mes/g, "")
    .replace(/\s+/g, "")
    .trim();
  if (s === "") return bad("unreadable");

  let value: number | null;
  if (s.endsWith("mil")) {
    const base = parseDecimalPtBR(s.slice(0, -3));
    value = base === null ? null : base * 1000;
  } else {
    value = parseDecimalPtBR(s);
  }
  if (value === null || !Number.isFinite(value)) return bad("unreadable");
  if (value <= 0 || value > max) return bad("range");
  return good(value);
}

export const NAME_MAX = 80;

/** Nome da tarefa: sem controle nem largura zero, espaços colapsados, até 80 caracteres. Vazio vira null. */
export function cleanName(text: string): string | null {
  const s = text
    .normalize("NFC")
    .replace(/[​-‍⁠﻿]/g, "")
    .replace(/\p{Cc}/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (s === "") return null;
  const chars = Array.from(s);
  return chars.length > NAME_MAX ? chars.slice(0, NAME_MAX).join("").trim() : s;
}
