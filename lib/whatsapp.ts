import { formatBRL, formatHours, formatPercent } from "./format";

export const ROUTINE_MAX = 80;
export const MESSAGE_MAX = 600;

/** Cada número vai como faixa: piso e teto da conta. */
export type Range = { low: number; high: number };

export type WhatsAppContext = {
  routine?: string;
  /** Quantos passos o processo tem. */
  steps?: number;
  /** Horas devolvidas por mês. */
  hours?: Range;
  brlMonth?: Range | null;
  /** Parte do tempo que volta, 0..1. Sai da conta. */
  share?: Range;
};

/** "20 e 27", ou só "20" quando os dois arredondam igual. */
function between(range: Range, format: (n: number) => string, join: string): string {
  const low = format(range.low);
  const high = format(range.high);
  return low === high ? low : `${low}${join}${high}`;
}

/** ["a"] → "a"; ["a", "b", "c"] → "a, b e c". */
function joinPt(parts: string[]): string {
  return parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
}

/** Uma linha, sem controle, com teto. Nunca vai para o GA. */
export function cleanRoutine(raw: string): string {
  const s = raw.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  return s.length > ROUTINE_MAX ? `${s.slice(0, ROUTINE_MAX).trimEnd()}…` : s;
}

export function buildMessage(ctx: WhatsAppContext = {}): string {
  const routine = cleanRoutine(ctx.routine ?? "");
  let text: string;
  if (!ctx.hours || !(ctx.hours.high > 0)) {
    text = routine
      ? `Olá! Quero conversar sobre automatizar esta rotina: "${routine}".`
      : "Olá! Quero conversar sobre automatizar uma rotina da minha empresa.";
  } else {
    const size = ctx.steps && ctx.steps > 1 ? ` (${ctx.steps} passos)` : "";
    const hours = between(ctx.hours, formatHours, " a ");
    const gain = [`${hours} h/mês`];
    if (ctx.share) gain.push(`${between(ctx.share, formatPercent, " a ")} do tempo`);
    if (ctx.brlMonth && ctx.brlMonth.high > 0) gain.push(`${between(ctx.brlMonth, formatBRL, " a ")}/mês`);
    const what = routine ? `o processo "${routine}"` : "um processo";
    text = `Olá! Simulei no site ${what}${size}. A automação devolve ${hours === formatHours(ctx.hours.low) && formatHours(ctx.hours.low) === formatHours(ctx.hours.high) ? "cerca de " : ""}${joinPt(gain)}. Quero conversar sobre isso.`;
  }
  return text.slice(0, MESSAGE_MAX);
}

/** `base` = https://wa.me/<número>, sem query. */
export function buildWhatsAppUrl(base: string, ctx?: WhatsAppContext): string {
  return `${base}?text=${encodeURIComponent(buildMessage(ctx))}`;
}

/** "https://wa.me/555494898181" → "+55 54 9489-8181". Fora do padrão brasileiro volta só com "+". */
export function formatPhone(contactUrl: string): string {
  const digits = contactUrl.replace(/\D/g, "");
  const match = digits.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `+55 ${match[1]} ${match[2]}-${match[3]}` : `+${digits}`;
}
