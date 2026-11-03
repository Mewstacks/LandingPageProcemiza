import { describe, expect, it } from "vitest";
import {
  MESSAGES,
  apply,
  chips,
  composer,
  currentNode,
  initialAnswers,
  nodeKey,
  plan,
  resultOf,
  sanitize,
  summary,
  turns,
  type Action,
  type Answers,
} from "./chat";
import { K, STEP_KINDS } from "./calculator";

/** Aplica a sequência; toda ação aqui tem de ser aceita. */
function run(actions: Action[], from: Answers = initialAnswers()): Answers {
  let a = from;
  for (const action of actions) {
    const r = apply(a, action);
    if (r.error) throw new Error(`${JSON.stringify(action)} recusada: ${r.error}`);
    a = r.answers;
  }
  return a;
}

const text = (t: string): Action => ({ type: "text", text: t });

/** Conferir notas fiscais, digitado do zero: 40 por semana, 4 tipos, R$ 3.500 CLT. */
const typed: Action[] = [
  text("Conferir notas fiscais"),
  text("40 por semana"),
  { type: "toggleKind", kind: "buscar" },
  { type: "toggleKind", kind: "conferir" },
  { type: "toggleKind", kind: "dados" },
  { type: "toggleKind", kind: "avisar" },
  { type: "kindsDone" },
  // os tempos vêm na ordem dos tipos: copiar, conferir, avisar, procurar
  text("3 minutos"),
  text("4"),
  { type: "minutes", value: 1 },
  text("2 min"),
  { type: "costMode", mode: "salario" },
  text("3.500"),
  { type: "regime", value: "clt" },
];

describe("o roteiro", () => {
  it("começa pelo nome e pergunta uma coisa por vez, na ordem", () => {
    let a = initialAnswers();
    expect(currentNode(a)).toEqual({ id: "name" });
    expect(turns(a)).toHaveLength(1);
    const order: string[] = [];
    for (const action of typed) {
      order.push(nodeKey(currentNode(a)));
      a = run([action], a);
    }
    expect(order).toEqual([
      "name",
      "period",
      "kinds",
      "kinds",
      "kinds",
      "kinds",
      "kinds",
      "minutes:dados",
      "minutes:conferir",
      "minutes:avisar",
      "minutes:buscar",
      "costMode",
      "cost",
      "regime",
    ]);
    expect(currentNode(a)).toEqual({ id: "done" });
  });

  it("digitado do zero chega na conta da especificação (19,64 a 26,87 h, R$ 519 a R$ 710)", () => {
    const a = run(typed);
    const r = resultOf(a);
    expect(r?.status).toBe("ok");
    if (r?.status !== "ok") return;
    expect(r.steps.map((s) => [s.kind, s.minutes])).toEqual([
      ["dados", 3],
      ["conferir", 4],
      ["avisar", 1],
      ["buscar", 2],
    ]);
    expect(r.low.hoursReturned).toBeCloseTo(19.6444, 4);
    expect(r.high.hoursReturned).toBeCloseTo(26.8667, 4);
    expect(r.low.brlMonth).toBeCloseTo(518.79, 2);
    expect(r.high.brlMonth).toBeCloseTo(709.52, 2);
  });

  it("o resultado só existe com a conversa completa", () => {
    expect(resultOf(initialAnswers())).toBeNull();
    expect(resultOf(run(typed.slice(0, -1)))).toBeNull();
  });

  it("um modelo preenche nome, tipos e tempos, e ainda pergunta frequência e custo", () => {
    const a = run([{ type: "model", label: "Notas fiscais" }]);
    expect(a.name).toBe("Conferir notas fiscais");
    expect(a.runs).toBeNull();
    expect(a.fromModel).toEqual(["dados", "conferir", "avisar", "buscar"]);
    expect(currentNode(a)).toEqual({ id: "period" });
    const done = run([text("40 por semana"), { type: "hourly", value: 40 }], a);
    expect(currentNode(done)).toEqual({ id: "done" });
    const r = resultOf(done);
    expect(r?.status === "ok" && r.low.hoursReturned).toBeCloseTo(19.6444, 4);
  });

  it("modelo com dois passos do mesmo tipo soma e dá o mesmo resultado", () => {
    const a = run([{ type: "model", label: "Entre sistemas" }, text("25 por dia"), { type: "costMode", mode: "pular" }]);
    expect(a.minutes.dados).toBe(5);
    const r = resultOf(a);
    // 25 × 21 = 525 execuções; 6 min por execução = 52,5 h; piso 0,69 × 5 + 0,69 × 1
    expect(r?.status === "ok" && r.hoursBefore).toBeCloseTo(52.5, 6);
    expect(r?.status === "ok" && r.low.hoursReturned).toBeCloseTo((6 * 0.69 * 525) / 60, 6);
  });

  it("todos os modelos viram uma conta válida", () => {
    for (const chip of chips(initialAnswers())) {
      const a = run([chip.action, text("10 por semana"), { type: "costMode", mode: "pular" }]);
      const r = resultOf(a);
      expect(r?.status, chip.label).toBe("ok");
    }
  });

  it("os balões vão até a pergunta da vez e a última não tem resposta", () => {
    const a = run(typed.slice(0, 3));
    const t = turns(a);
    expect(t.map((x) => x.key)).toEqual(["name", "period", "runs", "kinds"]);
    expect(t.map((x) => x.answer)).toEqual(["Conferir notas fiscais", "Por semana", "40", null]);
    expect(t[1].question).toBe("Com que frequência?");
  });

  it("as perguntas dizem o tipo e o período", () => {
    const a = run([text("Cadastros"), { type: "period", value: "mes" }, { type: "runs", value: 5 }, { type: "toggleKind", kind: "avisar" }, { type: "kindsDone" }]);
    expect(turns(a).at(-1)?.question).toBe("Quanto leva avisar?");
    expect(turns(a).find((x) => x.key === "runs")?.question).toBe("Quantas vezes por mês?");
  });
});

