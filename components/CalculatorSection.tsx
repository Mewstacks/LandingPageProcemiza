import { CalculatorChat } from "@/components/calculator/CalculatorChat";
import { calculator } from "@/content/site";

/**
 * A única calculadora do site: home e /calculadora usam este bloco, com o mesmo estado (a conversa
 * guarda as respostas no sessionStorage). Na /calculadora o título da página já é o H1, então a
 * seção não repete um segundo título (`withTitle={false}`).
 */
export function CalculatorSection({ withTitle = true }: { withTitle?: boolean }) {
  return (
    <section
      id="calculadora"
      className="calc-section theme-light"
      aria-labelledby={withTitle ? "calculadora-title" : undefined}
      aria-label={withTitle ? undefined : "Calculadora"}
    >
      <div className="wrap">
        {withTitle ? (
          <h2 id="calculadora-title" className="calc-title" data-reveal>
            {calculator.title}
          </h2>
        ) : null}
        <CalculatorChat titled={withTitle} />
      </div>
    </section>
  );
}
