import { describe, expect, it } from "vitest";
import { formatBRL, formatDays, formatHours, formatMinutes, formatPercent, parseDecimalPtBR } from "./format";

describe("parseDecimalPtBR", () => {
  it.each([
    ["1.234,56", 1234.56],
    ["1234,56", 1234.56],
    ["12,5", 12.5],
    ["1.234", 1234],
    ["12.5", 12.5],
    ["40", 40],
    ["R$ 3.500", 3500],
    ["  7 ", 7],
  ])("%s → %d", (input, out) => expect(parseDecimalPtBR(input)).toBe(out));

  it.each(["", "   ", "abc", "1,2,3", "1..2", "12,", ",5", "1e9", "--3", "R$"])("rejeita %j", (input) =>
    expect(parseDecimalPtBR(input)).toBeNull(),
  );
});

describe("formatação", () => {
  it("BRL sem casas e sem NBSP", () => {
    expect(formatBRL(1008)).toBe("R$ 1.008");
    expect(formatBRL(12096.4)).toBe("R$ 12.096");
  });
  it("horas: 1 casa abaixo de 10, inteiro acima", () => {
    expect(formatHours(8.65)).toMatch(/^8,[67]$/);
    expect(formatHours(25.2)).toBe("25");
  });
  it("dias", () => {
    expect(formatDays(3.15)).toMatch(/^3,[12]$/);
    expect(formatDays(12.4)).toBe("12");
  });
  it("minutos: até uma casa abaixo de uma hora, horas e minutos acima", () => {
    expect(formatMinutes(8)).toBe("8 min");
    expect(formatMinutes(1.5)).toBe("1,5 min");
    expect(formatMinutes(1.99)).toBe("2 min");
    expect(formatMinutes(0.04)).toBe("0 min");
    expect(formatMinutes(59.7)).toBe("59,7 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(90)).toBe("1 h 30 min");
    expect(formatMinutes(119.6)).toBe("2 h");
    expect(formatMinutes(Number.NaN)).toBe("");
  });
  it("percentual inteiro, sem NBSP", () => {
    expect(formatPercent(0.801)).toBe("80%");
    expect(formatPercent(1)).toBe("100%");
    expect(formatPercent(0)).toBe("0%");
  });
});
