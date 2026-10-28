"use client";

import type { CSSProperties } from "react";
import { useId } from "react";
import { formatBRL, formatDays, formatHours } from "@/lib/format";
import { ROUTINE_MAX } from "@/lib/whatsapp";
import { Field, UnitSelect, errorText, useDebounced } from "./fields";
import { PRESETS, useRoutine } from "./RoutineProvider";

const STEPS = ["Copiar", "Conferir", "Digitar", "Avisar"];

export function HeroRoutine() {
  const uid = useId();
  const { fields, view, set, fill, reset } = useRoutine();
  const { result, errors } = view;

  const ok = result.status === "ok" ? result : null;
  const total = ok?.totalMonth ?? 0;
  const returned = ok?.expected.hours ?? 0;
  const left = Math.max(total - returned, 0);
  const pct = ok ? ok.expected.pct : 0.8;
  const brl = ok?.expected.brlMonth ?? null;
  const people = Math.min(Math.max(Math.round(view.input.people) || 1, 1), 6);

  const spoken = ok
    ? `${view.routine}: ${formatHours(total)} horas por mês hoje. Automatizando ${Math.round(pct * 100)}%, devolve cerca de ${formatHours(returned)} horas por mês, ${formatDays(returned / 8)} dias de trabalho.`
    : "Confira os campos para ver o resultado.";
  const announced = useDebounced(spoken);

  return (
    <div className="routine-panel" data-example={view.isExample ? "true" : undefined}>
      <form className="routine-form" onSubmit={(e) => e.preventDefault()} noValidate>
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
      </form>

      <div className="routine-flow" aria-hidden="true" style={{ "--after": String(Math.max(1 - pct, 0.02)) } as CSSProperties}>
        <p className="flow-title">
          {view.isExample ? <span className="flow-tag">Exemplo</span> : null}
          {view.routine}
        </p>
        <div className="flow-row">
          <span className="flow-label">Hoje</span>
          <div className="flow-steps">
            {STEPS.map((s) => (
              <span key={s}>{s}</span>
            ))}
            <span className="flow-people">× {people}{Math.round(view.input.people) > 6 ? "+" : ""}</span>
          </div>
        </div>
        <div className="bar bar-before"><i /><b>{ok ? `${formatHours(total)} h/mês` : "—"}</b></div>
        <div className="flow-row">
          <span className="flow-label">Com a Procemiza</span>
          <div className="flow-steps flow-steps-after"><span>Pronto</span></div>
        </div>
        <div className="bar bar-after"><i /><b>{ok ? `${formatHours(left)} h/mês` : "—"}</b></div>
      </div>

      <div className="routine-result">
        {ok ? (
          <>
            <p className="routine-big">
              {formatHours(returned)} <span>h/mês devolvidas</span>
            </p>
            <p className="routine-sub">
              ≈ {formatDays(returned / 8)} dias de trabalho{brl !== null ? ` · ${formatBRL(brl)}/mês` : ""}
            </p>
          </>
        ) : (
          <p className="routine-sub">Revise os campos.</p>
        )}
      </div>
      <p className="sr-only" role="status" aria-atomic="true">
        {announced}
      </p>
    </div>
  );
}