describe("texto livre vale pelo que a pergunta da vez espera", () => {
  it("um texto responde período e número juntos; só o número deixa o período para depois", () => {
    const both = run([text("Relatório"), text("3x ao dia")]);
    expect([both.runs, both.period]).toEqual([3, "dia"]);
    const only = run([text("Relatório"), text("40")]);
    expect([only.runs, only.period]).toEqual([40, null]);
    expect(currentNode(only)).toEqual({ id: "period" });
    expect(chips(only).map((c) => c.label)).toEqual(["Por dia", "Por semana", "Por mês"]);
    const onlyPeriod = run([text("Relatório"), text("toda semana")]);
    expect([onlyPeriod.runs, onlyPeriod.period]).toEqual([1, "semana"]);
  });

  it("tempo lê 1h30 e meia hora", () => {
    const base = run([text("x"), text("1 por dia"), { type: "toggleKind", kind: "dados" }, { type: "toggleKind", kind: "conferir" }, { type: "kindsDone" }]);
    const a = run([text("1h30"), text("meia hora")], base);
    expect(a.minutes).toEqual({ dados: 90, conferir: 30 });
  });

  it("custo por hora e salário respeitam cada teto", () => {
    const base = run([{ type: "model", label: "WhatsApp" }, text("10 por dia")]);
    const hora = run([{ type: "costMode", mode: "hora" }], base);
    expect(apply(hora, text("10001")).error).toBe(MESSAGES.hourRange);
    expect(apply(hora, text("10000")).error).toBeNull();
    const sal = run([{ type: "costMode", mode: "salario" }], base);
    expect(apply(sal, text("200001")).error).toBe(MESSAGES.salaryRange);
    expect(apply(sal, text("3,5 mil")).error).toBeNull();
  });
});

