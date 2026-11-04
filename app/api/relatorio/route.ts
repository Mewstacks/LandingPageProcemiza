import { after } from "next/server";
import { sendToCrmew } from "@/lib/crmew";
import { reportEmail, teamEmail } from "@/lib/email";
import { looksLikeBot, parseLeadRequest } from "@/lib/lead";
import { reportPdf } from "@/lib/pdf";
import { buildReport } from "@/lib/report";
import { DEFAULT_FROM_EMAIL, getResend } from "@/lib/resend";
import { site } from "@/content/site";
import { allow } from "@/lib/ratelimit";

/**
 * Único trecho dinâmico do site: recebe a simulação e o lead, recalcula tudo no servidor, manda o
 * relatório (e-mail + PDF) para a pessoa, avisa a equipe e registra no CRMew. O e-mail da equipe
 * carrega a simulação inteira: se o CRMew cair, nada se perde. Nada pessoal vai para o log.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BODY = 8 * 1024;
const json = (status: number, body: Record<string, unknown>) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return host === "www.procemiza.com.br" || host === "procemiza.com.br" || host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

async function turnstileOk(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(4000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!originAllowed(req)) return json(403, { error: "origin" });
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, { error: "size" });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "json" });
  }

  const parsed = parseLeadRequest(body);
  if (!parsed.ok) return json(400, { error: "invalid", field: parsed.field });
  const { plan, lead, trap, turnstile } = parsed.value;

  // Robô recebe "ok" e nada acontece: não ensina o que o barrou.
  if (looksLikeBot(trap)) return json(200, { ok: true });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!allow(`ip:${ip ?? "?"}`, 20, 3_600_000) || !allow(`mail:${lead.email}`, 3, 3_600_000)) return json(429, { error: "rate" });
  if (!(await turnstileOk(turnstile, ip))) return json(400, { error: "challenge" });

  const resend = getResend();
  const team = process.env.LEADS_TO_EMAIL;
  if (!resend || !team) return json(503, { error: "unavailable" });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? site.domain;
  const report = buildReport(plan, lead, new Date(), origin, site.contactUrl);
  if (!report) return json(400, { error: "invalid", field: "plan" });

  const replyTo = process.env.REPLY_TO_EMAIL ?? team;
  const notice = teamEmail(report, lead);

  // 1) a equipe primeiro: é a rede de segurança.
  const toTeam = await resend.emails.send(
    { from: DEFAULT_FROM_EMAIL, to: team, subject: notice.subject, text: notice.text, replyTo: lead.email },
    { idempotencyKey: `report-team/${report.id}` },
  );
  if (toTeam.error) return json(502, { error: "send" });

  // 2) a pessoa: e-mail + PDF. Se o PDF falhar, o e-mail sai igual, com o link da página.
  const { html, text } = reportEmail(report);
  let pdf: Buffer | null = null;
  try {
    pdf = await reportPdf(report);
  } catch {
    pdf = null;
  }
  const toLead = await resend.emails.send(
    {
      from: DEFAULT_FROM_EMAIL,
      to: lead.email,
      replyTo,
      subject: report.subject,
      html,
      text,
      ...(pdf ? { attachments: [{ filename: `relatorio-procemiza-${report.id}.pdf`, content: pdf }] } : {}),
    },
    { idempotencyKey: `report-lead/${report.id}` },
  );
  if (toLead.error) return json(502, { error: "send" });

  // 3) CRMew depois da resposta: não segura a tela, e falhar não derruba nada.
  after(async () => {
    await sendToCrmew(report, lead);
  });

  return json(200, { ok: true, id: report.id });
}
