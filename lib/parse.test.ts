import { describe, expect, it } from "vitest";
import { cleanName, normalize, parseDuration, parseFrequency, parseMoney, runsFit } from "./parse";

const ok = <T>(value: T) => ({ ok: true, value });
const no = (reason: "unreadable" | "range") => ({ ok: false, reason });

describe("normalize", () => {
  it("tira acento, caixa, espaço de largura zero e algarismo largo", () => {
    expect(normalize("  Três  HORAS ")).toBe("tres horas");
    expect(normalize("９０")).toBe("90");
    expect(normalize("1​h30")).toBe("1h30");
  });
});

describe("parseDuration", () => {
  it.each([
    ["15", 15],
    ["15 min", 15],
    ["15min", 15],
    ["15 minutos", 15],
    ["1h", 60],
    ["1 h", 60],
    ["1 hora", 60],
    ["uma hora", 60],
    ["1h30", 90],
    ["1:30", 90],
    ["1 h 30 min", 90],
    ["1h 30", 90],
    ["1 hora e 30", 90],
    ["1,5 h", 90],
    ["1,5h", 90],
    ["1.5h", 90],
    ["meia hora", 30],
    ["hora e meia", 90],
    ["uma hora e meia", 90],
    ["duas horas", 120],
    ["2 horas", 120],
    ["2h", 120],
    ["90 minutos", 90],
    ["Três Minutos", 3],
    ["uns 10 min", 10],
    ["5 min cada", 5],
    ["0,5", 0.5],
    ["600", 600],
    ["10 horas", 600],
    ["９０", 90],
  ])("lê %j como %d min", (text, minutes) => {
    expect(parseDuration(text)).toEqual(ok(minutes));
  });

  it.each([
    ["0", "range"],
    ["-5", "unreadable"],
    ["0,0001", "range"],
    ["0,4", "range"],
    ["601", "range"],
    ["11 horas", "range"],
    ["1.000", "range"],
    ["1e3", "unreadable"],
    ["Infinity", "unreadable"],
    ["NaN", "unreadable"],
    ["abc", "unreadable"],
    ["", "unreadable"],
    ["   ", "unreadable"],
    ["1h99", "unreadable"],
    ["1:75", "unreadable"],
    ["1h30h", "unreadable"],
    ["x".repeat(61), "unreadable"],
    ["quinze", "unreadable"],
  ] as const)("recusa %j (%s)", (text, reason) => {
    expect(parseDuration(text)).toEqual(no(reason));
  });
});

describe("parseFrequency", () => {
  it.each([
    ["40 por semana", 40, "semana"],
    ["40 na semana", 40, "semana"],
    ["40/semana", 40, "semana"],
    ["3x ao dia", 3, "dia"],
    ["3 vezes por dia", 3, "dia"],
    ["3 por dia", 3, "dia"],
    ["todo dia", 1, "dia"],
    ["diariamente", 1, "dia"],
    ["diário", 1, "dia"],
    ["toda semana", 1, "semana"],
    ["semanalmente", 1, "semana"],
    ["toda segunda", 1, "semana"],
    ["todo mês", 1, "mes"],
    ["mensal", 1, "mes"],
    ["mensalmente", 1, "mes"],
    ["2x por mês", 2, "mes"],
    ["0,5 por dia", 0.5, "dia"],
    ["uns 20 por semana", 20, "semana"],
  ])("lê %j como %d por %s", (text, runs, period) => {
    expect(parseFrequency(text)).toEqual(ok({ runs, period }));
  });

  it("aceita só o número ou só o período e deixa a conversa perguntar o resto", () => {
    expect(parseFrequency("40")).toEqual(ok({ runs: 40, period: null }));
    expect(parseFrequency("3x")).toEqual(ok({ runs: 3, period: null }));
    expect(parseFrequency("por semana")).toEqual(ok({ runs: null, period: "semana" }));
    expect(parseFrequency("quarenta por semana")).toEqual(ok({ runs: null, period: "semana" }));
  });

  it.each([
    ["de vez em quando", "unreadable"],
    ["varia", "unreadable"],
    ["", "unreadable"],
    ["40 por semana por dia", "unreadable"],
    ["a cada 2 dias", "unreadable"],
    ["de 2 em 2 dias", "unreadable"],
    ["todo dia 5", "unreadable"],
    ["3 vezes por 2 dias", "unreadable"],
    ["10 20 por dia", "unreadable"],
    ["abc 5", "unreadable"],
    ["0 por dia", "range"],
    ["-3 por dia", "unreadable"],
    ["−3 por dia", "unreadable"],
    ["1-2 por dia", "unreadable"],
    ["100001", "range"],
    ["5000 por dia", "range"],
    ["x".repeat(61), "unreadable"],
  ] as const)("recusa %j (%s)", (text, reason) => {
    expect(parseFrequency(text)).toEqual(no(reason));
  });
});

describe("runsFit", () => {
  it("usa o teto de execuções por mês, convertendo o período", () => {
    expect(runsFit(100_000, "mes")).toBe(true);
    expect(runsFit(100_001, "mes")).toBe(false);
    expect(runsFit(4_761, "dia")).toBe(true);
    expect(runsFit(4_762, "dia")).toBe(false);
    expect(runsFit(0, "dia")).toBe(false);
    expect(runsFit(Number.NaN, null)).toBe(false);
  });
});

describe("parseMoney", () => {
  it.each([
    ["3500", 3500],
    ["3.500", 3500],
    ["R$ 3.500", 3500],
    ["R$3.500,50", 3500.5],
    ["3,5 mil", 3500],
    ["3 mil", 3000],
    ["27", 27],
    ["27,5 por hora", 27.5],
    ["40 reais", 40],
    ["R$ 40/h", 40],
  ])("lê %j como %d", (text, value) => {
    expect(parseMoney(text, 200_000)).toEqual(ok(value));
  });

  it.each([
    ["0", "range"],
    ["R$ 0", "range"],
    ["-5", "unreadable"],
    ["200.001", "range"],
    ["3.500 mil", "range"],
    ["abc", "unreadable"],
    ["", "unreadable"],
    ["3,", "unreadable"],
    ["1e3", "unreadable"],
    ["x".repeat(61), "unreadable"],
  ] as const)("recusa %j (%s)", (text, reason) => {
    expect(parseMoney(text, 200_000)).toEqual(no(reason));
  });

  it("respeita o teto de cada pergunta", () => {
    expect(parseMoney("10000", 10_000)).toEqual(ok(10_000));
    expect(parseMoney("10001", 10_000)).toEqual(no("range"));
  });
});

describe("cleanName", () => {
  it("colapsa espaços, tira controle e largura zero", () => {
    expect(cleanName("  Conferir   notas\nfiscais ")).toBe("Conferir notas fiscais");
    expect(cleanName("a​b\tc")).toBe("ab c");
  });

  it("vazio ou só espaço vira null", () => {
    expect(cleanName("")).toBeNull();
    expect(cleanName("  \n\t ")).toBeNull();
    expect(cleanName("​")).toBeNull();
  });

  it("corta em 80 caracteres sem partir emoji", () => {
    expect(cleanName("a".repeat(80))).toBe("a".repeat(80));
    expect(cleanName("a".repeat(81))).toBe("a".repeat(80));
    const emojis = cleanName("😀".repeat(81)) ?? "";
    expect(Array.from(emojis)).toHaveLength(80);
    expect(emojis.endsWith("😀")).toBe(true);
  });

  it("devolve texto cru: HTML não é interpretado nem removido", () => {
    expect(cleanName("<script>x</script>")).toBe("<script>x</script>");
  });
});
