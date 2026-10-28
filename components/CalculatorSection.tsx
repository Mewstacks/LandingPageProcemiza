import { Calculator } from "@/components/calculator/Calculator";
import { calculator } from "@/content/site";

export function CalculatorSection() {
  return (
    <section id="calculadora" className="calc-section theme-light" aria-labelledby="calculadora-title">
      <div className="wrap">
        <div className="calc-heading">
          <h2 id="calculadora-title" className="display-lg">{calculator.title}</h2>
        </div>
        <Calculator />
      </div>
    </section>
  );
}
