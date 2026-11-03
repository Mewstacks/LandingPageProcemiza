"use client";

import "./calculator.css";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { site } from "@/content/site";
import { sources } from "@/content/sources";
import { STEP_KINDS } from "@/lib/calculator";
import { HOURLY_STOPS, MINUTE_STOPS, PERIODS, RUN_STOPS, kindOf, periodOf, spokenMinutes, spokenSummary } from "@/lib/estimate";
import { formatHours, formatMinutes, formatPercentRange, formatRuns } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Choice } from "./Choice";
import { Live } from "./Live";
import { Slider } from "./Slider";
import { useEstimate } from "./useEstimate";

const KIND_OPTIONS = STEP_KINDS.map((k) => ({ value: k.id, label: k.short }));
const PERIOD_OPTIONS = PERIODS.map((p) => ({ value: p.id, label: p.label }));
const HOURLY_OPTIONS = [{ value: null as number | null, label: "Só horas" }, ...HOURLY_STOPS.map((h) => ({ value: h as number | null, label: `R$ ${h}/h` }))];

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

/** "7,5 a 10 h", ou só "8 h" quando as duas pontas arredondam igual. */
function hoursRange(low: number, high: number): string {
  const a = formatHours(low);
  const b = formatHours(high);
  return a === b ? `${a} h` : `${a} a ${b} h`;
}

/**
 * Uma conta só, em três controles: o que se faz, quanto leva e quantas vezes (mais o custo da hora,
 * se quiser). Nasce preenchida e o cartão de tinta mexe junto. A lógica vive em lib/estimate.ts e
 * lib/calculator.ts; aqui só desenho, foco e a conta aberta.
 */
export function Calculator({ titled = true }: { titled?: boolean }) {
  const uid = useId();
  const { estimate, result, moved, update } = useEstimate();
  const spoken = useDebounced(spokenSummary(estimate), 700);

  if (result.status !== "ok") return null;

  const Heading = titled ? "h3" : "h2";
  const { low, high } = result;
  const kind = kindOf(estimate.kind);
  const per = periodOf(estimate.period)?.per ?? "";
  const money = low.brlMonth !== null && high.brlMonth !== null ? { low: low.brlMonth, high: high.brlMonth } : null;

  const cta = buildWhatsAppUrl(site.contactUrl, {
    routine: `${kind?.label ?? "Rotina"}, ${formatMinutes(estimate.minutes)} por vez, ${estimate.runs} ${per}`,
    steps: 1,
    hours: { low: low.hoursReturned, high: high.hoursReturned },
    brlMonth: money,
    share: { low: low.share, high: high.share },
  });

  return (
    <div className="calc">
      <div className="calc-main">
      <Live result={result} spoken={moved ? spoken : ""} />

      <div className="calc-controls">
        <Choice name={`${uid}-tipo`} legend="Trabalho" options={KIND_OPTIONS} value={estimate.kind} onChange={(value) => update({ kind: value })} />
        <Slider
          id={`${uid}-minutos`}
          label="Duração"
          stops={MINUTE_STOPS}
          value={estimate.minutes}
          shown={formatMinutes(estimate.minutes)}
          spoken={spokenMinutes(estimate.minutes)}
          onChange={(minutes) => update({ minutes })}
        />
        <div className="field-group">
          <Slider
            id={`${uid}-vezes`}
            label="Frequência"
            stops={RUN_STOPS}
            value={estimate.runs}
            shown={`${estimate.runs} ${per}`}
            spoken={`${estimate.runs} ${estimate.runs === 1 ? "vez" : "vezes"} ${per}`}
            onChange={(runs) => update({ runs })}
          />
          <Choice name={`${uid}-periodo`} legend="Período" hideLegend options={PERIOD_OPTIONS} value={estimate.period} onChange={(period) => update({ period })} />
        </div>
        <Choice name={`${uid}-custo`} legend="Custo" options={HOURLY_OPTIONS} value={estimate.hourlyBRL} onChange={(hourlyBRL) => update({ hourlyBRL })} />
      </div>
      </div>

      <div className="account theme-dark">
        <Heading className="sr-only">A conta</Heading>
        <div className="bar" aria-hidden="true" style={{ "--high": high.share, "--low": low.share } as CSSProperties}>
          <span className="bar-high" />
          <span className="bar-low" />
        </div>
        <p className="bar-legend" aria-hidden="true">
          <span>
            Voltam <b>{hoursRange(low.hoursReturned, high.hoursReturned)}</b>
          </span>
          <span>Hoje {formatHours(result.hoursBefore)} h</span>
        </p>
        <p className="account-formula">
          {formatMinutes(estimate.minutes)} × {formatRuns(result.runsMonth)} por mês × {formatPercentRange(result.steps[0].floor, result.steps[0].ceiling)}
        </p>
        <a className="btn btn-primary calc-cta" href={cta} target="_blank" rel="noopener noreferrer">
          Falar no WhatsApp
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
        <p className="result-sources">
          Fontes:{" "}
          {sources.map((source, index) => (
            <span key={source.href}>
              {index > 0 ? ", " : ""}
              <a href={source.href} target="_blank" rel="noopener noreferrer">
                {source.label}
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            </span>
          ))}
          . Antes do custo de implantar.
        </p>
      </div>
    </div>
  );
}
