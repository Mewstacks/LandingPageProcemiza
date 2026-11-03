"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hoursBucket, track } from "@/lib/analytics";
import { DEFAULT_ESTIMATE, resultOf, sanitize, type Estimate, type Stored } from "@/lib/estimate";

const STORAGE_KEY = "procemiza:rotina:v4";
/** Quanto a pessoa precisa ficar parada para a visita contar como uso. */
const IDLE_MS = 1200;

/**
 * O estado da calculadora: três controles e um custo opcional, guardados no `sessionStorage` (a home
 * e /calculadora compartilham). Lê o storage depois de montar, nunca na renderização do servidor.
 * `moved` fica `true` na primeira ação da pessoa.
 */
export function useEstimate() {
  const [estimate, setEstimate] = useState<Estimate>(DEFAULT_ESTIMATE);
  const [hydrated, setHydrated] = useState(false);
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const back = raw ? sanitize(JSON.parse(raw)) : null;
      if (back) setEstimate(back);
    } catch {
      /* storage indisponível ou JSON quebrado: segue do padrão */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const stored: Stored = { v: 4, estimate };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* ignora */
    }
  }, [estimate, hydrated]);

  const update = useCallback((patch: Partial<Estimate>) => {
    setMoved(true);
    setEstimate((current) => ({ ...current, ...patch }));
  }, []);

  const result = useMemo(() => resultOf(estimate), [estimate]);

  // Uma vez por visita, depois que a pessoa para de mexer, e só a faixa (nunca os valores escolhidos).
  const reported = useRef(false);
  useEffect(() => {
    if (!moved || reported.current || result.status !== "ok") return;
    const timer = window.setTimeout(() => {
      reported.current = true;
      track("calculator_used", { hours_bucket: hoursBucket(result.low.hoursReturned), has_cost: result.low.brlMonth !== null, steps: 1 });
    }, IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [moved, result]);

  return { estimate, result, moved, update };
}
