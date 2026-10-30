import { FlowScene } from "@/components/hero/FlowScene";
import { flow } from "@/content/flow";
import { cta, hero, site } from "@/content/site";

/**
 * Tinta. A frase do dono à esquerda; à direita, um pedido de WhatsApp virando planilha, nota fiscal
 * e resposta, em 3D, sobre um disco laranja. É o único gráfico da página fora da calculadora.
 */
export function Hero() {
  return (
    <section id="topo" className="hero theme-dark" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title">{hero.title}</h1>
          <p className="hero-support">{hero.support}</p>
          <ul className="hero-services" aria-label="Serviços">
            {hero.services.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="hero-actions">
            <a href="#calculadora" className="btn btn-primary">{cta.primary}</a>
            <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="text-link">
              {cta.whatsapp}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-disc" />
          <FlowScene />
        </div>
        <p className="sr-only">{flow.alt}</p>
      </div>
    </section>
  );
}
