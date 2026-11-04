import type { Lead, ReportModel } from "./report";

/**
 * E-mail do relatório (para o lead) e aviso para a equipe. HTML em tabelas, 600 px, cores literais
 * (e-mail não tem variável CSS), fonte do sistema com Georgia nos números. Sem imagem, sem rastreio.
 */
const INK = "#0c0b0a";
const PAPER = "#f4f3f0";
const LINE = "#d9d5cc";
const MUTED = "#4a463f";
const ACCENT = "#fc5f02";
const RUST = "#b83c12";
const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

const td = (inner: string, style = "") => `<td style="font-family:${SANS};font-size:15px;line-height:1.5;color:${INK};${style}">${inner}</td>`;
const h = (text: string) =>
  `<p style="margin:28px 0 10px;font-family:${SANS};font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};font-weight:600">${esc(text)}</p>`;

export function reportEmail(r: ReportModel): { html: string; text: string } {
  const rows = r.rows
    .map(
      (x) =>
        `<tr>${td(`<strong>${esc(x.label)}</strong><br><span style="color:${MUTED};font-size:13px">${esc(x.time)} · ${esc(x.freq)}</span>`, `padding:12px 8px 12px 0;border-bottom:1px solid ${LINE}`)}${td(esc(x.hoursNow), `padding:12px 8px;border-bottom:1px solid ${LINE};white-space:nowrap`)}${td(esc(x.hoursBack), `padding:12px 8px;border-bottom:1px solid ${LINE};white-space:nowrap`)}${td(`<strong>${esc(x.brlYear)}</strong>`, `padding:12px 0 12px 8px;border-bottom:1px solid ${LINE};text-align:right`)}</tr>`,
    )
    .join("");

  const body = `
<p style="margin:0 0 4px;font-family:${SANS};font-size:12px;color:${MUTED}">Relatório nº ${esc(r.id)} · ${esc(r.dateLabel)}</p>
<p style="margin:0 0 20px;font-family:${SANS};font-size:16px;color:${INK}">Olá, ${esc(r.firstName)}. A conta da ${esc(r.company)}:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};border-radius:12px"><tr><td style="padding:28px 24px;font-family:${SANS};color:${PAPER}">
<p style="margin:0 0 6px;font-size:13px;color:#cbc8c0">Devolvidos por ano, até</p>
<p style="margin:0;font-family:${SERIF};font-size:44px;line-height:1.1;color:#ffffff">${esc(r.headline.ceiling)}</p>
<p style="margin:10px 0 0;font-size:15px;color:#ffffff">Prudente: <strong>${esc(r.headline.prudent)}</strong></p>
<p style="margin:14px 0 0;font-size:14px;color:#cbc8c0">${esc(r.headline.hoursBack)} · ${esc(r.headline.people)}<br>${esc(r.headline.share)}<br>Em 3 anos: ${esc(r.headline.threeYears)}</p>
</td></tr></table>

${h("A conta por rotina")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>${td("Rotina", `font-size:12px;color:${MUTED};padding:0 8px 6px 0`)}${td("Hoje", `font-size:12px;color:${MUTED};padding:0 8px 6px`)}${td("Voltam", `font-size:12px;color:${MUTED};padding:0 8px 6px`)}${td("Por ano", `font-size:12px;color:${MUTED};padding:0 0 6px 8px;text-align:right`)}</tr>
${rows}
<tr>${td("<strong>Total</strong>", "padding:12px 8px 0 0")}${td(`<strong>${esc(r.totals.hoursNow)}</strong>`, "padding:12px 8px 0;white-space:nowrap")}${td(`<strong>${esc(r.totals.hoursBack)}</strong>`, "padding:12px 8px 0;white-space:nowrap")}${td(`<strong>${esc(r.totals.brlYear)}</strong>`, "padding:12px 0 0 8px;text-align:right")}</tr>
</table>
<p style="margin:8px 0 0;font-family:${SANS};font-size:13px;color:${MUTED}">Horas por mês. ${esc(r.sensitivity)}</p>

${h("Como chegamos")}
${r.how.map((t) => `<p style="margin:0 0 8px;font-family:${SANS};font-size:14px;line-height:1.55;color:${INK}">${esc(t)}</p>`).join("")}

${h("Teto de investimento")}
<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.55;color:${INK}">Se a implantação custar até <strong>${esc(r.invest.m12)}</strong> o prudente paga em 12 meses; até <strong>${esc(r.invest.m24)}</strong>, em 24.</p>

${h("Fora da conta")}
<ul style="margin:0;padding-left:20px;font-family:${SANS};font-size:14px;line-height:1.6;color:${INK}">${r.outside.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>

${h("Fontes")}
<ul style="margin:0;padding-left:20px;font-family:${SANS};font-size:14px;line-height:1.6;color:${INK}">${r.sources.map((s) => `<li><a href="${esc(s.url)}" style="color:${RUST}">${esc(s.name)}, ${s.year}</a>: ${esc(s.note)}</li>`).join("")}</ul>
<p style="margin:10px 0 0;font-family:${SANS};font-size:13px;line-height:1.55;color:${MUTED}">${esc(r.limits)}</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0 8px"><tr><td style="background:${ACCENT};border-radius:999px"><a href="${esc(r.whatsappText)}" style="display:inline-block;padding:15px 28px;font-family:${SANS};font-size:16px;font-weight:600;color:${INK};text-decoration:none">Falar no WhatsApp</a></td></tr></table>
<p style="margin:0;font-family:${SANS};font-size:14px;color:${MUTED}">Ou responda este e-mail. <a href="${esc(r.reportUrl)}" style="color:${RUST}">Abrir o relatório na página</a>. O PDF segue em anexo.</p>`;

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(r.subject)}</title></head>
<body style="margin:0;padding:0;background:${PAPER}"><span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(r.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px"><tr><td style="padding:28px 28px 24px">
<p style="margin:0 0 24px;font-family:${SERIF};font-size:22px;color:${INK}">Procemiza</p>
${body}
<p style="margin:28px 0 0;padding-top:16px;border-top:1px solid ${LINE};font-family:${SANS};font-size:12px;line-height:1.55;color:${MUTED}">Você recebeu este relatório porque pediu em procemiza.com.br/calculadora. Constantes de custo conferidas em ${esc(r.vigencia)}. Para apagar seus dados, responda este e-mail. <a href="https://www.procemiza.com.br/privacidade" style="color:${MUTED}">Privacidade</a>.</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [
    `Relatório nº ${r.id} · ${r.dateLabel}`,
    `Olá, ${r.firstName}. A conta da ${r.company}:`,
    "",
    `Devolvidos por ano, até ${r.headline.ceiling}. Prudente: ${r.headline.prudent}.`,
    `${r.headline.hoursBack} · ${r.headline.people} · ${r.headline.share}`,
    `Em 3 anos: ${r.headline.threeYears}`,
    "",
    "A CONTA POR ROTINA (horas por mês)",
    ...r.rows.map((x) => `- ${x.label}, ${x.time}, ${x.freq}: hoje ${x.hoursNow}, voltam ${x.hoursBack}, por ano ${x.brlYear}`),
    `Total: hoje ${r.totals.hoursNow}, voltam ${r.totals.hoursBack}, por ano ${r.totals.brlYear}`,
    r.sensitivity,
    "",
    "COMO CHEGAMOS",
    ...r.how,
    "",
    "TETO DE INVESTIMENTO",
    `Até ${r.invest.m12} o prudente paga em 12 meses; até ${r.invest.m24}, em 24.`,
    "",
    "FORA DA CONTA",
    ...r.outside.map((t) => `- ${t}`),
    "",
    "FONTES",
    ...r.sources.map((s) => `- ${s.name}, ${s.year}: ${s.url}`),
    r.limits,
    "",
    `WhatsApp: ${r.whatsappText}`,
    `Relatório na página: ${r.reportUrl}`,
    "O PDF segue em anexo. Responda este e-mail para falar com a gente.",
  ].join("\n");

  return { html, text };
}

/** Aviso interno: tudo o que a pessoa digitou e o resultado, com a marca de lead quente no assunto. */
export function teamEmail(r: ReportModel, lead: Lead): { subject: string; text: string } {
  const hot = lead.wantsContact;
  return {
    subject: `${hot ? "[Quente] " : ""}${lead.name} · ${lead.company} · até ${r.headline.ceiling}/ano`,
    text: [
      `Relatório ${r.id}`,
      `Quer falar: ${hot ? "SIM" : "não"}`,
      `Nome: ${lead.name}`,
      `E-mail: ${lead.email}`,
      `Empresa: ${lead.company}`,
      `WhatsApp: ${lead.whatsapp || "não informado"}`,
      "",
      `Até ${r.headline.ceiling}/ano (prudente ${r.headline.prudent})`,
      ...r.rows.map((x) => `- ${x.label}, ${x.time}, ${x.freq}: voltam ${x.hoursBack}, ${x.brlYear}/ano`),
      ...r.how,
      "",
      `Relatório: ${r.reportUrl}`,
    ].join("\n"),
  };
}
