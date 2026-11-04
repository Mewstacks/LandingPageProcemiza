"use client";

import "./calculator.css";

import { useEffect, useId, useState } from "react";
import { site } from "@/content/site";
import { hoursBucket, track } from "@/lib/analytics";
import { BENEFIT_STOPS } from "@/lib/draft";
import { COST } from "@/lib/cost";
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

  const Heading = titled ? "h3" : "h2";

  return (
    <div className="calc">
      <Result
        outcome={outcome}
        revealed={revealed}
        sentTo={sentTo}
        spoken={spoken}
        whatsappUrl={site.contactUrl}
        onReveal={() => setDialog(true)}
        onReport={() => setDialog(true)}
      />

      <div className="calc-controls">
        <Heading className="sr-only">Dados da conta</Heading>
        <Routines routines={draft.routines} onChange={(routines) => change({ routines })} />
        <div className="who">
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