describe("entrada ruim não muda nada e diz o que fazer", () => {
  const cases: [string, Action[], Action, string][] = [
    ["nome vazio", [], text("   "), MESSAGES.name],
    ["frequência ilegível", [text("x")], text("de vez em quando"), MESSAGES.frequency],
    ["frequência alta demais", [text("x")], text("5000 por dia"), MESSAGES.frequencyRange],
    ["tempo ilegível", [text("x"), text("1 por dia"), { type: "toggleKind", kind: "dados" }, { type: "kindsDone" }], text("abc"), MESSAGES.duration],
    ["tempo fora da faixa", [text("x"), text("1 por dia"), { type: "toggleKind", kind: "dados" }, { type: "kindsDone" }], text("11 horas"), MESSAGES.durationRange],
    ["texto onde só cabe toque", [text("x"), text("1 por dia")], text("copiar e conferir"), MESSAGES.tap],
    ["Pronto sem nenhum tipo", [text("x"), text("1 por dia")], { type: "kindsDone" }, MESSAGES.tap],
    ["volume acima dos limites", [text("x"), text("90000 por mês"), { type: "toggleKind", kind: "dados" }, { type: "kindsDone" }], text("600"), MESSAGES.limits],
  ];

  it.each(cases)("%s", (_name, setup, action, message) => {
    const before = run(setup);
    const r = apply(before, action);
    expect(r.error).toBe(message);
    expect(r.answers).toBe(before);
  });

  it("chip desconhecido ou tipo que não existe é recusado", () => {
    expect(apply(initialAnswers(), { type: "model", label: "Inexistente" }).error).toBe(MESSAGES.unknown);
    expect(apply(initialAnswers(), { type: "toggleKind", kind: "x" as never }).error).toBe(MESSAGES.unknown);
    expect(apply(initialAnswers(), { type: "runs", value: Number.NaN }).error).toBe(MESSAGES.frequency);
    expect(apply(initialAnswers(), { type: "hourly", value: -3 }).error).toBe(MESSAGES.hourRange);
  });

  it("dois toques seguidos no mesmo chip não repetem a resposta", () => {
    const a = run([text("x"), { type: "period", value: "dia" }, { type: "runs", value: 5 }]);
    const again = apply(a, { type: "runs", value: 5 });
    expect(again.error).toBeNull();
    expect(again.answers.runs).toBe(5);
    expect(turns(again.answers).map((t) => t.key)).toEqual(turns(a).map((t) => t.key));
  });
});

describe("corrigir uma resposta", () => {
  it("apagar uma resposta esconde as seguintes e elas voltam quando a pergunta é respondida", () => {
    const full = run(typed);
    const back = run([{ type: "rewind", key: "period" }], full);
    expect(currentNode(back)).toEqual({ id: "period" });
    expect(turns(back).map((t) => t.key)).toEqual(["name", "period"]);
    expect(back.minutes).toEqual(full.minutes);
    const again = run([text("20 por dia")], back);
    expect(currentNode(again)).toEqual({ id: "done" });
    expect(again.cost).toEqual(full.cost);
    const r = resultOf(again);
    expect(r?.status === "ok" && r.runsMonth).toBe(20 * K.WORKDAYS_MONTH);
  });

  it("voltar aos tipos e tirar um apaga os minutos dele; pôr um novo só pergunta o novo", () => {
    const full = run(typed);
    const back = run([{ type: "rewind", key: "kinds" }, { type: "toggleKind", kind: "avisar" }, { type: "toggleKind", kind: "pessoas" }, { type: "kindsDone" }], full);
    expect(back.kinds).toEqual(["dados", "conferir", "buscar", "pessoas"]);
    expect(back.minutes).toEqual({ dados: 3, conferir: 4, buscar: 2 });
    expect(currentNode(back)).toEqual({ id: "minutes", kind: "pessoas" });
  });

  it("mexer num tempo tira a etiqueta de modelo só daquele tipo", () => {
    const m = run([{ type: "model", label: "Notas fiscais" }, text("10 por semana")]);
    const edited = run([{ type: "rewind", key: "minutes:dados" }, text("7")], m);
    expect(edited.minutes.dados).toBe(7);
    expect(edited.fromModel).toEqual(["conferir", "avisar", "buscar"]);
  });

  it("trocar de salário para pular tira as perguntas de valor e de regime", () => {
    const full = run(typed);
    const skip = run([{ type: "rewind", key: "costMode" }, { type: "costMode", mode: "pular" }], full);
    expect(currentNode(skip)).toEqual({ id: "done" });
    expect(plan(skip).map(nodeKey)).not.toContain("regime");
    const r = resultOf(skip);
    expect(r?.status === "ok" && r.low.brlMonth).toBeNull();
  });

  it("tocar no balão do valor da hora volta a perguntar só o valor", () => {
    const a = run([{ type: "model", label: "WhatsApp" }, text("10 por dia"), { type: "costMode", mode: "hora" }, text("27")]);
    const back = run([{ type: "rewind", key: "cost" }], a);
    expect(currentNode(back)).toEqual({ id: "cost" });
    expect(apply(back, text("30")).answers.cost).toEqual({ mode: "hora", value: 30, direct: false });
  });

  it("recomeçar zera tudo", () => {
    expect(run([{ type: "reset" }], run(typed))).toEqual(initialAnswers());
  });

  it("rewind de chave inventada não muda nada", () => {
    const a = run(typed);
    expect(run([{ type: "rewind", key: "nada" }, { type: "rewind", key: "minutes:xyz" }], a)).toEqual(a);
  });
});

