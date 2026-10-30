import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Preferência do sistema por menos movimento. Com ela a câmera da cena não balança nem segue o
 * ponteiro e as entradas só mudam de opacidade; a solicitação percorrendo as camadas e a cena que
 * acompanha a rolagem (ação do próprio visitante) continuam.
 * Servidor e primeira pintura assumem "falso"; o cliente corrige ao hidratar, sem aviso de divergência.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
