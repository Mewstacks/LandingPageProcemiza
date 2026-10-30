"use client";

import { K } from "@/lib/calculator";
import { formatBRL, formatBRL2, formatFixed, formatPercent } from "@/lib/format";
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
 * A conta inteira à vista, sem texto em volta: a tabela por passo e uma linha por multiplicação,
 * todas com os números da pessoa. Passar o mouse numa linha acende o passo na faixa do resultado.
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

      <div className="account-grid">
        <div>
          <table className="account-table">
            <caption className="sr-only">Minutos de uma execução, por passo</caption>
            <thead>
              <tr>
                <th scope="col">Passo</th>
                <th scope="col">Min</th>
                <th scope="col">Automatiza</th>
                <th scope="col">Volta</th>
              </tr>
            </thead>
            <tbody>
              {ok.steps.map((step, index) => (
                <tr
                  key={index}
                  data-active={active === index ? "true" : undefined}
                  onMouseEnter={() => onActive(index)}
                  onMouseLeave={() => onActive(null)}
                >
                  <th scope="row">{view.stepNames[index]}</th>
                  <td>{formatFixed(step.minutes, 1)}</td>
                  <td>{formatPercent(step.coverage)}</td>
                  <td>{formatFixed(step.savedMinutes, 1)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Uma execução</th>
                <td>{formatFixed(ok.perRunMinutes, 1)}</td>
                <td />
                <td>{formatFixed(ok.perRunSaved, 1)}</td>
              </tr>
            </tfoot>
          </table>
          <p className="account-formula">Volta = minutos × automatiza × (1 − {formatPercent(input.exceptions)} de exceções)</p>
        </div>

        <dl className="account-lines">
          <dt>Execuções</dt>
          <dd>{execLine}</dd>

          <dt>Horas</dt>
          <dd>
            {formatFixed(ok.perRunMinutes, 1)} min × {perMonth} = {formatFixed(ok.stepsHoursMonth, 1)} h hoje; {formatFixed(ok.perRunSaved, 1)} min × {perMonth} ={" "}
            {formatFixed(stepsReturned, 1)} h voltam
          </dd>

          {ok.rework ? (
            <>
              <dt>Retrabalho</dt>
              <dd>
                {formatPercent(input.rework?.percent ?? 0)} refeitas × {formatFixed(input.rework?.minutes ?? 0, 1)} min × {perMonth} ={" "}
                {formatFixed(ok.rework.hoursBefore, 1)} h; voltam {formatFixed(ok.rework.hoursReturned, 1)} h
              </dd>

              <dt>Total</dt>
              <dd>
                {formatFixed(ok.hoursBefore, 1)} h hoje; {formatFixed(ok.hoursReturned, 1)} h voltam; {formatFixed(afterShown, 1)} h depois
              </dd>
            </>
          ) : null}

          {hourly != null && Number.isFinite(hourly) && fields.costMode === "salario" ? (
            <>
              <dt>Hora</dt>
              <dd>
                R$ {fields.cost} × {factor} ÷ {K.LEGAL_HOURS_MONTH} = {formatBRL2(hourly)}
              </dd>
            </>
          ) : null}

          {ok.brlMonth !== null && ok.brlYear !== null && hourly != null ? (
            <>
              <dt>Reais</dt>
              <dd>
                {formatFixed(ok.hoursReturned, 1)} h × {formatBRL2(hourly)} = {formatBRL(ok.brlMonth)}/mês; × 12 = {formatBRL(ok.brlYear)}/ano
              </dd>
            </>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
