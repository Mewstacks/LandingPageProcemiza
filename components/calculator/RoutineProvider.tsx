"use client";

import "./calculator.css";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { hoursBucket, track } from "@/lib/analytics";
import type { StepKind } from "@/lib/calculator";
import {
  addStepOf,
  blankFields,
  deriveView,
  fromPreset,
  initialFields,
  isBlank,
  patchStep,
  removeStep as removeStepFrom,
  sanitize,
  type Preset,
  type RoutineFields,
  type RoutineView,
  type StepFields,
  type Stored,
} from "@/lib/routine";

const STORAGE_KEY = "procemiza:rotina:v2";

type State = { fields: RoutineFields; edited: boolean };

type Ctx = {
  fields: RoutineFields;
  view: RoutineView;
  /** Tudo vazio: o resultado mostra a saída para um exemplo. */
  blank: boolean;
  set: <K extends keyof RoutineFields>(key: K, value: RoutineFields[K]) => void;
  setStep: (id: string, patch: Partial<Omit<StepFields, "id">>) => void;
  addStep: (kind: StepKind) => void;
  removeStep: (id: string) => void;
  setCoverage: (kind: StepKind, value: string) => void;
  fill: (preset: Preset) => void;
  clear: () => void;
};

const RoutineContext = createContext<Ctx | null>(null);

export function useRoutine(): Ctx {
  const ctx = useContext(RoutineContext);
  if (!ctx) throw new Error("useRoutine fora do RoutineProvider");
  return ctx;
}

export function RoutineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => ({ fields: initialFields(), edited: false }));
  const [hydrated, setHydrated] = useState(false);

  // Lê só depois de montar: nada de storage na renderização do servidor.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const back = raw ? sanitize(JSON.parse(raw)) : null;
      if (back) setState(back);
    } catch {
      /* storage indisponível ou JSON quebrado: segue com o exemplo */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const stored: Stored = { v: 2, edited: state.edited, fields: state.fields };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* ignora */
    }
  }, [state, hydrated]);

  /** Toda mudança feita pela pessoa passa por aqui e tira o rótulo de exemplo. */
  const edit = useCallback((change: (f: RoutineFields) => RoutineFields) => {
    setState((s) => ({ fields: change(s.fields), edited: true }));
  }, []);

  const set = useCallback<Ctx["set"]>((key, value) => edit((f) => ({ ...f, [key]: value })), [edit]);
  const setStep = useCallback<Ctx["setStep"]>((id, patch) => edit((f) => patchStep(f, id, patch)), [edit]);
  const addStep = useCallback((kind: StepKind) => edit((f) => addStepOf(f, kind)), [edit]);
  const removeStep = useCallback((id: string) => edit((f) => removeStepFrom(f, id)), [edit]);
  const setCoverage = useCallback<Ctx["setCoverage"]>((kind, value) => edit((f) => ({ ...f, coverage: { ...f.coverage, [kind]: value } })), [edit]);
  const fill = useCallback((preset: Preset) => setState({ fields: fromPreset(preset), edited: false }), []);
  const clear = useCallback(() => setState({ fields: blankFields(), edited: true }), []);

  const view = useMemo(() => deriveView(state.fields, state.edited), [state]);

  // Uma vez por visita, só com dado digitado e só faixas (nunca o texto).
  const reported = useRef(false);
  useEffect(() => {
    const result = view.result;
    if (reported.current || view.isExample || result.status !== "ok") return;
    reported.current = true;
    track("calculator_used", { hours_bucket: hoursBucket(result.hoursReturned), has_cost: result.brlMonth !== null, steps: result.steps.length });
  }, [view]);

  const value = useMemo<Ctx>(
    () => ({ fields: state.fields, view, blank: isBlank(state.fields), set, setStep, addStep, removeStep, setCoverage, fill, clear }),
    [state.fields, view, set, setStep, addStep, removeStep, setCoverage, fill, clear],
  );

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}