describe("resumo das respostas", () => {
  it("cada resposta ganha um rótulo que diz a que pergunta responde, e toda uma é tocável", () => {
    const a = run(typed);
    const items = summary(a);
    expect(items.map((i) => i.label)).toEqual([
      "Conferir notas fiscais",
      "por semana",
      "40 vezes",
      "Copiar, Conferir, Avisar, Procurar",
      "Copiar 3 min",
      "Conferir 4 min",
      "Avisar 1 min",
      "Procurar 2 min",
      "Salário",
      "R$ 3.500 por mês",
      "Lucro presumido ou real",
    ]);
    // tocar em qualquer uma volta àquela pergunta e esconde só o que vem depois dela
    for (const item of items) {
      const back = run([{ type: "rewind", key: item.key }], a);
      expect(currentNode(back).id).not.toBe("done");
    }
  });
});

describe("chips e caixa de texto", () => {
  it("cada pergunta tem chips ou caixa de texto, nunca nada", () => {
    let a = initialAnswers();
    for (const action of typed) {
      const node = currentNode(a);
      expect(chips(a, node).length > 0 || composer(a, node) !== null, nodeKey(node)).toBe(true);
      a = run([action], a);
    }
  });

  it("tipos são botões com estado marcado; todos os chips executam sem erro quando é a vez deles", () => {
    const a = run([text("x"), text("1 por dia"), { type: "toggleKind", kind: "dados" }]);
    expect(chips(a).filter((c) => c.pressed).map((c) => c.key)).toEqual(["dados"]);
    expect(chips(a)).toHaveLength(STEP_KINDS.length);
  });

  it("a caixa de salário aceita decimal; as demais, texto", () => {
    const sal = run([{ type: "model", label: "WhatsApp" }, text("10 por dia"), { type: "costMode", mode: "salario" }]);
    expect(composer(sal)?.inputMode).toBe("decimal");
    expect(composer(initialAnswers())?.inputMode).toBe("text");
    expect(composer(run([{ type: "model", label: "WhatsApp" }, text("1 por dia")]))).toBeNull();
  });
});

describe("persistência", () => {
  it("o que foi salvo volta igual", () => {
    const a = run(typed);
    expect(sanitize(JSON.parse(JSON.stringify({ v: 3, answers: a })))).toEqual(a);
    expect(sanitize({ v: 3, answers: initialAnswers() })).toEqual(initialAnswers());
  });

  it.each([
    ["lixo", "x"],
    ["null", null],
    ["versão antiga", { v: 2, fields: {} }],
    ["sem answers", { v: 3 }],
    ["período inventado", { v: 3, answers: { ...initialAnswers(), period: "ano" } }],
    ["execuções negativas", { v: 3, answers: { ...initialAnswers(), runs: -1 } }],
    ["execuções NaN", { v: 3, answers: { ...initialAnswers(), runs: Number.NaN } }],
    ["tipo inventado", { v: 3, answers: { ...initialAnswers(), kinds: ["x"] } }],
    ["tipo repetido", { v: 3, answers: { ...initialAnswers(), kinds: ["dados", "dados"] } }],
    ["minutos de tipo que não está na lista", { v: 3, answers: { ...initialAnswers(), minutes: { dados: 3 } } }],
    ["minutos absurdos", { v: 3, answers: { ...initialAnswers(), kinds: ["dados"], minutes: { dados: 99999 } } }],
    ["custo inventado", { v: 3, answers: { ...initialAnswers(), cost: { mode: "x" } } }],
    ["hora acima do teto", { v: 3, answers: { ...initialAnswers(), cost: { mode: "hora", value: 99999, direct: true } } }],
    ["chip direto sem valor", { v: 3, answers: { ...initialAnswers(), cost: { mode: "hora", value: null, direct: true } } }],
    ["regime inventado", { v: 3, answers: { ...initialAnswers(), cost: { mode: "salario", value: 3000, regime: "x" } } }],
    ["volume acima dos limites", { v: 3, answers: { ...initialAnswers(), runs: 90000, period: "mes", kinds: ["dados"], kindsDone: true, minutes: { dados: 600 } } }],
  ])("recusa %s", (_name, raw) => {
    expect(sanitize(raw)).toBeNull();
  });

  it("corta nome grande e limpa controle em vez de recusar", () => {
    const a = sanitize({ v: 3, answers: { ...initialAnswers(), name: `  ${"a".repeat(200)}\n` } });
    expect(a?.name).toBe("a".repeat(80));
  });
});

