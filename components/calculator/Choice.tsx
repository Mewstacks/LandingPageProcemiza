type Option<T> = { value: T; label: string };

type Props<T extends string | number | null> = {
  name: string;
  legend: string;
  /** Esconde o título e deixa só para o leitor de tela (o título já está escrito em outro lugar). */
  hideLegend?: boolean;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Uma escolha entre poucas: grupo de rádios nativos desenhados como chips. Tab chega ao grupo, setas
 * andam entre as opções e o marcado muda de tom (claro para escuro), não só de cor. O título é um
 * `radiogroup` rotulado, não um `fieldset`: a legenda do fieldset se desenha em cima da borda.
 */
export function Choice<T extends string | number | null>({ name, legend, hideLegend = false, options, value, onChange }: Props<T>) {
  const labelId = `${name}-rotulo`;
  return (
    <div className="field">
      <span id={labelId} className={hideLegend ? "sr-only" : "field-label"}>
        {legend}
      </span>
      <div className="choices" role="radiogroup" aria-labelledby={labelId}>
        {options.map((option) => (
          <label key={String(option.value)} className="choice">
            <input type="radio" name={name} checked={option.value === value} onChange={() => onChange(option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
