"use client";

import { useId, useRef, useState } from "react";
import type { Period } from "@/lib/calculator";
import { LIMIT, PRESETS, type CostMode } from "@/lib/routine";
import { Account } from "./Account";
import { Adjust } from "./Adjust";
import { Field, Segmented, errorText } from "./fields";
import { Live, Result } from "./Result";
import { useRoutine } from "./RoutineProvider";
import { Steps } from "./Steps";
import { useInView } from "./useSeen";

const PERIODS = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
] as const satisfies readonly { value: Period; label: string }[];

const COST_MODES = [
  { value: "salario", label: "R$/mês" },
  { value: "hora", label: "R$/hora" },
] as const satisfies readonly { value: CostMode; label: string }[];

/**
 * Uma conta só, montada a partir do processo da pessoa: modelo, frequência, passos e custo. O cartão
 * ao lado refaz o resultado a cada toque; embaixo fica a conta aberta, passo a passo.
 */
export function Calculator({ titled = true }: { titled?: boolean }) {
  const uid = useId();
  const { fields, view, blank, set, fill, clear } = useRoutine();
  const { errors } = view;
  // O passo em destaque (mouse sobre o gráfico ou a conta, ou foco num passo) acende os três lugares.
  const [active, setActive] = useState<number | null>(null);
  // No celular o número fixo no rodapé só aparece enquanto o cartão do resultado está fora da tela.
  const sideRef = useRef<HTMLDivElement>(null);
  const resultInView = useInView(sideRef);

  return (
    <div className="calc">
      <div className="calc-left">
        <form className="calc-form" onSubmit={(e) => e.preventDefault()} noValidate data-ui>
          <div className="field">
            <div className="field-head">
              <label htmlFor={`${uid}-processo`}>Processo</label>
              {blank ? null : (
                <button type="button" className="link-btn" onClick={clear}>
                  Limpar
                </button>
              )}
            </div>
            <input
              id={`${uid}-processo`}
              type="text"
              maxLength={LIMIT.name}
              autoComplete="off"
              placeholder="Conferir notas fiscais"
              value={fields.routine}
              onChange={(e) => set("routine", e.target.value)}
            />
          </div>

          <ul className="chips chips--scroll" aria-label="Modelos">
            {PRESETS.map((preset) => (
              <li key={preset.label}>
                <button type="button" className="chip" onClick={() => fill(preset)}>
                  {preset.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="calc-pair">
            <Field id={`${uid}-freq`} label="Quantas vezes" error={errorText(errors, "runs")}>
              {(a) => (
                <div className="field-seg">
                  <input
                    {...a}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="40"
                    value={fields.runs}
                    onChange={(e) => set("runs", e.target.value)}
                  />
                  <Segmented name={`${uid}-periodo`} label="Período" value={fields.period} options={PERIODS} onChange={(value) => set("period", value)} />
                </div>
              )}
            </Field>

            <Field id={`${uid}-custo`} label="Custo da pessoa (opcional)" error={errorText(errors, "cost")}>
              {(a) => (
                <div className="field-seg">
                  <input
                    {...a}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={fields.costMode === "salario" ? "3.500" : "27"}
                    value={fields.cost}
                    onChange={(e) => set("cost", e.target.value)}
                  />
                  <Segmented name={`${uid}-custo-un`} label="Unidade do custo" value={fields.costMode} options={COST_MODES} onChange={(value) => set("costMode", value)} />
                </div>
              )}
            </Field>
          </div>

          <Steps uid={uid} active={active} onActive={setActive} />

          <Adjust uid={uid} />
        </form>
      </div>

      <div ref={sideRef} className="calc-side">
        <Result active={active} onActive={setActive} />
      </div>
      <Account uid={uid} active={active} onActive={setActive} heading={titled ? "h3" : "h2"} />
      <Live hidden={resultInView} />
    </div>
  );
}
