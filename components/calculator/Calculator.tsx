"use client";

import { useId } from "react";
import { site } from "@/content/site";
import { K } from "@/lib/calculator";
import { formatBRL, formatBRL2, formatDays, formatFixed, formatHours } from "@/lib/format";
import { buildWhatsAppUrl, ROUTINE_MAX } from "@/lib/whatsapp";
import { Field, UNIT_LABEL, UnitSelect, errorText, useDebounced } from "./fields";
import { PRESETS, useRoutine, type CostMode, type Regime } from "./RoutineProvider";

function Segmented<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      <div>
        {options.map((o) => (
          <label key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Calculator() {
  const uid = useId();
  const { fields, view, set, fill, reset } = useRoutine();
  const { result, errors, hourly } = view;
  const ok = result.status === "ok" ? result : null;
  const exp = ok?.expected;
  const opt = ok?.optimistic;
  const hasMoney = exp?.brlMonth != null && opt?.brlMonth != null;

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

  const costLabel = fields.costMode === "salario" ? "Salário mensal" : "Valor da hora";
  const factor = 1 + K.ENCARGOS[fields.regime];

  return (
    <div className="calc">
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
                placeholder="2"
                value={fields.people}
                onChange={(e) => set("people", e.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="cost-block">
          <Segmented<CostMode>
            name={`${uid}-modo`}
            legend="Custo"
            value={fields.costMode}
            options={[
              { value: "salario", label: "Salário mensal" },
              { value: "hora", label: "Valor da hora" },
            ]}
            onChange={(v) => set("costMode", v)}
          />
          <div className="field-row">
            <Field id={`${uid}-custo`} label={costLabel} error={errorText(errors, "cost")}>
              {(a) => (
                <div className="input-prefix">
                  <span aria-hidden="true">R$</span>
                  <input
                    {...a}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={fields.costMode === "salario" ? "3.500" : "27"}
                    value={fields.cost}
                    onChange={(e) => set("cost", e.target.value)}
                  />
                </div>
              )}
            </Field>
            {fields.costMode === "salario" ? (
              <Field id={`${uid}-regime`} label="Regime" className="field-narrow">
                {(a) => (
                  <select {...a} value={fields.regime} onChange={(e) => set("regime", e.target.value as Regime)}>
                    <option value="clt">CLT</option>
                    <option value="simples">Simples</option>
                  </select>
                )}
              </Field>
            ) : null}
          </div>
        </div>

        <details className="premises">
          <summary>Premissas</summary>
          <Field id={`${uid}-pct`} label="Redução do tempo (%)" error={errorText(errors, "pct")}>
            {(a) => (
              <input
                {...a}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={fields.pct}
                onChange={(e) => set("pct", e.target.value)}
              />
            )}
          </Field>
        </details>

      </form>

      <section className="calc-result" aria-label="Resultado" data-example={view.isExample ? "true" : undefined}>
        {ok && exp && opt ? (
          <>
            <p className="result-echo">
              {view.isExample ? <span className="flow-tag">Exemplo</span> : null}
              “{view.routine}” consome {formatHours(ok.totalMonth)} h/mês hoje.
            </p>
            <p className="result-big">
              {hasMoney ? formatBRL(exp.brlMonth!) : `${formatHours(exp.hours)} h`}
              <span> /mês devolvidos</span>
            </p>
            <p className="result-range">
              {hasMoney ? `até ${formatBRL(opt.brlMonth!)}` : `até ${formatHours(opt.hours)} h`} com {Math.round(opt.pct * 100)}%
            </p>
            <dl className="result-stats">
              <div>
                <dt>Horas por mês</dt>
                <dd>{formatHours(exp.hours)} h</dd>
              </div>
              <div>
                <dt>Dias de trabalho</dt>
                <dd>{formatDays(exp.hours / 8)}</dd>
              </div>
              <div>
                <dt>Por ano</dt>
                <dd>{exp.brlYear != null ? formatBRL(exp.brlYear) : "—"}</dd>
              </div>
            </dl>
            {!hasMoney ? <p className="result-hint">Informe o custo para ver em reais.</p> : null}

            <details className="method">
              <summary>Conta</summary>
              <ol>
                <li>
                  {formatFixed(view.input.amount ?? 0, 1)} {UNIT_LABEL[view.input.unit]} → {formatFixed(ok.perPersonMonth)} h/mês por pessoa
                </li>
                <li>
                  × {Math.round(view.input.people)} {Math.round(view.input.people) === 1 ? "pessoa" : "pessoas"} = {formatFixed(ok.totalMonth)} h/mês
                </li>
                <li>
                  × {Math.round(exp.pct * 100)}% = {formatFixed(exp.hours)} h/mês devolvidas
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
                <li className="method-assumptions">
                  {K.WORKDAYS_MONTH} dias úteis/mês · {formatFixed(K.WEEKS_MONTH, 2)} semanas/mês · divisor {K.LEGAL_HOURS_MONTH} · encargos {Math.round(K.ENCARGOS[fields.regime] * 100)}%
                </li>
              </ol>
            </details>

            <a className="btn btn-primary" href={cta} target="_blank" rel="noopener noreferrer">
              Conversar no WhatsApp<span className="arrow" aria-hidden="true">↗</span>
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
            <p className="result-note">Estimativa, não promessa.</p>
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
