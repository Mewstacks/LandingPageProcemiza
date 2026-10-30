"use client";

import { useId } from "react";
import { site } from "@/content/site";
import { K } from "@/lib/calculator";
import { formatBRL, formatBRL2, formatDays, formatFixed, formatHours } from "@/lib/format";
import { buildWhatsAppUrl, ROUTINE_MAX } from "@/lib/whatsapp";
import { Field, UNIT_LABEL, UnitSelect, errorText, useDebounced } from "./fields";
import { FlatBars } from "./FlatBars";
import { PRESETS, useRoutine, type CostMode } from "./RoutineProvider";

const COST_LABEL: Record<CostMode, string> = { hora: "R$/hora", salario: "R$/mês" };

/** "≈ 8,7 dias de trabalho"; abaixo de um dia fica no singular, e o quase nada não vira "0,0 dias". */
function daysLabel(days: number): string {
  if (days < 0.1) return "menos de 0,1 dia de trabalho";
  return `≈ ${formatDays(days)} ${days <= 1 ? "dia" : "dias"} de trabalho`;
}

/** Uma conta só: o que a pessoa digita muda, ao vivo, a barra e os números ao lado. */
export function Calculator() {
  const uid = useId();
  const { fields, view, set, fill, reset } = useRoutine();
  const { result, errors, hourly } = view;
  const ok = result.status === "ok" ? result : null;
  const exp = ok?.expected;
  const opt = ok?.optimistic;
  const hasMoney = exp?.brlMonth != null && exp?.brlYear != null;

  const cta = buildWhatsAppUrl(site.contactUrl, {
    routine: view.isExample ? undefined : view.routine,
    hoursReturned: exp?.hours,
    brlMonth: exp?.brlMonth,
    pct: exp?.pct,
  });

  const spoken = ok
    ? `${view.routine}: ${formatHours(ok.totalMonth)} horas por mês hoje. Devolve cerca de ${formatHours(exp!.hours)} horas por mês${hasMoney ? `, ${formatBRL(exp!.brlMonth!)} por mês` : ""}.`
    : "Confira os campos para ver o resultado.";
  const announced = useDebounced(spoken);

  const factor = 1 + K.ENCARGOS[fields.regime];

  return (
    <div className="calc">
      <div className="calc-left">
      <form className="calc-form" onSubmit={(e) => e.preventDefault()} noValidate>
        <Field id={`${uid}-rotina`} label="Rotina">
          {(a) => (
            <input
              {...a}
              type="text"
              maxLength={ROUTINE_MAX}
              autoComplete="off"
              placeholder="Conferir notas fiscais"
              value={fields.routine}
              onChange={(e) => set("routine", e.target.value)}
            />
          )}
        </Field>

        <ul className="chips" aria-label="Exemplos">
          {PRESETS.map((p) => (
            <li key={p.label}>
              <button type="button" className="chip" onClick={() => fill(p.fields)}>
                {p.label}
              </button>
            </li>
          ))}
          {!view.isExample ? (
            <li>
              <button type="button" className="chip chip-ghost" onClick={reset}>
                Limpar
              </button>
            </li>
          ) : null}
        </ul>

        <div className="field-row">
          <Field id={`${uid}-tempo`} label="Tempo por pessoa" error={errorText(errors, "amount")}>
            {(a) => (
              <div className="input-unit">
                <input
                  {...a}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="10"
                  value={fields.amount}
                  onChange={(e) => set("amount", e.target.value)}
                />
                <UnitSelect id={`${uid}-un`} value={fields.unit} onChange={(u) => set("unit", u)} />
              </div>
            )}
          </Field>
          <Field id={`${uid}-pessoas`} label="Pessoas" error={errorText(errors, "people")} className="field-narrow">
            {(a) => (
              <input
                {...a}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={view.isExample ? "2" : "1"}
                value={fields.people}
                onChange={(e) => set("people", e.target.value)}
              />
            )}
          </Field>
        </div>

        <Field id={`${uid}-custo`} label="Custo da pessoa" error={errorText(errors, "cost")}>
          {(a) => (
            <div className="input-unit">
              <input
                {...a}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={fields.costMode === "salario" ? "3.500 (opcional)" : "27 (opcional)"}
                value={fields.cost}
                onChange={(e) => set("cost", e.target.value)}
              />
              <select
                id={`${uid}-custo-un`}
                aria-label="Unidade do custo"
                value={fields.costMode}
                onChange={(e) => set("costMode", e.target.value as CostMode)}
              >
                {(Object.keys(COST_LABEL) as CostMode[]).map((mode) => (
                  <option key={mode} value={mode}>{COST_LABEL[mode]}</option>
                ))}
              </select>
            </div>
          )}
        </Field>
      </form>

      {ok && exp && opt ? (
        <details className="method">
          <summary>
            <span className="method-closed">Ver a conta</span>
            <span className="method-open">Esconder a conta</span>
          </summary>
          <ol>
            <li>
              {formatFixed(view.input.amount ?? 0, 1)} {UNIT_LABEL[view.input.unit]} → {formatFixed(ok.perPersonMonth)} h/mês por pessoa
            </li>
            <li>
              × {Math.round(view.input.people)} {Math.round(view.input.people) === 1 ? "pessoa" : "pessoas"} = {formatFixed(ok.totalMonth)} h/mês
            </li>
            <li>
              × {Math.round(exp.pct * 100)}% = {formatFixed(exp.hours)} h/mês devolvidas ({Math.round(opt.pct * 100)}% no otimista)
            </li>
            {hourly != null && Number.isFinite(hourly) ? (
              <li>
                {fields.costMode === "salario"
                  ? `Hora: R$ ${fields.cost} × ${formatFixed(factor, 1)} ÷ ${K.LEGAL_HOURS_MONTH} = ${formatBRL2(hourly)}`
                  : `Hora: ${formatBRL2(hourly)}`}
              </li>
            ) : null}
            {hasMoney ? (
              <li>
                {formatFixed(exp.hours)} h × {formatBRL2(hourly!)} = {formatBRL2(exp.brlMonth!)}/mês · × 12 = {formatBRL(exp.brlYear!)}/ano
              </li>
            ) : null}
          </ol>
        </details>
      ) : null}
      </div>

      <section className="calc-result theme-dark" aria-label="Resultado" data-ui data-example={view.isExample ? "true" : undefined}>
        {ok && exp && opt ? (
          <>
            <p className="result-echo">
              {view.isExample ? <span className="flow-tag">Exemplo</span> : null}
              {view.routine}
            </p>

            <p className="result-big">
              {formatHours(exp.hours)}
              <span> h/mês devolvidas</span>
            </p>
            <p className="result-sub">
              {daysLabel(exp.hours / 8)}, até {formatHours(opt.hours)} h
            </p>

            <FlatBars total={ok.totalMonth} returned={exp.hours} />

            {hasMoney ? (
              <p className="result-money">
                <span>{formatBRL(exp.brlMonth!)}/mês</span>
                <span>{formatBRL(exp.brlYear!)}/ano</span>
              </p>
            ) : null}

            <div className="result-actions">
              <a className="btn btn-primary" href={cta} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
              <span className="result-note">Estimativa</span>
            </div>
          </>
        ) : (
          <p className="result-echo">Revise os campos.</p>
        )}
        <p className="sr-only" role="status" aria-atomic="true">
          {announced}
        </p>
      </section>
    </div>
  );
}
