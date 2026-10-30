import { formatBRL, formatHours, formatPercent } from "./format";

export const ROUTINE_MAX = 80;
export const MESSAGE_MAX = 600;

export type WhatsAppContext = {
  routine?: string;
  /** Quantos passos o processo tem. */
  steps?: number;
  /** Horas devolvidas por mês. */
  hoursReturned?: number;
  brlMonth?: number | null;
  /** Parte do tempo que volta, 0..1. Sai da conta. */
  share?: number;
};

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
  if (!ctx.hoursReturned || ctx.hoursReturned <= 0) {
    text = routine
      ? `Olá! Quero conversar sobre automatizar esta rotina: "${routine}".`
      : "Olá! Quero conversar sobre automatizar uma rotina da minha empresa.";
  } else {
    const size = ctx.steps && ctx.steps > 1 ? ` (${ctx.steps} passos)` : "";
    const gain = [`${formatHours(ctx.hoursReturned)} h/mês`];
    if (ctx.share !== undefined) gain.push(`${formatPercent(ctx.share)} do tempo`);
    if (ctx.brlMonth) gain.push(`${formatBRL(ctx.brlMonth)}/mês`);
    const what = routine ? `o processo "${routine}"` : "um processo";
    text = `Olá! Simulei no site ${what}${size}. A automação devolve cerca de ${joinPt(gain)}. Quero conversar sobre isso.`;
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
