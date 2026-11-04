"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_DRAFT, sanitize, toPlan, type Draft, type Stored } from "@/lib/draft";
import { evaluate, type Invalid, type Outcome, type Plan } from "@/lib/plan";

const STORAGE_KEY = "procemiza:rotina:v5";

/**
 * O rascunho da calculadora, guardado no `sessionStorage` (a home e /calculadora compartilham). Lê o
 * storage depois de montar, nunca na renderização do servidor. `moved` vira `true` na primeira ação.
 */
export function useDraft() {
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const back = raw ? sanitize(JSON.parse(raw)) : null;
      if (back) setDraft(back);
    } catch {
      /* storage indisponível ou JSON quebrado: segue do padrão */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const stored: Stored = { v: 5, draft };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* ignora */
    }
  }, [draft, hydrated]);

  const update = useCallback((patch: Partial<Draft>) => {
    setMoved(true);
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const plan: Plan = useMemo(() => toPlan(draft), [draft]);
  const outcome: Outcome | Invalid = useMemo(() => evaluate(plan), [plan]);

  return { draft, plan, outcome, moved, update };
}
