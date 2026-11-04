import { describe, expect, it } from "vitest";
import type { Plan } from "./plan";
import { decodePlan, encodePlan } from "./share";

const plan: Plan = {
  routines: [
    { kind: "dados", minutes: 30, runs: 5, period: "semana" },
    { kind: "conferir", minutes: 60, runs: 2, period: "dia" },
  ],
  pay: { mode: "bruto", salary: 4500, regime: "simples", benefits: 600 },
};

describe("fragmento da simulação", () => {
  it("ida e volta sem perda", () => {
    expect(decodePlan(encodePlan(plan))).toEqual(plan);
    const custo: Plan = { routines: plan.routines, pay: { mode: "custo", monthly: 7000 } };
    expect(decodePlan(`#${encodePlan(custo)}`)).toEqual(custo);
  });
  it.each([
    [""],
    ["r=dados.30.5.semana"],
    ["r=x.30.5.semana&p=custo.7000"],
    ["r=dados.0.5.semana&p=custo.7000"],
    ["r=dados.30.5.ano&p=custo.7000"],
    ["r=dados.30.5.semana&p=bruto.5000.lucro.0"],
    ["r=dados.30.5.semana&p=custo.NaN"],
    ["r=dados.30.5.semana&p=custo.-5"],
    [`r=${"dados.30.5.semana,".repeat(40)}&p=custo.7000`],
  ])("lixo %j volta null", (raw) => {
    expect(decodePlan(raw)).toBeNull();
  });
});
