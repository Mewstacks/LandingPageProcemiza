import { describe, expect, it } from "vitest";
import { allow } from "./ratelimit";

describe("limite por chave", () => {
  it("bloqueia depois do limite e libera quando a janela passa", () => {
    expect([1, 2, 3].map((i) => allow("a", 3, 1000, i))).toEqual([true, true, true]);
    expect(allow("a", 3, 1000, 4)).toBe(false);
    expect(allow("a", 3, 1000, 1500)).toBe(true);
  });
  it("chaves independentes", () => {
    expect(allow("x", 1, 1000, 1)).toBe(true);
    expect(allow("y", 1, 1000, 1)).toBe(true);
  });
});
