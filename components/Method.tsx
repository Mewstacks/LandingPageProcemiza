import { method } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

export function Method() {
  return (
    <section id="como-atuamos" className="method-section" aria-labelledby="metodo-title">
      <div className="wrap">
        <Reveal>
          <h2 id="metodo-title" className="display-lg max-w-[18ch]">{method.title}</h2>
        </Reveal>
      </div>

      <ol className="method-chapters">
        {method.steps.map((step, index) => (
          <Reveal as="li" key={step.n} delay={index * 0.05} className="method-chapter">
            <div className="wrap method-chapter-inner">
              <span className="method-number">{step.n}</span>
              <div className="method-name"><h3>{step.name}</h3></div>
              <p className="method-text">{step.text}</p>
              <p className="method-artifact"><span aria-hidden="true" />{step.artifact}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
