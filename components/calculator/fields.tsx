"use client";

import { useEffect, useState } from "react";
import type { StepKind } from "@/lib/calculator";
import type { FieldError } from "@/lib/routine";

const REASON_TEXT: Record<string, string> = {
  nan: "Número inválido",
  negative: "Sem valor negativo",
  zero: "Maior que zero",
};

const TOO_LARGE: Record<string, string> = {
  runs: "Máximo 100.000 por mês",
  minutes: "Máximo 600 min",
  coverage: "Entre 0 e 100%",
  cost: "Máximo R$ 10.000 por hora",
  exceptions: "Máximo 50%",
  reworkPercent: "Máximo 100%",
  reworkMinutes: "Máximo 600 min",
};

/** Mensagem do erro desse campo. `step` e `kind` separam campos repetidos (passos, tipos). */
export function errorText(
  errors: readonly FieldError[],
  field: FieldError["field"],
  where: { step?: number; kind?: StepKind } = {},
): string | null {
  const e = errors.find(
    (x) => x.field === field && (where.step === undefined || x.step === where.step) && (where.kind === undefined || x.kind === where.kind),
  );
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
  /** Nome acessível mais específico (contém o rótulo visível), para campos que se repetem. */
  ariaLabel?: string;
  error?: string | null;
  children: (a11y: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; "aria-label"?: string }) => React.ReactNode;
  className?: string;
};

export function Field({ id, label, ariaLabel, error, children, className }: FieldProps) {
  const errId = `${id}-erro`;
  return (
    <div className={`field${className ? ` ${className}` : ""}`} data-invalid={error ? "true" : undefined}>
      <label htmlFor={id}>{label}</label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error ? errId : undefined, "aria-label": ariaLabel })}
      {error ? (
        <p id={errId} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
