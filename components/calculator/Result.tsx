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
  whatsappUrl: string;
  onReveal: () => void;
  onReport: () => void;
};

const SOURCES = "MIT SMR 2016 · LSE 2015 · MGI 2023";

const range = (a: number, b: number) => (formatHours(a) === formatHours(b) ? `${formatHours(a)} h` : `${formatHours(a)} a ${formatHours(b)} h`);

/**
 * O painel de tinta. Antes do clique é um esqueleto com um botão só. Depois, o número do Teto em
 * dígitos que rolam, o Prudente ao lado e a faixa em barra. Os dígitos são desenho (`aria-hidden`):
 * quem fala é `spoken`, numa região educada.
 */
export function Result({ outcome, revealed, sentTo, spoken, whatsappUrl, onReveal, onReport }: Props) {
  const ok = outcome.status === "ok";

  if (!revealed || !ok) {
    return (
      <section className="live theme-dark" aria-label="Resultado" data-ui>
        <div className="live-sticky">
        <div className="live-body" aria-hidden="true">
          <p className="live-label">Devolvidos por ano, até</p>
          <p className="live-big live-big--empty">R$ ———</p>
          <p className="live-sub live-sub--empty">Prudente <b>R$ ———</b></p>
          <div className="bar" />
          <p className="bar-legend">
            <span>Voltam <b>— h</b> por mês</span>
            <span>Hoje — h</span>
          </p>
          <p className="live-sources">{SOURCES}</p>
        </div>
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
        <p className="live-sub">Prudente <b>{formatBRL(outcome.prudent.brlYear)}</b></p>
        <div className="bar" style={{ "--high": outcome.ceiling.share, "--low": outcome.prudent.share } as CSSProperties}>
          <span className="bar-high" />
          <span className="bar-low" />
        </div>
        <p className="bar-legend">
          <span>Voltam <b>{range(outcome.prudent.hours, outcome.ceiling.hours)}</b> por mês</span>
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
