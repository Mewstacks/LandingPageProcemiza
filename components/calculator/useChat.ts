"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hoursBucket, track } from "@/lib/analytics";
import { apply, initialAnswers, resultOf, sanitize, type Action, type Answers, type Stored } from "@/lib/chat";

const STORAGE_KEY = "procemiza:rotina:v3";

/**
 * O estado da conversa: só as respostas, guardadas no `sessionStorage` (home e /calculadora
 * compartilham). Lê o storage depois de montar, nunca na renderização do servidor. `error` é a
 * última recusa e some na próxima resposta aceita. `moved` fica `true` depois da primeira ação da
 * pessoa: antes disso nada anima, nada ganha foco e a página não rola sozinha.
 */
export function useChat() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const back = raw ? sanitize(JSON.parse(raw)) : null;
      if (back) setAnswers(back);
    } catch {
      /* storage indisponível ou JSON quebrado: segue do começo */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const stored: Stored = { v: 3, answers };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* ignora */
    }
  }, [answers, hydrated]);

  // A cópia síncrona evita perder uma resposta quando dois toques chegam antes da próxima renderização.
  const latest = useRef(answers);
  latest.current = answers;

  const dispatch = useCallback((action: Action) => {
    const r = apply(latest.current, action);
    latest.current = r.answers;
    setMoved(true);
    setAnswers(r.answers);
    setError(r.error);
  }, []);

  const result = useMemo(() => resultOf(answers), [answers]);

  // Uma vez por visita, só com a conta completa e só faixas (nunca o texto digitado).
  const reported = useRef(false);
  useEffect(() => {
    if (reported.current || !moved || result?.status !== "ok") return;
    reported.current = true;
    track("calculator_used", { hours_bucket: hoursBucket(result.low.hoursReturned), has_cost: result.low.brlMonth !== null, steps: result.steps.length });
  }, [moved, result]);

  return { answers, error, result, moved, dispatch };
}
