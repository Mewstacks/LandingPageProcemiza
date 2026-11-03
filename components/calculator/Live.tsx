import type { CSSProperties } from "react";
import { formatBRL, formatHours } from "@/lib/format";
import type { Ok } from "@/lib/estimate";
import { Odometer } from "./Odometer";

/**
 * O número do painel de tinta: o piso em dígitos que rolam. O teto e o tempo de hoje ficam na conta
 * logo abaixo (barra) e, no celular, numa linha curta aqui. Os dígitos são desenho (`aria-hidden`):
 * quem fala é `spoken`, numa região educada que só muda depois que a pessoa para de mexer.
 */
export function Live({ result, spoken }: { result: Ok; spoken: string }) {
  const { low, high } = result;
  const noGain = low.hoursReturned < 0.05;
  const lowText = formatHours(low.hoursReturned);
  const money = low.brlMonth !== null && high.brlMonth !== null ? { low: low.brlMonth, high: high.brlMonth } : null;

  return (
    <section className="live theme-dark" aria-label="Resultado" data-ui>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {spoken}
      </p>
      {noGain ? (
        <div className="live-body live-body--text" aria-hidden="true">
          <p className="live-text">Isso pede gente.</p>
          <p className="live-sub">Ganho de até {formatHours(high.hoursReturned)} h por mês.</p>
        </div>
      ) : (
        <div className="live-body" aria-hidden="true">
          <div className="live-figure" style={{ "--chars": lowText.length } as CSSProperties}>
            <p className="live-big">
              <Odometer text={lowText} />
            </p>
          </div>
          <p className="live-unit">h/mês devolvidas</p>
          <p className="live-sub">
            até {formatHours(high.hoursReturned)} h · hoje {formatHours(result.hoursBefore)} h
          </p>
          {money ? (
            <p className="live-money">
              <span>
                <Odometer text={formatBRL(money.low)} />
                /mês
              </span>
              <span>até {formatBRL(money.high)}</span>
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
