import { describe, expect, it } from "vitest";
import { looksLikeBot, parseLeadRequest } from "./lead";

const base = {
  routines: [{ kind: "dados", minutes: 30, runs: 5, period: "semana" }],
  pay: { mode: "bruto", salary: 4500, regime: "simples", benefits: 0 },
  lead: { name: "Ana Souza", email: "Ana@Miolo.com.br", company: "Miolo", wantsContact: false },
  trap: { website: "", elapsedMs: 9000 },
  turnstile: "",
};

describe("validação do pedido", () => {
  it("aceita e normaliza", () => {
    const r = parseLeadRequest(base);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.lead.email).toBe("ana@miolo.com.br");
  });
  it("WhatsApp só é exigido quando a caixa está marcada", () => {
    expect(parseLeadRequest({ ...base, lead: { ...base.lead, wantsContact: true } })).toEqual({ ok: false, field: "whatsapp" });
    const ok = parseLeadRequest({ ...base, lead: { ...base.lead, wantsContact: true, whatsapp: "(54) 99999-0000" } });
    expect(ok.ok && ok.value.lead.whatsapp).toBe("54999990000");
  });
  it.each([
    ["nome curto", { ...base, lead: { ...base.lead, name: "A" } }, "name"],
    ["e-mail sem arroba", { ...base, lead: { ...base.lead, email: "ana.miolo.com" } }, "email"],
    ["e-mail com tag", { ...base, lead: { ...base.lead, email: "a<b>@x.com" } }, "email"],
    ["empresa vazia", { ...base, lead: { ...base.lead, company: " " } }, "company"],
    ["simulação inválida", { ...base, routines: [{ kind: "dados", minutes: 0, runs: 5, period: "semana" }] }, "plan"],
    ["sem rotinas", { ...base, routines: undefined }, "plan"],
    ["corpo nulo", null, "body"],
  ])("%s", (_n, body, field) => {
    expect(parseLeadRequest(body)).toEqual({ ok: false, field });
  });
  it("tira caracteres de controle e corta tamanho", () => {
    const r = parseLeadRequest({ ...base, lead: { ...base.lead, name: `Ana\n\tSouza${"x".repeat(500)}` } });
    expect(r.ok && r.value.lead.name.length).toBeLessThanOrEqual(120);
    expect(r.ok && r.value.lead.name).not.toMatch(/[\n\t]/);
  });
});

describe("robô", () => {
  it("honeypot preenchido ou envio rápido demais", () => {
    expect(looksLikeBot({ website: "http://spam", elapsedMs: 9000 })).toBe(true);
    expect(looksLikeBot({ website: "", elapsedMs: 300 })).toBe(true);
    expect(looksLikeBot({ website: "", elapsedMs: Number.NaN })).toBe(true);
    expect(looksLikeBot({ website: "", elapsedMs: 9000 })).toBe(false);
  });
});

describe("simulação refeita de primitivos", () => {
  const b = {
    routines: [{ kind: "dados", minutes: 30, runs: 5, period: "semana" }],
    pay: { mode: "bruto", salary: 4500, regime: "simples", benefits: 0 },
    lead: { name: "Ana Souza", email: "ana@miolo.com.br", company: "Miolo", wantsContact: false },
    trap: { website: "", elapsedMs: 9000 },
    turnstile: "",
  };
  it.each([
    ["modo desconhecido", { ...b, pay: { mode: "x", salary: 1 } }],
    ["regime fora da lista", { ...b, pay: { ...b.pay, regime: "lucro" } }],
    ["salário como texto", { ...b, pay: { ...b.pay, salary: "4500" } }],
    ["salário infinito", { ...b, pay: { ...b.pay, salary: Infinity } }],
    ["rotinas demais", { ...b, routines: Array.from({ length: 6 }, () => b.routines[0]) }],
  ])("%s", (_n, body) => {
    expect(parseLeadRequest(body)).toEqual({ ok: false, field: "plan" });
  });
  it("campo extra no pay não passa adiante", () => {
    const r = parseLeadRequest({ ...b, pay: { ...b.pay, extra: "x" } });
    expect(r.ok && Object.keys(r.value.plan.pay)).toEqual(["mode", "salary", "regime", "benefits"]);
  });
});
