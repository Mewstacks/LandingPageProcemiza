"use client";

import { useId } from "react";

type Props = {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
};

const int = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/**
 * Valor em reais digitado: só dígitos, mostrado com ponto de milhar. Teclado numérico no celular.
 * Vazio ou zero ficam marcados como inválidos (a conta não roda sem salário).
 */
export function Money({ label, value, max, onChange }: Props) {
  const id = useId();
  const invalid = !(value > 0);
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="money" data-invalid={invalid || undefined}>
        <span className="money-unit" aria-hidden="true">
          R$
        </span>
        <input
          id={id}
          className="money-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={invalid}
          value={value > 0 ? int.format(value) : ""}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
            onChange(Math.min(max, digits === "" ? 0 : Number(digits)));
          }}
        />
      </div>
    </div>
  );
}
