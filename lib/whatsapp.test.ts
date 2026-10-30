import { describe, expect, it } from "vitest";
import { buildMessage, buildWhatsAppUrl, cleanRoutine, formatPhone, MESSAGE_MAX, ROUTINE_MAX } from "./whatsapp";

const base = "https://wa.me/555494898181";

describe("cleanRoutine", () => {
  it("tira quebra de linha e controle", () => {
    expect(cleanRoutine("a\nb\t\u0000c")).toBe("a b c");
  });
  it("corta no teto com reticências", () => {
    const out = cleanRoutine("x".repeat(200));
    expect(out.length).toBe(ROUTINE_MAX + 1);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("buildMessage", () => {
  it("genérica sem rotina", () => {
    expect(buildMessage()).toContain("uma rotina da minha empresa");
  });
  it("só rotina, sem números", () => {
    expect(buildMessage({ routine: "Conferir notas" })).toContain('"Conferir notas"');
  });
  it("com números", () => {
    const m = buildMessage({ routine: "Conferir notas", hoursReturned: 25.2, brlMonth: 1008, pct: 0.8 });
    expect(m).toContain("80%");
    expect(m).toContain("25 h/mês");
    expect(m).toContain("R$ 1.008/mês");
  });
  it("respeita o teto", () => {
    expect(buildMessage({ routine: "y".repeat(5000), hoursReturned: 1 }).length).toBeLessThanOrEqual(MESSAGE_MAX);
  });
});

describe("formatPhone", () => {
  it("formata o número da Procemiza", () => {
    expect(formatPhone("https://wa.me/555494898181")).toBe("+55 54 9489-8181");
  });
  it("celular de nove dígitos", () => {
    expect(formatPhone("https://wa.me/5554994898181")).toBe("+55 54 99489-8181");
  });
  it("número de fora do Brasil só ganha o +", () => {
    expect(formatPhone("https://wa.me/14155550100")).toBe("+14155550100");
  });
});

describe("buildWhatsAppUrl", () => {
  it("codifica & # ? % aspas emoji e quebra de linha e volta idêntico", () => {
    const routine = 'Notas & "recibos" #1 100% ok? 😀';
    const url = buildWhatsAppUrl(base, { routine, hoursReturned: 10 });
    expect(url.startsWith(`${base}?text=`)).toBe(true);
    expect(url.slice(base.length + 6)).not.toMatch(/[ &#"\n]/);
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toContain(routine);
    expect(new URL(url).searchParams.get("text")).toBe(decoded);
  });
});
