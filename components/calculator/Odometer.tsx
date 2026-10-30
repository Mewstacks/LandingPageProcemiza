"use client";

import { useRef, type CSSProperties } from "react";
import { useSeen } from "./useSeen";

/**
 * Número com dígitos que rolam. Só desenho: `aria-hidden`, quem lê o valor é o texto ao lado.
 * Cada dígito é uma coluna de 0 a 9 (a pilha vive em `content` no CSS, então não entra no HTML nem
 * no texto que robôs leem) deslocada com `transform`. Na primeira vez que entra na tela, sai do zero.
 */
export function Odometer({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const armed = useSeen(ref);

  const chars = Array.from(text);
  return (
    <span ref={ref} className="odo" data-armed={armed} aria-hidden="true">
      {chars.map((ch, index) => {
        // chave pela posição contada do fim: o dígito das unidades segue sendo o mesmo elemento
        const fromEnd = chars.length - 1 - index;
        return /\d/.test(ch) ? (
          <span key={`d${fromEnd}`} className="odo-col" style={{ "--d": ch } as CSSProperties} />
        ) : (
          <span key={`s${fromEnd}${ch}`} className="odo-sep">
            {ch}
          </span>
        );
      })}
    </span>
  );
}
