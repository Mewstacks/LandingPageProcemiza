"use client";

import { K, STEP_KINDS, type StepKind } from "@/lib/calculator";
import { LIMIT, nextStepId } from "@/lib/routine";
import { errorText } from "./fields";
import { useRoutine } from "./RoutineProvider";

type Props = { uid: string; active: number | null; onActive: (index: number | null) => void };

/** Move o foco depois que o React pintou o campo novo; `select` já deixa o número pronto para trocar. */
function focusSoon(id: string, select = false) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    el?.focus();
    if (select && el instanceof HTMLInputElement) el.select();
  });
}

/**
 * A lista que faz a conta valer para qualquer processo: cada passo com o seu tempo e o seu tipo.
 * Descrever é tocar: um botão por tipo de trabalho põe o passo já com o tempo de partida do tipo, e
 * a pessoa só acerta o número. Uma linha por passo (nome, minutos, tipo). Cada controle tem nome
 * acessível com o número do passo; o "min" ao lado do número e o texto do tipo dizem o que cada
 * campo é, e os títulos das colunas aparecem quando a coluna é larga.
 */
export function Steps({ uid, active, onActive }: Props) {
  const { fields, view, setStep, addStep, removeStep } = useRoutine();
  const full = fields.steps.length >= K.MAX_STEPS;
  const only = fields.steps.length === 1;

  return (
    <fieldset className="steps">
      <legend>Passos</legend>
      <div className="step-cols" aria-hidden="true">
        <span>Passo</span>
        <span>Minutos</span>
        <span>Tipo</span>
        <span />
      </div>
      <ol className="step-list">
        {fields.steps.map((s, index) => {
          const slot = view.slots[index];
          const n = index + 1;
          const nameId = `${uid}-nome-${s.id}`;
          const minError = errorText(view.errors, "minutes", { step: index });
          const errorId = `${uid}-min-${s.id}-erro`;
          return (
            <li
              key={s.id}
              className="step"
              data-active={slot !== null && slot === active ? "true" : undefined}
              data-invalid={minError ? "true" : undefined}
              onFocus={() => onActive(slot)}
              onBlur={() => onActive(null)}
            >
              <input
                id={nameId}
                className="step-name"
                type="text"
                aria-label={`Passo ${n}`}
                maxLength={LIMIT.name}
                autoComplete="off"
                placeholder={index === 0 ? "Baixar o XML" : "Conferir valores"}
                value={s.name}
                onChange={(e) => setStep(s.id, { name: e.target.value })}
              />
              <div className="input-unit step-min">
                <input
                  id={`${uid}-min-${s.id}`}
                  type="text"
                  inputMode="decimal"
                  aria-label={`Minutos do passo ${n}`}
                  aria-invalid={Boolean(minError)}
                  aria-describedby={minError ? errorId : undefined}
                  autoComplete="off"
                  placeholder="2"
                  value={s.minutes}
                  onChange={(e) => setStep(s.id, { minutes: e.target.value })}
                />
                <span className="unit" aria-hidden="true">
                  min
                </span>
              </div>
              <select
                className="step-kind"
                aria-label={`Tipo do passo ${n}`}
                value={s.kind}
                onChange={(e) => setStep(s.id, { kind: e.target.value as StepKind })}
              >
                {STEP_KINDS.map((kind) => (
                  <option key={kind.id} value={kind.id}>
                    {kind.label}
                  </option>
                ))}
              </select>
              {only ? (
                <span />
              ) : (
                <button
                  type="button"
                  className="link-btn"
                  aria-label={`Remover passo ${n}`}
                  onClick={() => {
                    const neighbor = fields.steps[index - 1] ?? fields.steps[index + 1];
                    removeStep(s.id);
                    if (neighbor) focusSoon(`${uid}-nome-${neighbor.id}`);
                  }}
                >
                  Remover
                </button>
              )}
              {minError ? (
                <p id={errorId} className="field-error step-error">
                  {minError}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="step-add" role="group" aria-labelledby={`${uid}-novo`}>
        <span id={`${uid}-novo`} className="step-add-label">
          Novo passo
        </span>
        <ul className="chips">
          {STEP_KINDS.map((kind) => (
            <li key={kind.id}>
              <button
                type="button"
                className="chip"
                disabled={full}
                aria-label={`Adicionar passo: ${kind.label}`}
                onClick={() => {
                  const id = nextStepId(fields.steps);
                  addStep(kind.id);
                  focusSoon(`${uid}-min-${id}`, true);
                }}
              >
                {kind.short}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </fieldset>
  );
}
