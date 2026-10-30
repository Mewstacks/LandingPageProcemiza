"use client";

import "./calculator.css";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  calculate,
  hourlyFromSalary,
  K,
  type CalcField,
  type CalcInput,
  type CalcReason,
  type CalcResult,
  type TimeUnit,
} from "@/lib/calculator";
import { parseDecimalPtBR } from "@/lib/format";
import { hoursBucket, track } from "@/lib/analytics";

export type Regime = "clt" | "simples";
export type CostMode = "salario" | "hora";

export type RoutineFields = {
  routine: string;
  amount: string;
  unit: TimeUnit;
  people: string;
  costMode: CostMode;
  cost: string;
  regime: Regime;
  /** Redução esperada, em %. */
  pct: string;
};

export const EXAMPLE: { routine: string; amount: number; unit: TimeUnit; people: number } = {
  routine: "Conferir notas fiscais",
  amount: 10,
  unit: "h_semana",
  people: 2,
};

/** Atalhos: só preenchem os campos. Valores são exemplos, a pessoa ajusta. */
export const PRESETS: readonly { label: string; fields: Pick<RoutineFields, "routine" | "amount" | "unit" | "people"> }[] = [
  { label: "Notas fiscais", fields: { routine: "Conferir notas fiscais", amount: "10", unit: "h_semana", people: "2" } },
  { label: "WhatsApp", fields: { routine: "Responder pedidos no WhatsApp", amount: "90", unit: "min_dia", people: "2" } },
  { label: "Entre sistemas", fields: { routine: "Digitar dados entre sistemas", amount: "6", unit: "h_semana", people: "3" } },
  { label: "Relatório", fields: { routine: "Montar relatório mensal", amount: "16", unit: "h_mes", people: "1" } },
];

const DEFAULTS: RoutineFields = {
  routine: "",
  amount: "",
  unit: "h_semana",
  people: "",
  costMode: "salario",
  cost: "",
  regime: "clt",
  pct: String(K.EXPECTED * 100),
};

const STORAGE_KEY = "procemiza:rotina:v1";
const MAX_PCT = 95;

export type FieldError = { field: CalcField | "cost" | "pct"; reason: CalcReason };

export type RoutineView = {
  /** true = nada digitado ainda; números vêm do exemplo. */
  isExample: boolean;
  routine: string;
  input: CalcInput;
  result: CalcResult;
  hourly: number | null;
  errors: FieldError[];
};

type Ctx = {
  fields: RoutineFields;
  view: RoutineView;
  set: <K2 extends keyof RoutineFields>(key: K2, value: RoutineFields[K2]) => void;
  fill: (patch: Partial<RoutineFields>) => void;
  reset: () => void;
};

const RoutineContext = createContext<Ctx | null>(null);

export function useRoutine(): Ctx {
  const ctx = useContext(RoutineContext);
  if (!ctx) throw new Error("useRoutine fora do RoutineProvider");
  return ctx;
}

/** "" → null; ilegível → NaN (vira erro `nan`); senão o número. */
function num(text: string): number | null {
  if (text.trim() === "") return null;
  return parseDecimalPtBR(text) ?? Number.NaN;
}

export function deriveView(f: RoutineFields): RoutineView {
  const typed = f.amount.trim() !== "";
  const errors: FieldError[] = [];

  const peopleRaw = f.people.trim() === "" ? 1 : (parseDecimalPtBR(f.people) ?? Number.NaN);

  const costRaw = num(f.cost);
  let hourly: number | null = null;
  if (costRaw !== null) {
    if (Number.isNaN(costRaw)) {
      hourly = Number.NaN;
    } else if (f.costMode === "salario") {
      hourly = hourlyFromSalary(costRaw, K.ENCARGOS[f.regime]);
      if (hourly === null) hourly = Number.NaN;
    } else {
      hourly = costRaw;
    }
  }

  const pctRaw = f.pct.trim() === "" ? K.EXPECTED * 100 : (parseDecimalPtBR(f.pct) ?? Number.NaN);
  let expected = pctRaw / 100;
  if (Number.isFinite(expected) && expected > MAX_PCT / 100) {
    errors.push({ field: "pct", reason: "too_large" });
    expected = MAX_PCT / 100;
  }
  const optimistic = Math.min(MAX_PCT / 100, expected + 0.1);

  const input: CalcInput = typed
    ? {
        routine: f.routine,
        amount: num(f.amount),
        unit: f.unit,
        people: peopleRaw,
        hourlyBRL: hourly,
        expected,
        optimistic,
      }
    : {
        routine: EXAMPLE.routine,
        amount: EXAMPLE.amount,
        unit: EXAMPLE.unit,
        people: EXAMPLE.people,
        hourlyBRL: null,
        expected: K.EXPECTED,
        optimistic: K.OPTIMISTIC,
      };

  const result = calculate(input);
  if (result.status === "invalid" && typed) errors.push({ field: result.field, reason: result.reason });
  // Custo ilegível: calculate() valida hourlyBRL, mas "cost" é o campo que a pessoa vê.
  const fieldErrors = errors.map((e) => (e.field === "hourlyBRL" ? { ...e, field: "cost" as const } : e));

  return {
    isExample: !typed,
    routine: typed && f.routine.trim() ? f.routine.trim() : EXAMPLE.routine,
    input,
    result,
    hourly: typed ? hourly : null,
    errors: fieldErrors,
  };
}

export function RoutineProvider({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState<RoutineFields>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  // Lê só depois de montar: nada de storage na renderização do servidor.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setFields({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<RoutineFields>) });
    } catch {
      /* storage indisponível: segue com o padrão */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
    } catch {
      /* ignora */
    }
  }, [fields, hydrated]);

  const set = useCallback<Ctx["set"]>((key, value) => setFields((f) => ({ ...f, [key]: value })), []);
  const fill = useCallback((patch: Partial<RoutineFields>) => setFields((f) => ({ ...f, ...patch })), []);
  const reset = useCallback(() => setFields(DEFAULTS), []);

  const view = useMemo(() => deriveView(fields), [fields]);

  // Uma vez por visita, só com dado digitado e só faixa de horas (nunca o texto).
  const reported = useRef(false);
  useEffect(() => {
    if (reported.current || view.isExample || view.result.status !== "ok") return;
    reported.current = true;
    track("calculator_used", { hours_bucket: hoursBucket(view.result.expected.hours), has_cost: view.result.expected.brlMonth !== null });
  }, [view]);
  const value = useMemo(() => ({ fields, view, set, fill, reset }), [fields, view, set, fill, reset]);

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}
