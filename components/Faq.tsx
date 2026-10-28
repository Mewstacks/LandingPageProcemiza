import { faq } from "@/content/site";

/** <details> nativo: legível antes da hidratação e sem JavaScript. */
export function Faq() {
  return (
    <section id="perguntas" className="faq-section theme-light" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <h2 id="faq-title" className="display-lg">Perguntas</h2>
        <div className="faq-list">
          {faq.map((item) => (
            <details key={item.q} className="faq-item">
              <summary><h3>{item.q}</h3><span className="solution-expand" aria-hidden="true" /></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
