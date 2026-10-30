"use client";

import type { ReactNode } from "react";
import { K, STEP_KINDS } from "@/lib/calculator";
import type { Regime } from "@/lib/routine";
import { Field, errorText } from "./fields";
import { useRoutine } from "./RoutineProvider";

function Suffix({ unit, children }: { unit: string; children: ReactNode }) {
  return (
    <div className="input-unit">
      {children}
      <span className="unit" aria-hidden="true">
        {unit}
      </span>
    </div>
  );
}

/** As premissas da conta, todas com o valor padrão à vista (placeholder) e todas editáveis. */
export function Adjust({ uid }: { uid: string }) {
  const { fields, view, set, setCoverage } = useRoutine();
  const { errors } = view;

  const changed =
    STEP_KINDS.filter((kind) => (fields.coverage[kind.id] ?? "").trim() !== "").length +
    (fields.exceptions.trim() !== "" ? 1 : 0) +
    (fields.reworkPercent.trim() !== "" || fields.reworkMinutes.trim() !== "" ? 1 : 0) +
    (fields.costMode === "salario" && fields.regime !== "clt" ? 1 : 0);

  return (
    <details className="adjust">
      <summary>Ajustes{changed > 0 ? ` (${changed})` : ""}</summary>
      <div className="adjust-body">
        <fieldset className="adjust-group">
          <legend>Automatizável</legend>
          <div className="adjust-grid">
            {STEP_KINDS.map((kind) => (
              <Field key={kind.id} id={`${uid}-cob-${kind.id}`} label={kind.label} error={errorText(errors, "coverage", { kind: kind.id })}>
                {(a) => (
                  <Suffix unit="%">
                    <input
                      {...a}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={String(Math.round(kind.coverage * 100))}
                      value={fields.coverage[kind.id] ?? ""}
                      onChange={(e) => setCoverage(kind.id, e.target.value)}
                    />
                  </Suffix>
                )}
              </Field>
            ))}
          </div>
        </fieldset>

        <div className="adjust-grid">
          <Field id={`${uid}-exc`} label="Exceções" error={errorText(errors, "exceptions")}>
            {(a) => (
              <Suffix unit="%">
                <input
                  {...a}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={String(K.DEFAULT_EXCEPTIONS * 100)}
                  value={fields.exceptions}
                  onChange={(e) => set("exceptions", e.target.value)}
                />
              </Suffix>
            )}
          </Field>
          {fields.costMode === "salario" ? (
            <Field id={`${uid}-enc`} label="Encargos">
              {(a) => (
                <select {...a} value={fields.regime} onChange={(e) => set("regime", e.target.value as Regime)}>
                  <option value="clt">CLT, +{Math.round(K.ENCARGOS.clt * 100)}%</option>
                  <option value="simples">Simples, +{Math.round(K.ENCARGOS.simples * 100)}%</option>
                </select>
              )}
            </Field>
          ) : null}
        </div>

        <fieldset className="adjust-group">
          <legend>Retrabalho</legend>
          <div className="adjust-grid">
            <Field id={`${uid}-ref-p`} label="Refeitas" error={errorText(errors, "reworkPercent")}>
              {(a) => (
                <Suffix unit="%">
                  <input
                    {...a}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    value={fields.reworkPercent}
                    onChange={(e) => set("reworkPercent", e.target.value)}
                  />
                </Suffix>
              )}
            </Field>
            <Field id={`${uid}-ref-m`} label="Refazer" error={errorText(errors, "reworkMinutes")}>
              {(a) => (
                <Suffix unit="min">
                  <input
                    {...a}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    value={fields.reworkMinutes}
                    onChange={(e) => set("reworkMinutes", e.target.value)}
                  />
                </Suffix>
              )}
            </Field>
          </div>
        </fieldset>
      </div>
    </details>
  );
}
