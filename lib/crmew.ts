import type { ReportModel, Lead } from "./report";

/**
 * Registro do lead no CRMew (`POST /ingest/v1/intake/leads`, chave só de escrita, idempotente por
 * `response_id`). Sem as variáveis de ambiente, não faz nada: o e-mail da equipe é a rede de segurança.
 * O endpoint novo vive no repositório do CRMew; este é o contrato do lado do site.
 */
export type CrmResult = "sent" | "skipped" | "failed";

export function crmewPayload(r: ReportModel, lead: Lead, formId: string) {
  return {
    form_id: formId,
    response_id: r.id,
    lead: {
      company: lead.company,
      contact_name: lead.name,
      contact_email: lead.email,
      contact_phone: lead.whatsapp ?? "",
      wants_contact: lead.wantsContact,
      origin: "site",
      value_year_prudent: r.headline.prudent,
      value_year_ceiling: r.headline.ceiling,
      notes: [`Relatório ${r.id}`, ...r.rows.map((x) => `${x.label}, ${x.time}, ${x.freq}: voltam ${x.hoursBack}, ${x.brlYear}/ano`), ...r.how, r.reportUrl].join("\n"),
    },
  };
}

export async function sendToCrmew(r: ReportModel, lead: Lead, env: Record<string, string | undefined> = process.env): Promise<CrmResult> {
  const base = env.CRMEW_INGEST_URL;
  const token = env.CRMEW_INGEST_TOKEN;
  const formId = env.CRMEW_FORM_ID ?? "site-calculadora";
  if (!base || !token) return "skipped";

  const body = JSON.stringify(crmewPayload(r, lead, formId));
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/ingest/v1/intake/leads`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body,
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) return "sent";
      if (res.status < 500) return "failed";
    } catch {
      /* rede ou tempo: tenta mais uma vez */
    }
  }
  return "failed";
}
