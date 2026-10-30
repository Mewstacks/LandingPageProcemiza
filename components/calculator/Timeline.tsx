import type { StepResult } from "@/lib/calculator";
import { formatMinutes } from "@/lib/format";

type Props = {
  steps: readonly StepResult[];
  names: readonly string[];
  /** Minutos de uma execução: hoje, depois e o que volta. */
  total: number;
  remain: number;
  saved: number;
  active: number | null;
  onActive: (index: number | null) => void;
};

/**
 * Uma execução em duas faixas na mesma escala: cada passo é um bloco com a largura do seu tempo.
 * Em "Depois" o bloco encolhe para o que sobra e o vazio no fim é o tempo que volta. Passar o mouse
 * ou focar um passo acende o bloco dele aqui e a linha dele na conta. A largura anima por
 * `flex-grow` (poucos blocos numa faixa isolada), então a faixa acompanha cada tecla.
 */
export function Timeline({ steps, names, total, remain, saved, active, onActive }: Props) {
  const label = `Uma execução: ${formatMinutes(total)} hoje, ${formatMinutes(remain)} depois.`;
  const focus = active !== null ? "true" : undefined;
  return (
    <div className="tl" role="img" aria-label={label}>
      <div className="tl-row">
        <span className="tl-label">Hoje</span>
        <span className="tl-value">{formatMinutes(total)}</span>
        <span className="tl-track" data-focus={focus}>
          {steps.map((step, index) => (
            <i
              key={index}
              className="tl-seg tl-seg--today"
              data-active={active === index ? "true" : undefined}
              style={{ flexGrow: step.minutes }}
              title={`${names[index]}, ${formatMinutes(step.minutes)}`}
              onMouseEnter={() => onActive(index)}
              onMouseLeave={() => onActive(null)}
            />
          ))}
        </span>
      </div>
      <div className="tl-row">
        <span className="tl-label">Depois</span>
        <span className="tl-value">{formatMinutes(remain)}</span>
        <span className="tl-track" data-focus={focus}>
          {steps.map((step, index) => (
            <i
              key={index}
              className="tl-seg tl-seg--after"
              data-active={active === index ? "true" : undefined}
              style={{ flexGrow: step.remainMinutes }}
              title={`${names[index]}, ${formatMinutes(step.remainMinutes)}`}
              onMouseEnter={() => onActive(index)}
              onMouseLeave={() => onActive(null)}
            />
          ))}
          <i className="tl-seg tl-seg--gap" style={{ flexGrow: saved }} />
        </span>
      </div>
    </div>
  );
}
