import { describe, expect, it } from "vitest";
import { DEFAULT_DRAFT, MINUTE_STOPS, RUN_STOPS, sanitize, snap, spokenMinutes, toPlan } from "./draft";
import { evaluate } from "./plan";

describe("rascunho", () => {
  it("o padrão já dá resultado", () => {
    expect(evaluate(toPlan(DEFAULT_DRAFT)).status).toBe("ok");
  });
  it("modo custo vira pay de custo total", () => {
    expect(toPlan({ ...DEFAULT_DRAFT, mode: "custo", monthly: 9000 }).pay).toEqual({ mode: "custo", monthly: 9000 });
  });
});

describe("snap", () => {
  it("vai ao degrau mais próximo e recusa lixo", () => {
    expect(snap(MINUTE_STOPS, 31)).toBe(30);
    expect(snap(RUN_STOPS, 7)).toBe(6);
    expect(snap(RUN_STOPS, Number.NaN)).toBeNull();
    expect(snap(RUN_STOPS, "5")).toBeNull();
  });
});

describe("sanitize do storage", () => {
  const good = { v: 5, draft: DEFAULT_DRAFT };
  it("aceita o que ele mesmo gravou", () => {
    expect(sanitize(JSON.parse(JSON.stringify(good)))).toEqual(DEFAULT_DRAFT);
  });
  it.each([
    [null],
    ["x"],
    [{ v: 4, draft: DEFAULT_DRAFT }],
    [{ v: 5 }],
    [{ v: 5, draft: { ...DEFAULT_DRAFT, routines: [] } }],
    [{ v: 5, draft: { ...DEFAULT_DRAFT, routines: Array.from({ length: 6 }, () => DEFAULT_DRAFT.routines[0]) } }],
    [{ v: 5, draft: { ...DEFAULT_DRAFT, routines: [{ kind: "x", minutes: 30, runs: 5, period: "dia" }] } }],
  ])("estado quebrado %j volta null", (raw) => {
    expect(sanitize(raw)).toBeNull();
  });
  it("valor fora do formato cai no padrão, nunca em NaN", () => {
    const back = sanitize({ v: 5, draft: { ...DEFAULT_DRAFT, salary: -3, monthly: "x", benefits: 777, regime: "?", mode: "?" } });
    expect(back).toMatchObject({ salary: 4500, monthly: 7000, benefits: 0, regime: "simples", mode: "bruto" });
  });
});

describe("fala do slider", () => {
  it.each([
    [30, "30 minutos"],
    [60, "1 hora"],
    [90, "1 hora e 30 minutos"],
    [120, "2 horas"],
  ])("%i min", (n, s) => expect(spokenMinutes(n)).toBe(s));
});
