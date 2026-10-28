"use client";

import { useEffect, useState } from "react";
import type { TimeUnit } from "@/lib/calculator";
import type { FieldError } from "./RoutineProvider";

export const UNIT_LABEL: Record<TimeUnit, string> = {
  min_dia: "min/dia",
  h_semana: "h/semana",
  h_mes: "h/mês",
};

const REASON_TEXT: Record<string, string> = {
  nan: "Número inválido",
  negative: "Sem valor negativo",
  zero: "Maior que zero",
  order: "Confira os percentuais",
};

const TOO_LARGE: Record<string, string> = {
  amount: "Máximo 220 h/mês por pessoa",
  people: "Máximo 1.000 pessoas",
  cost: "Máximo R$ 10.000 por hora",
  pct: "Máximo 95%",
};

export function errorText(errors: FieldError[], field: FieldError["field"]): string | null {
  const e = errors.find((x) => x.field === field);
  if (!e) return null;
  return e.reason === "too_large" ? (TOO_LARGE[field] ?? "Valor alto demais") : (REASON_TEXT[e.reason] ?? "Valor inválido");
}

/** Valor que só muda depois de `ms` parado: alimenta a região `role="status"`. */
export function useDebounced<T>(value: T, ms = 600): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type FieldProps = {
  id: string;
  label: string;
  error?: string | null;
  children: (a11y: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
  className?: string;
};

export function Field({ id, label, error, children, className }: FieldProps) {
  const errId = `${id}-erro`;
  return (
    <div className={`field${className ? ` ${className}` : ""}`} data-invalid={error ? "true" : undefined}>
      <label htmlFor={id}>{label}</label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error ? errId : undefined })}
      {error ? (
        <p id={errId} className="field-error">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 15 14H1L8 1.5Zm0 4.5v3.5m0 2v.5" /></svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function UnitSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: TimeUnit;
  onChange: (u: TimeUnit) => void;
}) {
  return (
    <select id={id} aria-label="Unidade de tempo" value={value} onChange={(e) => onChange(e.target.value as TimeUnit)}>
      {(Object.keys(UNIT_LABEL) as TimeUnit[]).map((u) => (
        <option key={u} value={u}>
          {UNIT_LABEL[u]}
        </option>
      ))}
    </select>
  );
}
