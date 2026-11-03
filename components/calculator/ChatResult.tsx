"use client";

import type { CSSProperties, Ref } from "react";
import { sources } from "@/content/sources";
import { site } from "@/content/site";
import { K, STEP_KINDS, type CalcResult } from "@/lib/calculator";
import { formatBRL, formatFixed, formatHours, formatMinutes, formatPercent } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Odometer } from "./Odometer";
import { Orb } from "./Orb";

type Ok = Extract<CalcResult, { status: "ok" }>;

const kindOf = (id: string) => STEP_KINDS.find((k) => k.id === id);

/** "69%" quando piso e teto são iguais; senão "69 a 93%". */
function percentRange(floor: number, ceiling: number): string {
  const lo = Math.round(floor * 100);
  const hi = Math.round(ceiling * 100);
  return lo === hi ? `${lo}%` : `${lo} a ${hi}%`;
}

/**
 * "2,1 a 2,8 min"; a unidade aparece uma vez. Acima de uma hora a faixa vai em horas ("2,8 a 3,7 h"),
 * porque "2 h 46 min a 3 h 43 min" não cabe na coluna e se lê pior.
 */
function minutesRange(low: number, high: number): string {
  if (high >= 60) {
    const a = formatFixed(low / 60, 1);
    const b = formatFixed(high / 60, 1);
    return a === b ? `${a} h` : `${a} a ${b} h`;
  }
  const a = formatMinutes(low);
  const b = formatMinutes(high);
  if (a === b) return a;
  return a.endsWith(" min") && b.endsWith(" min") ? `${a.slice(0, -4)} a ${b}` : `${a} a ${b}`;
}

const perMonth = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const runsLabel = (runs: number) => (runs < 10 ? perMonth.format(runs) : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(runs)).replace(/[  ]/g, " ");

type Props = {
  result: Ok;
  name: string;
  /** Algum tempo veio de um modelo e a pessoa não mexeu. */
  fromModel: boolean;
  /** Na home o título da seção é um h2 e "A conta" é um h3; em /calculadora o H1 vem do hero. */
  titled: boolean;
  ref?: Ref<HTMLElement>;
  onRestart: () => void;
};

/**
 * O cartão de tinta do fim da conversa: o piso é o número grande e o teto vem ao lado; embaixo a conta
 * aberta, passo a passo, com a fonte de cada percentual. Faixa e fonte são o que dá credibilidade.
 */
export function ChatResult({ result, name, fromModel, titled, ref, onRestart }: Props) {
  const Heading = titled ? "h3" : "h2";
  const { low, high } = result;
  const noGain = low.hoursReturned < 0.05;
  const money = low.brlMonth !== null && high.brlMonth !== null ? { low: low.brlMonth, high: high.brlMonth } : null;

  const cta = buildWhatsAppUrl(site.contactUrl, {
    routine: name,
    steps: result.steps.length,
    hours: { low: low.hoursReturned, high: high.hoursReturned },
    brlMonth: money,
    share: { low: low.share, high: high.share },
  });

  const spoken = noGain
    ? `${name}: esses passos pedem gente. O ganho aqui é pequeno, até ${formatHours(high.hoursReturned)} horas por mês.`
    : `${name}: hoje ${formatHours(result.hoursBefore)} horas por mês. Devolve de ${formatHours(low.hoursReturned)} a ${formatHours(high.hoursReturned)} horas por mês, ${formatPercent(low.share)} a ${formatPercent(high.share)} do tempo${money ? `, de ${formatBRL(money.low)} a ${formatBRL(money.high)} por mês` : ""}.`;

  const maxMinutes = Math.max(...result.steps.map((s) => s.minutes));
  const lowText = formatHours(low.hoursReturned);

  return (
    <section ref={ref} className="chat-result theme-dark" aria-label="Resultado" tabIndex={-1} data-ui>
      <div className="result-main">
      <p className="result-echo">
        {fromModel ? <span className="flow-tag">Tempos do modelo</span> : null}
        {name}
      </p>

      {noGain ? (
        <>
          <p className="result-big result-big--text">Esses passos pedem gente.</p>
          <p className="result-sub">O ganho aqui é pequeno: até {formatHours(high.hoursReturned)} h por mês.</p>
        </>
      ) : (
        <>
          <div className="result-top">
            <div className="result-figure" style={{ "--chars": lowText.length } as CSSProperties}>
              <p className="result-big">
                <span className="sr-only">{spoken}</span>
                <Odometer text={lowText} />
                <span className="result-unit" aria-hidden="true">
                  h/mês devolvidas, até {formatHours(high.hoursReturned)}
                </span>
              </p>
            </div>
            <Orb share={low.share} />
          </div>
          <p className="result-sub" aria-hidden="true">
            {percentRange(low.share, high.share)} do tempo. Hoje são {formatHours(result.hoursBefore)} h por mês.
          </p>
          {money ? (
            <p className="result-money" aria-hidden="true">
              <span>
                <Odometer text={formatBRL(money.low)} />
                /mês
              </span>
              <span>até {formatBRL(money.high)}/mês</span>
            </p>
          ) : null}
        </>
      )}

      <div className="result-actions">
        {noGain ? null : (
          <a className="btn btn-primary" href={cta} target="_blank" rel="noopener noreferrer">
            Falar no WhatsApp
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        )}
        <button type="button" className="link-btn" onClick={onRestart}>
          Recomeçar
        </button>
      </div>
      </div>

      <div className="result-side">
      <div className="ledger">
        <Heading className="account-title">A conta</Heading>
        <ul className="ledger-list">
          {result.steps.map((s) => {
            const kind = kindOf(s.kind);
            return (
              <li key={s.kind} className="ledger-row">
                <span className="ledger-name">
                  {kind?.label}
                  <small>{kind?.source}</small>
                </span>
                <span className="ledger-bar" aria-hidden="true">
                  <span className="ledger-min" style={{ width: `${Math.max((s.minutes / maxMinutes) * 100, 3)}%` }}>
                    <b className="ledger-high" style={{ width: `${s.ceiling * 100}%` }}>
                      <i style={{ width: s.ceiling > 0 ? `${(s.floor / s.ceiling) * 100}%` : "0%" }} />
                    </b>
                  </span>
                </span>
                <span className="ledger-calc">
                  {formatMinutes(s.minutes)} × {percentRange(s.floor, s.ceiling)}
                </span>
                <span className="ledger-out">
                  {minutesRange(s.savedLow, s.savedHigh)}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="account-formula">
          Por execução voltam {minutesRange(low.perRunSaved, high.perRunSaved)} de {formatMinutes(result.perRunMinutes)}, vezes{" "}
          {runsLabel(result.runsMonth)} {result.runsMonth === 1 ? "execução" : "execuções"} por mês.
        </p>
        {!noGain ? (
          <p className="account-formula">
            Se o tempo informado for {formatPercent(K.SENSITIVITY)} menor: {formatHours(low.hoursReturned * (1 - K.SENSITIVITY))} a{" "}
            {formatHours(high.hoursReturned * (1 - K.SENSITIVITY))} h por mês.
          </p>
        ) : null}
        <p className="account-formula">Antes do custo de implantar e manter a automação.</p>
      </div>

      <p className="result-sources">
        Fontes:{" "}
        {sources.map((source, index) => (
          <span key={source.href}>
            {index > 0 ? ", " : ""}
            <a href={source.href} target="_blank" rel="noopener noreferrer">
              {source.label}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </span>
        ))}
      </p>
      </div>
    </section>
  );
}
