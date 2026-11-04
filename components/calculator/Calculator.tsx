"use client";

import "./calculator.css";

import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/content/site";
import { hoursBucket, track } from "@/lib/analytics";
import { BENEFIT_STOPS } from "@/lib/draft";
import { COST } from "@/lib/cost";
import { evidenceOf } from "@/lib/evidence";
import { formatMinutes } from "@/lib/format";
import { formatBRL } from "@/lib/format";
import { Choice } from "./Choice";
import { Money } from "./Money";
import { Result } from "./Result";
import { ResultDialog } from "./ResultDialog";
import { Routines } from "./Routines";
import { useDraft } from "./useDraft";

const MODE_OPTIONS = [
  { value: "bruto" as const, label: "Bruto" },
  { value: "custo" as const, label: "Custo total" },
];
const REGIME_OPTIONS = [
  { value: "simples" as const, label: "Simples" },
  { value: "presumido" as const, label: "Presumido ou real" },
];
const STEPS = ["Rotina", "Quem faz", "Resultado"] as const;
const BENEFIT_OPTIONS = BENEFIT_STOPS.map((b) => ({ value: b as number, label: b === 0 ? "Sem" : formatBRL(b) }));

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

/**
 * Rotinas e quem as faz; o resultado só aparece depois do clique em "Ver resultado", e ali a pessoa
 * escolhe: relatório completo por e-mail ou só o número. A conta vive em lib/plan.ts; o servidor
 * recalcula tudo antes de enviar o relatório. Aqui só desenho, foco e estado.
 */
export function Calculator({ titled = true }: { titled?: boolean }) {
  const uid = useId();
  const { draft, plan, outcome, update } = useDraft();
  const [revealed, setRevealed] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (step > 0 || revealed) title.current?.focus({ preventScroll: true });
  }, [step, revealed]);

  const change: typeof update = (patch) => {
    setSentTo(null);
    update(patch);
  };

  const spokenNow =
    revealed && outcome.status === "ok" ? `Devolve até ${formatBRL(outcome.ceiling.brlYear)} por ano. Prudente: ${formatBRL(outcome.prudent.brlYear)}.` : "";
  const spoken = useDebounced(spokenNow, 700);

  const reveal = () => {
    if (outcome.status !== "ok") return;
    setDialog(false);
    setRevealed(true);
    track("number_revealed", { hours_bucket: hoursBucket(outcome.prudent.hours), routines: plan.routines.length });
  };

  const PER = { dia: "por dia", semana: "por semana", mes: "por mês" } as const;
  const recap = [
    ...draft.routines.map((r) => `${evidenceOf(r.kind)?.label ?? ""} · ${formatMinutes(r.minutes)} · ${r.runs} ${PER[r.period]}`),
    draft.mode === "bruto"
      ? `${formatBRL(draft.salary)} bruto · ${draft.regime === "simples" ? "Simples" : "Presumido ou real"}${draft.benefits > 0 ? ` · ${formatBRL(draft.benefits)} de benefícios` : ""}`
      : `${formatBRL(draft.monthly)} de custo total`,
  ];
  const Heading = titled ? "h3" : "h2";

  return (
    <div className="calc">
      <ol className="stepper" aria-label="Etapas">
        {STEPS.map((label, i) => (
          <li key={label} className="stepper-item" data-state={i < step ? "done" : i === step ? "now" : "todo"} aria-current={i === step ? "step" : undefined}>
            <span className="stepper-bar" />
            <span className="stepper-label">{i + 1} {label}</span>
          </li>
        ))}
      </ol>

      <Heading ref={title} tabIndex={-1} className="sr-only">{STEPS[step]}</Heading>

      {step === 0 ? (
        <div className="step">
          <Routines routines={draft.routines} onChange={(routines) => change({ routines })} />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="step who">
          <Choice name={`${uid}-modo`} legend="Valor" options={MODE_OPTIONS} value={draft.mode} onChange={(mode) => change({ mode })} />
          {draft.mode === "bruto" ? (
            <Money label="Salário por mês" value={draft.salary} max={COST.MAX_SALARY} onChange={(salary) => change({ salary })} />
          ) : (
            <Money label="Custo por mês" value={draft.monthly} max={COST.MAX_MONTHLY_COST} onChange={(monthly) => change({ monthly })} />
          )}
          {draft.mode === "bruto" ? (
            <>
              <Choice name={`${uid}-regime`} legend="Regime" options={REGIME_OPTIONS} value={draft.regime} onChange={(regime) => change({ regime })} />
              <Choice name={`${uid}-benef`} legend="Benefícios" options={BENEFIT_OPTIONS} value={draft.benefits} onChange={(benefits) => change({ benefits })} />
            </>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <Result
          outcome={outcome}
          revealed={revealed}
          sentTo={sentTo}
          spoken={spoken}
          recap={recap}
          whatsappUrl={site.contactUrl}
          onReveal={() => setDialog(true)}
          onReport={() => setDialog(true)}
        />
      ) : null}

      <div className="calc-nav">
        {step > 0 ? (
          <button type="button" className="text-btn" onClick={() => setStep(step - 1)}>Voltar</button>
        ) : <span />}
        {step < 2 ? (
          <button type="button" className="btn btn-primary" disabled={step === 1 && outcome.status !== "ok"} onClick={() => setStep(step + 1)}>
            Continuar
          </button>
        ) : null}
      </div>

      <ResultDialog
        open={dialog}
        plan={plan}
        onClose={() => setDialog(false)}
        onNumber={reveal}
        onSent={(email) => {
          reveal();
          setSentTo(email);
        }}
      />
    </div>
  );
}
