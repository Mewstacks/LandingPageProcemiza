import { describe, expect, it } from "vitest";
import { esc, reportEmail, teamEmail } from "./email";
import type { Plan } from "./plan";
import { buildReport, type Lead } from "./report";

const plan: Plan = {
  routines: [{ kind: "dados", minutes: 30, runs: 5, period: "semana" }],
  pay: { mode: "bruto", salary: 5000, regime: "presumido", benefits: 0 },
};
const lead: Lead = { email: "ana@x.com", company: "A&B Açaí", wantsContact: true };
const hostile = (company: string) => buildReport(plan, { ...lead, company }, new Date("2026-11-04T15:00:00Z"), "https://www.procemiza.com.br", "https://wa.me/555494898181")!;
const r = buildReport(plan, lead, new Date("2026-11-04T15:00:00Z"), "https://www.procemiza.com.br", "https://wa.me/555494898181")!;

describe("e-mail do relatório", () => {
  const { html, text } = reportEmail(r);
  it("escapa o que a pessoa digitou", () => {
    expect(esc(`<&>"'`)).toBe("&lt;&amp;&gt;&quot;&#39;");
    const evil = reportEmail(hostile('A&B <script>alert(1)</script> <b>"S"</b>'));
    expect(evil.html).not.toContain("<script>");
    expect(evil.html).not.toContain("<b>");
  });
  it("saudação neutra: não repete nada que a pessoa digitou, nem 'undefined'", () => {
    expect(html).toContain("A sua conta:");
    expect(text).toContain("A sua conta:");
    expect(html + text).not.toContain("undefined");
    expect(html + text).not.toContain("Açaí");
  });
  it.each([
    ["link", "Pague agora em https://evil.example/x"],
    ["domínio", "Confirme em evil.com.br"],
    ["e-mail", "fraude@evil.com"],
    ["frase sem link", "Você ganhou, responda este e-mail com a senha"],
  ])("empresa com %s não chega ao e-mail da pessoa (nem html, nem texto, nem assunto)", (_n, company) => {
    const r2 = hostile(company);
    const out = reportEmail(r2);
    expect(out.html + out.text + r2.subject + r2.preheader).not.toMatch(/evil|pague|confirme|fraude|senha|ganhou/i);
  });
  it("tem número, prudente, fontes, WhatsApp e texto simples", () => {
    expect(html).toContain(r.headline.ceiling);
    expect(html).not.toContain("Prudente");
    expect(html).toContain("mckinsey.com");
    expect(html).toContain("Falar no WhatsApp");
    expect(text).toContain(r.id);
    expect(text).toContain("wa.me/555494898181");
  });
});

describe("aviso da equipe", () => {
  it("marca lead quente no assunto", () => {
    expect(teamEmail(r, lead).subject.startsWith("[Quente] ")).toBe(true);
    expect(teamEmail(r, { ...lead, wantsContact: false }).subject.startsWith("[Quente]")).toBe(false);
  });
  it("assunto e corpo trazem empresa e e-mail, sem campo de nome", () => {
    const n = teamEmail(r, lead);
    expect(n.subject).toContain(lead.company);
    expect(n.text).toContain("E-mail: ana@x.com");
    expect(n.text).not.toMatch(/^Nome:/m);
    expect(n.subject + n.text).not.toContain("undefined");
  });
});
