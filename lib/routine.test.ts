import { describe, expect, it } from "vitest";
import { K } from "./calculator";
import {
  PRESETS,
  addStep,
  blankFields,
  deriveView,
  fromPreset,
  initialFields,
  isBlank,
  nextStepId,
  patchStep,
  removeStep,
  sanitize,
  type RoutineFields,
} from "./routine";

function okView(f: RoutineFields, edited = true) {
  const v = deriveView(f, edited);
  if (v.result.status !== "ok") throw new Error(`esperava ok, veio ${JSON.stringify(v.result)}`);
  return { view: v, result: v.result };
}

describe("atalhos", () => {
  it("todo atalho dá uma conta válida, com passos de ids únicos", () => {
    for (const preset of PRESETS) {
      const f = fromPreset(preset);
      const { result } = okView(f, false);
      expect(result.steps.length).toBe(preset.steps.length);
      expect(new Set(f.steps.map((s) => s.id)).size).toBe(f.steps.length);
      expect(result.hoursReturned).toBeGreaterThan(0);
      expect(result.share).toBeGreaterThan(0);
      expect(result.share).toBeLessThan(1);
    }
  });

  it("o primeiro atalho é a conta de 40 notas por semana (10 min cada)", () => {
    const { result, view } = okView(initialFields(), false);
    expect(view.isExample).toBe(true);
    expect(result.perRunMinutes).toBe(10);
    expect(result.runsMonth).toBeCloseTo(173.33, 1);
    expect(result.share).toBeCloseTo(0.801, 3);
  });

  it("atalhos de naturezas diferentes devolvem partes diferentes do tempo", () => {
    const shares = PRESETS.map((p) => okView(fromPreset(p)).result.share);
    expect(Math.max(...shares) - Math.min(...shares)).toBeGreaterThan(0.1);
  });

  it("copiar um atalho não compartilha objetos com ele", () => {
    const a = fromPreset(PRESETS[0]);
    a.steps[0].minutes = "99";
    expect(PRESETS[0].steps[0].minutes).toBe("2");
  });
});

describe("texto digitado vira conta", () => {
  const base = initialFields();

  it("vírgula decimal pt-BR e milhar", () => {
    const f = patchStep({ ...base, runs: "1.200", period: "mes" }, "s1", { minutes: "1,5" });
    const { result } = okView(f);
    expect(result.runsMonth).toBe(1200);
    expect(result.steps[0].minutes).toBe(1.5);
  });

  it("passo em branco é ignorado; nome vazio usa o tipo", () => {
    let f = addStep({ ...base, steps: base.steps.map((s) => ({ ...s, name: "" })) });
    f = patchStep(f, "s5", { kind: "pessoas" });
    const { result, view } = okView(f);
    expect(result.steps).toHaveLength(4);
    expect(view.stepNames).toEqual(["Procurar ou juntar", "Conferir com regra", "Copiar ou digitar", "Avisar ou enviar"]);
  });

  it("nomes seguem a ordem dos passos preenchidos mesmo com linha em branco no meio", () => {
    let f = addStep(base);
    f = patchStep(f, "s2", { minutes: "" });
    f = patchStep(f, "s5", { name: "Último", minutes: "2" });
    const { view } = okView(f);
    expect(view.stepNames).toEqual(["Baixar o XML", "Lançar no sistema", "Avisar o fornecedor", "Último"]);
  });

  it("cada linha sabe qual segmento do resultado é o seu", () => {
    let f = addStep(base);
    f = patchStep(f, "s2", { minutes: "" });
    expect(deriveView(f, true).slots).toEqual([0, null, 1, 2, null]);
  });

  it("exceções em branco usam o padrão e valor digitado vale em %", () => {
    expect(okView(base).view.input.exceptions).toBe(K.DEFAULT_EXCEPTIONS);
    const f = { ...base, exceptions: "20" };
    expect(okView(f).view.input.exceptions).toBeCloseTo(0.2);
    expect(okView(f).result.perRunSaved).toBeLessThan(okView(base).result.perRunSaved);
  });

  it("cobertura por tipo trocada pela pessoa vale só para aquele tipo", () => {
    const f: RoutineFields = { ...base, exceptions: "0", coverage: { conferir: "50" } };
    const { result } = okView(f);
    expect(result.steps[1].coverage).toBe(0.5);
    expect(result.steps[0].coverage).toBe(0.75);
  });

  it("retrabalho precisa dos dois números", () => {
    expect(okView({ ...base, reworkPercent: "10" }).result.rework).toBeNull();
    expect(okView({ ...base, reworkPercent: "10", reworkMinutes: "20" }).result.rework).not.toBeNull();
  });

  it("custo: salário usa encargos do regime; hora vale como digitada; vazio não calcula dinheiro", () => {
    expect(okView(base).result.brlMonth).toBeNull();
    const salary = okView({ ...base, cost: "3.500", costMode: "salario", regime: "clt" });
    expect(salary.view.hourly).toBeCloseTo((3500 * 1.7) / 220);
    const simples = okView({ ...base, cost: "3500", costMode: "salario", regime: "simples" });
    expect(simples.view.hourly).toBeCloseTo((3500 * 1.5) / 220);
    const hour = okView({ ...base, cost: "27", costMode: "hora" });
    expect(hour.view.hourly).toBe(27);
    expect(hour.result.brlMonth).toBeCloseTo(hour.result.hoursReturned * 27);
  });
});

