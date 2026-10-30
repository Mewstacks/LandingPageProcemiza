import { formatBRL, formatHours } from "./format";

export const ROUTINE_MAX = 80;
export const MESSAGE_MAX = 600;

export type WhatsAppContext = {
  routine?: string;
  /** Horas devolvidas por mês no cenário esperado. */
  hoursReturned?: number;
  brlMonth?: number | null;
  pct?: number;
};

/** Uma linha, sem controle, com teto. Nunca vai para o GA. */
export function cleanRoutine(raw: string): string {
  const s = raw.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  return s.length > ROUTINE_MAX ? `${s.slice(0, ROUTINE_MAX).trimEnd()}…` : s;
}

export function buildMessage(ctx: WhatsAppContext = {}): string {
  const routine = cleanRoutine(ctx.routine ?? "");
  let text: string;
  if (!routine || !ctx.hoursReturned || ctx.hoursReturned <= 0) {
    text = routine
      ? `Olá! Quero conversar sobre automatizar esta rotina: "${routine}".`
      : "Olá! Quero conversar sobre automatizar uma rotina da minha empresa.";
  } else {
    const pct = Math.round((ctx.pct ?? 0.8) * 100);
    const money = ctx.brlMonth ? ` (${formatBRL(ctx.brlMonth)}/mês)` : "";
    text =
      `Olá! Simulei no site a rotina "${routine}". Automatizando ${pct}%, ` +
      `devolve cerca de ${formatHours(ctx.hoursReturned)} h/mês${money}. Quero conversar sobre isso.`;
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
