import { cta, hero, site } from "@/content/site";
import { HeroRoutine } from "@/components/calculator/HeroRoutine";

export function Hero() {
  return (
    <section id="topo" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title">{hero.title}</h1>
          <p className="hero-support">{hero.support}</p>
          <p className="lede hero-lede">{hero.text}</p>
          <div className="hero-actions">
            <a href="#calculadora" className="btn btn-primary">
              {cta.primary}<span className="arrow" aria-hidden="true">↓</span>
            </a>
            <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="hero-explore">
              {cta.whatsapp}<span aria-hidden="true">↗</span>
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </div>
        <HeroRoutine />
      </div>
    </section>
  );
}
