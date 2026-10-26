import { method } from "@/content/site";

export function Method() {
  return (
    <section id="como-atuamos" className="method-section" aria-labelledby="metodo-title">
      <div className="wrap">
        <div className="method-intro">
          <h2 id="metodo-title" className="display-lg">{method.title}</h2>
          <p className="lede">A tecnologia começa com uma boa compreensão do trabalho.</p>
        </div>
        <ol className="method-chapters">
          {method.steps.map((step) => (
            <li key={step.n} className="method-chapter">
              <span className="method-number" aria-hidden="true">{step.n}</span>
              <h3>{step.name}</h3>
              <p className="method-text">{step.text}</p>
              <p className="method-artifact"><span aria-hidden="true" />{step.artifact}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
