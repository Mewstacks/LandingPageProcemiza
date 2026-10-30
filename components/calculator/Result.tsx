"use client";

import { site } from "@/content/site";
import { formatBRL, formatDays, formatHours, formatPercent } from "@/lib/format";
import { PRESETS } from "@/lib/routine";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useDebounced } from "./fields";
import { Odometer } from "./Odometer";
import { Orb } from "./Orb";
import { useRoutine } from "./RoutineProvider";
import { Timeline } from "./Timeline";

/** "≈ 2,9 dias de trabalho"; abaixo de um dia fica no singular, e o quase nada não vira "0,0 dias". */
function daysLabel(days: number): string {
  if (days < 0.1) return "menos de 0,1 dia de trabalho";
  return `≈ ${formatDays(days)} ${days <= 1 ? "dia" : "dias"} de trabalho`;
}

type Props = { active: number | null; onActive: (index: number | null) => void };

/** O cartão de tinta: o número grande rola enquanto a pessoa digita e a faixa mostra de onde ele vem. */
export function Result({ active, onActive }: Props) {
  const { fields, view, fill } = useRoutine();
  const { result } = view;
  const ok = result.status === "ok" ? result : null;
  const money = ok && ok.brlMonth !== null && ok.brlYear !== null ? { month: ok.brlMonth, year: ok.brlYear } : null;

  const cta = buildWhatsAppUrl(
    site.contactUrl,
    view.isExample || !ok
      ? undefined
      : {
          routine: fields.routine,
          steps: ok.steps.length,
          hoursReturned: ok.hoursReturned,
          brlMonth: ok.brlMonth,
          share: ok.share,
        },
  );

  const spoken = ok
    ? `${view.routine}: hoje ${formatHours(ok.hoursBefore)} horas por mês. Devolve cerca de ${formatHours(ok.hoursReturned)} horas por mês, ${formatPercent(ok.share)} do tempo${money ? `, ${formatBRL(money.month)} por mês` : ""}.`
    : "Confira os campos para ver o resultado.";
  const announced = useDebounced(spoken);

  return (
    <section className="calc-result theme-dark" aria-label="Resultado" data-ui data-example={view.isExample ? "true" : undefined}>
      {ok ? (
        <>
          <p className="result-echo">
            {view.isExample ? <span className="flow-tag">Exemplo</span> : null}
            {view.routine}
          </p>

          <div className="result-top">
            <p className="result-big">
              <span className="sr-only">{formatHours(ok.hoursReturned)} horas por mês devolvidas</span>
              <Odometer text={formatHours(ok.hoursReturned)} />
              <span className="result-unit" aria-hidden="true">
                h/mês devolvidas
              </span>
            </p>
            <Orb share={ok.share} />
          </div>
          <p className="result-sub">
            {formatPercent(ok.share)} do tempo, {daysLabel(ok.hoursReturned / 8)}
          </p>

          {money ? (
            <p className="result-money">
              <span className="sr-only">
                {formatBRL(money.month)} por mês, {formatBRL(money.year)} por ano
              </span>
              <span aria-hidden="true">
                <Odometer text={formatBRL(money.month)} />
                /mês
              </span>
              <span aria-hidden="true">
                <Odometer text={formatBRL(money.year)} />
                /ano
              </span>
            </p>
          ) : null}

          <Timeline
            steps={ok.steps}
            names={view.stepNames}
            total={ok.perRunMinutes}
            remain={ok.perRunRemain}
            saved={ok.perRunSaved}
            active={active}
            onActive={onActive}
          />

          <div className="result-actions">
            <a className="btn btn-primary" href={cta} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
            <span className="result-note">Estimativa</span>
          </div>
        </>
      ) : result.status === "empty" ? (
        <>
          <p className="result-echo">Falta frequência ou minutos.</p>
          <div className="result-actions">
            <button type="button" className="btn btn-primary" onClick={() => fill(PRESETS[0])}>
              Ver exemplo
            </button>
          </div>
        </>
      ) : (
        <p className="result-echo">Revise os campos.</p>
      )}
      <p className="sr-only" role="status" aria-atomic="true">
        {announced}
      </p>
    </section>
  );
}

/** Só no celular: o número fica à vista enquanto os passos rolam. Decorativo, quem lê usa o cartão. */
export function Live({ hidden }: { hidden: boolean }) {
  const { view } = useRoutine();
  const { result } = view;
  if (result.status !== "ok") return null;
  return (
    <div className="calc-live theme-dark" aria-hidden="true" data-ui data-hidden={hidden ? "true" : undefined}>
      <span className="live-num">
        <Odometer text={formatHours(result.hoursReturned)} />
        <span> h/mês</span>
      </span>
      <span className="live-share">{formatPercent(result.share)} do tempo</span>
    </div>
  );
}
