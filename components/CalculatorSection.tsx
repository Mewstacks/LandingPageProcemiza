import { Calculator } from "@/components/calculator/Calculator";
import { RoutineProvider } from "@/components/calculator/RoutineProvider";
import { calculator } from "@/content/site";

/** A única calculadora do site: home e /calculadora usam este bloco. */
export function CalculatorSection() {
  return (
    <section id="calculadora" className="calc-section theme-light" aria-labelledby="calculadora-title">
      <div className="wrap">
        <h2 id="calculadora-title" className="calc-title">{calculator.title}</h2>
        <RoutineProvider>
          <Calculator />
        </RoutineProvider>
      </div>
    </section>
  );
}
