import { cta, hero, site } from "@/content/site";
import { InfrastructureScene } from "@/components/layers/InfrastructureScene";

export function Hero() {
  return (
    <section id="topo" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker"><span aria-hidden="true" /> Inteligência para a operação</p>
          <h1 id="hero-title" className="display-xl">{hero.title}</h1>
          <p className="lede hero-lede">{hero.text}</p>
          <div className="hero-actions">
            <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {cta.primary}<span className="arrow" aria-hidden="true">↗</span>
            </a>
            <a href="#camadas" className="hero-explore">{cta.secondary}<span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="hero-system" aria-hidden="true">
          <div className="hero-system-top"><span>Conexões que fazem sentido.</span><i /></div>
          <InfrastructureScene variant="hero" />
          <div className="hero-system-bottom"><span>Informação dispersa</span><i /><span>Operação conectada</span></div>
        </div>
        <div className="hero-footnote"><span>Feito para a sua rotina.</span><span>Construído para evoluir.</span></div>
      </div>
    </section>
  );
}
