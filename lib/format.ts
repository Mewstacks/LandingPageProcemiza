/** Formatação e leitura pt-BR. Espaço não separável vira espaço normal. */

const brl0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const int = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const dec1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const plain = (s: string) => s.replace(/[  ]/g, " ");

export function formatBRL(n: number): string {
  return plain(brl0.format(n));
}

/** Menos de 10 h: 1 casa; a partir daí, inteiro. */
export function formatHours(h: number): string {
  return plain(h < 10 ? dec1.format(h) : int.format(h));
}

export function formatDays(days: number): string {
  return plain(days < 10 ? dec1.format(days) : int.format(days));
}

/**
 * "1.234,56" → 1234.56; "12,5" → 12.5; "1.234" → 1234; "12.5" → 12.5.
 * Lixo → null. Vazio → null.
 */
export function parseDecimalPtBR(input: string): number | null {
  const s = input.replace(/R\$|\s/g, "");
  if (s === "") return null;
  let normalized: string;
  if (s.includes(",")) {
    if (!/^\d{1,3}(\.\d{3})*,\d+$|^\d+,\d+$/.test(s)) return null;
    normalized = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    normalized = s.replace(/\./g, "");
  } else if (/^\d+(\.\d+)?$/.test(s)) {
    normalized = s;
  } else {
    return null;
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}
