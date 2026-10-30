import type { CSSProperties } from "react";
import { formatHours } from "@/lib/format";

/**
 * Duas barras planas: o mês de hoje e o mês depois da automação. Só `transform` anima
 * (escala horizontal a partir da esquerda), então a barra acompanha cada tecla sem refazer layout.
 */
export function FlatBars({ total, returned }: { total: number; returned: number }) {
  const left = Math.max(total - returned, 0);
  const ratio = total > 0 ? Math.min(Math.max(left / total, 0.04), 1) : 0.04;
  return (
    <div className="bars">
      <div className="bar" style={{ "--r": 1 } as CSSProperties}>
        <span className="bar-label">Hoje</span>
        <span className="bar-value">{formatHours(total)} h/mês</span>
        <span className="bar-track">
          <i className="bar-fill bar-fill--today" />
        </span>
      </div>
      <div className="bar" style={{ "--r": ratio } as CSSProperties}>
        <span className="bar-label">Com a Procemiza</span>
        <span className="bar-value">{formatHours(left)} h/mês</span>
        <span className="bar-track">
          <i className="bar-fill bar-fill--after" />
        </span>
      </div>
    </div>
  );
}
