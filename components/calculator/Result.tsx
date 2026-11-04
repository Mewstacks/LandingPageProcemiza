import type { CSSProperties } from "react";
import { formatBRL, formatHours } from "@/lib/format";
import type { Invalid, Outcome } from "@/lib/plan";
import { Odometer } from "./Odometer";

type Props = {
  outcome: Outcome | Invalid;
  revealed: boolean;
  /** E-mail para onde o relatório foi, quando foi. */
  sentTo: string | null;
  spoken: string;
  /** O que a pessoa montou, uma linha por item. */
  recap: string[];
  whatsappUrl: string;
  onReveal: () => void;
  onReport: () => void;
};

const SOURCES = "MIT SMR 2016 · LSE 2015 · MGI 2023";

/**
 * O painel de tinta. Antes do clique é um esqueleto com um botão só. Depois, o número do Teto em
 * dígitos que rolam, o Prudente ao lado e a faixa em barra. Os dígitos são desenho (`aria-hidden`):
 * quem fala é `spoken`, numa região educada.
 */
export function Result({ outcome, revealed, sentTo, spoken, recap, whatsappUrl, onReveal, onReport }: Props) {
  const ok = outcome.status === "ok";

  if (!revealed || !ok) {
    return (
      <section className="live theme-dark" aria-label="Resultado" data-ui>
        <div className="live-sticky">
        <ul className="live-recap">
          {recap.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        <div className="live-actions">
          <button type="button" className="btn btn-primary live-action" onClick={onReveal} disabled={!ok}>
            Ver resultado
          </button>
        </div>
        </div>
      </section>
    );
  }

  const text = formatBRL(outcome.ceiling.brlYear);
  return (
    <section className="live theme-dark" aria-label="Resultado" data-ui>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{spoken}</p>
      <div className="live-sticky">
      <div className="live-body" aria-hidden="true">
        <p className="live-label">Devolvidos por ano, até</p>
        <div className="live-figure" style={{ "--chars": text.length } as CSSProperties}>
          <p className="live-big"><Odometer text={text} /></p>
        </div>
        <div className="bar" style={{ "--high": outcome.ceiling.share } as CSSProperties}>
          <span className="bar-high" />
        </div>
        <p className="bar-legend">
          <span>Voltam até <b>{formatHours(outcome.ceiling.hours)} h</b> por mês</span>
          <span>Hoje {formatHours(outcome.hoursBefore)} h</span>
        </p>
        <p className="live-sources">{SOURCES}</p>
      </div>
      <div className="live-actions">
        {sentTo ? (
          <>
            <p className="live-sent" role="status">Relatório enviado para {sentTo}</p>
            <a className="btn btn-primary live-action" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp<span className="sr-only"> (abre em nova aba)</span>
            </a>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-primary live-action" onClick={onReport}>Receber relatório</button>
            <a className="btn btn-ghost live-action" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp<span className="sr-only"> (abre em nova aba)</span>
            </a>
          </>
        )}
      </div>
      </div>
    </section>
  );
}
