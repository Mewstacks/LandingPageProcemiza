"use client";

import { useRef, type CSSProperties } from "react";
import { useSeen } from "./useSeen";

/**
 * O tempo de hoje é o anel inteiro; o disco laranja é a parte que volta. A área do disco é a parte
 * (raio = raiz da parte), então 80% ocupa 80% do anel, não 80% do diâmetro. Só `transform` anima.
 * Gráfico de dado: o número exato já está escrito ao lado, por isso é `aria-hidden`.
 */
export function Orb({ share }: { share: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const armed = useSeen(ref);
  const scale = Math.sqrt(Math.min(Math.max(share, 0), 1));
  return <span ref={ref} className="orb" data-armed={armed} style={{ "--s": scale } as CSSProperties} aria-hidden="true" />;
}