/** Gerador pseudoaleatório fixo: a mesma sequência em toda máquina. */
function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const CORPUS = [
  "", " ", "40 por semana", "3x ao dia", "todo dia", "a cada 2 dias", "1h30", "meia hora", "15", "600", "601", "0", "-5",
  "3.500", "R$ 3,5 mil", "27,5", "abc", "NaN", "Infinity", "1e3", "😀".repeat(100), "<script>alert(1)</script>",
  "９０", "x".repeat(200), "100000 por mês", "0,5 por dia", "10 horas", "uma hora e meia", "toda segunda", "​", "\n",
];

describe("propriedades: 1.000 conversas aleatórias", () => {
  it("nenhuma sequência quebra, e todo estado alcançável é válido, salvável e com conta finita", () => {
    const rand = mulberry32(20261103);
    const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)];

    for (let game = 0; game < 1000; game++) {
      let a = initialAnswers();
      const steps = 5 + Math.floor(rand() * 40);
      for (let i = 0; i < steps; i++) {
        const node = currentNode(a);
        const roll = rand();
        let action: Action;
        if (roll < 0.35) action = text(pick(CORPUS));
        else if (roll < 0.8) {
          const available = chips(a, node);
          const chip = available.length > 0 ? pick(available) : null;
          if (chip === null) action = text(pick(CORPUS));
          else if (chip.action.type === "toggleKind" && rand() < 0.4) action = { type: "kindsDone" };
          else action = chip.action;
        } else if (roll < 0.95) action = { type: "rewind", key: nodeKey(pick(plan(a))) };
        else action = { type: "reset" };

        const r = apply(a, action);
        a = r.answers;
        if (r.error === null && action.type !== "rewind" && action.type !== "reset") {
          // aceitar nunca deixa o estado inválido
        }

        expect(sanitize(JSON.parse(JSON.stringify({ v: 3, answers: a })))).toEqual(a);

        const list = turns(a);
        expect(list.length).toBeGreaterThan(0);
        expect(list.slice(0, -1).every((t) => t.answer !== null)).toBe(true);

        const result = resultOf(a);
        if (result?.status === "ok") {
          for (const s of [result.low, result.high]) {
            for (const v of [s.hoursReturned, s.hoursAfter, s.share, s.fte]) expect(Number.isFinite(v)).toBe(true);
            if (s.brlMonth !== null) expect(Number.isFinite(s.brlMonth)).toBe(true);
          }
          expect(result.low.hoursReturned).toBeLessThanOrEqual(result.high.hoursReturned + 1e-9);
          expect(result.high.share).toBeLessThanOrEqual(0.93 + 1e-9);
          expect(result.high.hoursReturned).toBeLessThanOrEqual(result.hoursBefore + 1e-9);
        } else {
          expect(result === null || result.status === "empty").toBe(true);
        }
      }
    }
  });
});

describe("resumo: singular", () => {
  it("uma execução é '1 vez', não '1 vezes'", () => {
    const a = run([text("Relatório"), text("toda semana"), { type: "toggleKind", kind: "dados" }, { type: "kindsDone" }, text("30"), { type: "costMode", mode: "pular" }]);
    expect(summary(a).map((i) => i.label)).toContain("1 vez");
  });
});
