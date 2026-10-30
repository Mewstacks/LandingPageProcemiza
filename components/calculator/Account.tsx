"use client";

import { K } from "@/lib/calculator";
import { formatBRL, formatBRL2, formatFixed, formatPercent } from "@/lib/format";
import { kindLabel } from "@/lib/routine";
import { useRoutine } from "./RoutineProvider";

type Props = {
  uid: string;
  active: number | null;
  onActive: (index: number | null) => void;
  /** Nível do título: h3 abaixo do título da seção; h2 quando a seção não tem título próprio. */
  heading?: "h2" | "h3";
};

/** 40 → "40"; 1,5 → "1,5". */
const plain = (n: number) => formatFixed(n, Number.isInteger(n) ? 0 : 1);

/**
 * A conta inteira à vista: uma barra por passo (o cinza é o tempo do passo, o laranja é a parte que
 * volta) com a multiplicação escrita ao lado, e embaixo as contas do mês e do dinheiro. Passar o
 * mouse numa linha acende o passo na faixa do resultado.
 */
export function Account({ uid, active, onActive, heading: Heading = "h3" }: Props) {
  const { fields, view } = useRoutine();
  const { result, input, hourly } = view;
  if (result.status !== "ok") return null;
  const ok = result;

  const runs = input.runs ?? 0;
  const perMonth = formatFixed(ok.runsMonth, 1);
  const stepsReturned = (ok.perRunSaved * ok.runsMonth) / 60;
  const factor = formatFixed(1 + K.ENCARGOS[fields.regime], 1);
  // A subtração impressa tem que fechar com os números que a pessoa vê, então usa os já arredondados.
  const tenth = (n: number) => Math.round(n * 10) / 10;
  const afterShown = tenth(tenth(ok.hoursBefore) - tenth(ok.hoursReturned));
  // As barras dividem a mesma régua: o passo mais longo ocupa a linha toda.
  const longest = Math.max(...ok.steps.map((step) => step.minutes), 0.0001);

  const execLine =
    fields.period === "dia"
      ? `${plain(runs)} por dia × ${K.WORKDAYS_MONTH} dias úteis = ${perMonth} por mês`
      : fields.period === "semana"
        ? `${plain(runs)} por semana × ${formatFixed(K.WEEKS_MONTH, 2)} semanas = ${perMonth} por mês`
        : `${plain(runs)} por mês`;

  const titleId = `${uid}-conta`;
  return (
    <section className="calc-account" aria-labelledby={titleId}>
      <Heading id={titleId} className="account-title">
        A conta
      </Heading>

      <div className="ledger">
        <ul className="ledger-list" role="list">
          {ok.steps.map((step, index) => (
            <li
              key={index}
              className="ledger-row"
              data-active={active === index ? "true" : undefined}
              onMouseEnter={() => onActive(index)}
              onMouseLeave={() => onActive(null)}
            >
              <span className="ledger-name">
                {view.stepNames[index]}
                <small>{kindLabel(step.kind)}</small>
              </span>
              <span className="ledger-bar" aria-hidden="true">
                <i className="ledger-min" style={{ width: `${(step.minutes / longest) * 100}%` }}>
                  <b style={{ width: `${step.minutes > 0 ? (step.savedMinutes / step.minutes) * 100 : 0}%` }} />
                </i>
              </span>
              <span className="ledger-calc">
                {formatFixed(step.minutes, 1)} min × {formatPercent(step.coverage)}
              </span>
              <span className="ledger-out">{formatFixed(step.savedMinutes, 1)} min voltam</span>
            </li>
          ))}
        </ul>
        <p className="ledger-sum">
          <span>Uma execução</span>
          <span>{formatFixed(ok.perRunMinutes, 1)} min</span>
          <span>{formatFixed(ok.perRunSaved, 1)} min voltam</span>
        </p>
        <p className="account-formula">Volta = minutos × automatiza × (1 − {formatPercent(input.exceptions)} de exceções)</p>
      </div>

      <dl className="account-lines">
        <div>
          <dt>Execuções</dt>
          <dd>{execLine}</dd>
        </div>

        <div>
          <dt>Horas</dt>
          <dd>
            {formatFixed(ok.perRunMinutes, 1)} min × {perMonth} = {formatFixed(ok.stepsHoursMonth, 1)} h hoje; {formatFixed(ok.perRunSaved, 1)} min × {perMonth} ={" "}
            {formatFixed(stepsReturned, 1)} h voltam
          </dd>
        </div>

        {ok.rework ? (
          <>
            <div>
              <dt>Retrabalho</dt>
              <dd>
                {formatPercent(input.rework?.percent ?? 0)} refeitas × {formatFixed(input.rework?.minutes ?? 0, 1)} min × {perMonth} ={" "}
                {formatFixed(ok.rework.hoursBefore, 1)} h; voltam {formatFixed(ok.rework.hoursReturned, 1)} h
              </dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>
                {formatFixed(ok.hoursBefore, 1)} h hoje; {formatFixed(ok.hoursReturned, 1)} h voltam; {formatFixed(afterShown, 1)} h depois
              </dd>
            </div>
          </>
        ) : null}

        {hourly != null && Number.isFinite(hourly) && fields.costMode === "salario" ? (
          <div>
            <dt>Hora</dt>
            <dd>
              R$ {fields.cost} × {factor} ÷ {K.LEGAL_HOURS_MONTH} = {formatBRL2(hourly)}
            </dd>
          </div>
        ) : null}

        {ok.brlMonth !== null && ok.brlYear !== null && hourly != null ? (
          <div>
            <dt>Reais</dt>
            <dd>
              {formatFixed(ok.hoursReturned, 1)} h × {formatBRL2(hourly)} = {formatBRL(ok.brlMonth)}/mês; × 12 = {formatBRL(ok.brlYear)}/ano
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