describe("erros apontam o campo certo", () => {
  const base = initialFields();
  const err = (f: RoutineFields) => deriveView(f, true).errors[0];

  it("frequência", () => {
    expect(err({ ...base, runs: "abc" })).toEqual({ field: "runs", reason: "nan" });
    expect(err({ ...base, runs: "0" })).toEqual({ field: "runs", reason: "zero" });
    // "-3" não é número pt-BR válido (parseDecimalPtBR recusa o sinal): vira nan, nunca passa calado
    expect(err({ ...base, runs: "-3" })).toEqual({ field: "runs", reason: "nan" });
  });

  it("minutos de um passo dizem qual", () => {
    const f = patchStep(base, "s3", { minutes: "0" });
    expect(err(f)).toEqual({ field: "minutes", reason: "zero", step: 2 });
    const g = patchStep(base, "s2", { minutes: "9999" });
    expect(err(g)).toEqual({ field: "minutes", reason: "too_large", step: 1 });
  });

  it("cobertura inválida aponta o tipo", () => {
    const f: RoutineFields = { ...base, coverage: { conferir: "150" } };
    expect(err(f)).toEqual({ field: "coverage", reason: "too_large", step: 1, kind: "conferir" });
  });

  it("custo ilegível vira erro do campo custo", () => {
    expect(err({ ...base, cost: "abc" })).toEqual({ field: "cost", reason: "nan" });
    expect(err({ ...base, cost: "0", costMode: "salario" })).toEqual({ field: "cost", reason: "nan" });
    expect(err({ ...base, cost: "99999", costMode: "hora" })).toEqual({ field: "cost", reason: "too_large" });
  });

  it("tudo em branco é vazio, não erro", () => {
    const v = deriveView(blankFields(), true);
    expect(v.result).toEqual({ status: "empty" });
    expect(v.errors).toEqual([]);
    expect(v.routine).toBe("Seu processo");
  });
});

describe("lista de passos", () => {
  it("ids novos nunca repetem, mesmo depois de remover do meio", () => {
    let f = initialFields();
    f = removeStep(f, "s2");
    f = addStep(f);
    const ids = f.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.at(-1)).toBe("s5");
    expect(nextStepId([])).toBe("s1");
  });

  it("para no máximo de passos e nunca zera a lista", () => {
    let f = blankFields();
    for (let i = 0; i < 20; i++) f = addStep(f);
    expect(f.steps).toHaveLength(K.MAX_STEPS);
    let g = blankFields();
    g = removeStep(g, "s1");
    expect(g.steps).toHaveLength(1);
    expect(isBlank(g)).toBe(true);
  });
});

describe("persistência", () => {
  const stored = { v: 2, edited: true, fields: initialFields() };

  it("o que foi salvo volta igual", () => {
    const back = sanitize(JSON.parse(JSON.stringify(stored)));
    expect(back).toEqual({ edited: true, fields: initialFields() });
  });

  it("lixo, versão antiga e formato quebrado voltam null", () => {
    expect(sanitize(null)).toBeNull();
    expect(sanitize("x")).toBeNull();
    expect(sanitize({})).toBeNull();
    expect(sanitize({ ...stored, v: 1 })).toBeNull();
    expect(sanitize({ ...stored, fields: { ...stored.fields, steps: [] } })).toBeNull();
    expect(sanitize({ ...stored, fields: { ...stored.fields, period: "ano" } })).toBeNull();
    expect(sanitize({ ...stored, fields: { ...stored.fields, steps: [{ id: "s1", kind: "voar", name: "", minutes: "" }] } })).toBeNull();
  });

  it("ids repetidos derrubam o estado", () => {
    const steps = [stored.fields.steps[0], { ...stored.fields.steps[1], id: "s1" }];
    expect(sanitize({ ...stored, fields: { ...stored.fields, steps } })).toBeNull();
  });

  it("textos longos são cortados e cobertura desconhecida é descartada", () => {
    const fields = { ...stored.fields, routine: "x".repeat(500), coverage: { conferir: "70", voar: "1", dados: 5 } };
    const back = sanitize({ ...stored, fields });
    expect(back?.fields.routine).toHaveLength(80);
    expect(back?.fields.coverage).toEqual({ conferir: "70" });
  });
});
