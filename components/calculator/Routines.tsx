"use client";

import { useId, useState } from "react";
import { MINUTE_STOPS, PERIODS, RUN_STOPS, DEFAULT_ROUTINE, spokenMinutes } from "@/lib/draft";
import { KINDS, evidenceOf } from "@/lib/evidence";
import { formatMinutes } from "@/lib/format";
import { LIMITS, type Routine } from "@/lib/plan";
import { Choice } from "./Choice";
import { Slider } from "./Slider";

const KIND_OPTIONS = KINDS.map((k) => ({ value: k.id, label: k.short }));
const PERIOD_OPTIONS = PERIODS.map((p) => ({ value: p.id, label: p.label }));

const per = (id: Routine["period"]) => PERIODS.find((p) => p.id === id)?.per ?? "";
const summary = (r: Routine) => `${evidenceOf(r.kind)?.short ?? ""} · ${formatMinutes(r.minutes)} · ${r.runs} ${per(r.period)}`;

type Props = { routines: Routine[]; onChange: (routines: Routine[]) => void };

/**
 * Até 5 rotinas. A que está aberta mostra os três controles; as outras viram uma linha (toque abre).
 * A primeira já vem preenchida, então quem tem uma rotina só nem toca em "Outra rotina".
 */
export function Routines({ routines, onChange }: Props) {
  const uid = useId();
  const [open, setOpen] = useState(0);
  const active = Math.min(open, routines.length - 1);

  const patch = (index: number, p: Partial<Routine>) => onChange(routines.map((r, i) => (i === index ? { ...r, ...p } : r)));

  return (
    <div className="routines">
      {routines.map((r, index) => {
        const per_ = per(r.period);
        return index === active ? (
          <div key={index} className="routine routine--open" role="group" aria-label={`Rotina ${index + 1}`}>
            <Choice name={`${uid}-tipo-${index}`} legend="Trabalho" options={KIND_OPTIONS} value={r.kind} onChange={(kind) => patch(index, { kind })} />
            <Slider
              id={`${uid}-min-${index}`}
              label="Duração"
              stops={MINUTE_STOPS}
              value={r.minutes}
              shown={formatMinutes(r.minutes)}
              spoken={spokenMinutes(r.minutes)}
              onChange={(minutes) => patch(index, { minutes })}
            />
            <div className="field-group">
              <Slider
                id={`${uid}-vezes-${index}`}
                label="Frequência"
                stops={RUN_STOPS}
                value={r.runs}
                shown={`${r.runs} ${per_}`}
                spoken={`${r.runs} ${r.runs === 1 ? "vez" : "vezes"} ${per_}`}
                onChange={(runs) => patch(index, { runs })}
              />
              <Choice name={`${uid}-periodo-${index}`} legend="Período" hideLegend options={PERIOD_OPTIONS} value={r.period} onChange={(period) => patch(index, { period })} />
            </div>
            {routines.length > 1 ? (
              <button type="button" className="text-btn" onClick={() => { onChange(routines.filter((_, i) => i !== index)); setOpen(0); }}>
                Remover rotina {index + 1}
              </button>
            ) : null}
          </div>
        ) : (
          <button key={index} type="button" className="routine routine--row" onClick={() => setOpen(index)}>
            <span className="routine-n">{index + 1}</span>
            <span className="routine-text">{summary(r)}</span>
            <span className="routine-edit">Editar</span>
          </button>
        );
      })}
      {routines.length < LIMITS.MAX_ROUTINES ? (
        <button
          type="button"
          className="btn btn-ghost routine-add"
          onClick={() => {
            onChange([...routines, { ...DEFAULT_ROUTINE }]);
            setOpen(routines.length);
          }}
        >
          Outra rotina
        </button>
      ) : null}
    </div>
  );
}
