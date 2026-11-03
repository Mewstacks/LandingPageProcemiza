import type { CSSProperties } from "react";

type Props = {
  id: string;
  label: string;
  /** Os degraus em ordem crescente; o slider anda de degrau em degrau. */
  stops: readonly number[];
  value: number;
  /** O valor como aparece na tela ("30 min"). */
  shown: string;
  /** O valor como o leitor de tela lê ("30 minutos"). */
  spoken: string;
  onChange: (value: number) => void;
};

/**
 * Slider nativo por degraus (setas, Home, End e toque vêm de graça). O valor escrito é só desenho:
 * quem fala para o leitor de tela é `aria-valuetext`.
 */
export function Slider({ id, label, stops, value, shown, spoken, onChange }: Props) {
  const index = Math.max(0, stops.indexOf(value));
  const share = stops.length > 1 ? index / (stops.length - 1) : 0;
  return (
    <div className="field">
      <div className="field-head">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        <span className="field-value" aria-hidden="true">
          {shown}
        </span>
      </div>
      <input
        id={id}
        className="slider"
        type="range"
        min={0}
        max={stops.length - 1}
        step={1}
        value={index}
        aria-valuetext={spoken}
        style={{ "--p": share } as CSSProperties}
        onChange={(e) => onChange(stops[Number(e.target.value)])}
      />
    </div>
  );
}
