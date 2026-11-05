import { describe, expect, it } from "vitest";
import { esc, reportEmail, teamEmail } from "./email";
import type { Plan } from "./plan";
import { buildReport, type Lead } from "./report";

const plan: Plan = {
  routines: [{ kind: "dados", minutes: 30, runs: 5, period: "semana" }],
  pay: { mode: "bruto", salary: 5000, regime: "presumido", benefits: 0 },
};
const lead: Lead = { email: "ana@x.com", company: 'A&B <script> <b>"S"</b>', wantsContact: true };
const r = buildReport(plan, lead, new Date("2026-11-04T15:00:00Z"), "https://www.procemiza.com.br", "https://wa.me/555494898181")!;

describe("e-mail do relatório", () => {
  const { html, text } = reportEmail(r);
  it("escapa o que a pessoa digitou", () => {
    expect(esc(`<&>"'`)).toBe("&lt;&amp;&gt;&quot;&#39;");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>");
  });
  it("sem nome: cumprimenta pela empresa, nunca por 'undefined'", () => {
    expect(html).toContain("A conta da A&amp;B");
    expect(text).toContain("A conta da A&B");
    expect(html + text).not.toContain("undefined");
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
