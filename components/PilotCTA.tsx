import { cta, pilot, site } from "@/content/site";

/**
 * Tinta de novo. Na home a ideia do início volta como cartaz, com o único botão laranja da página;
 * nas páginas internas é uma faixa só com o convite (o cartaz não se repete).
 */
export function PilotCTA({ compact = false }: { compact?: boolean }) {
  // uma frase por linha; o texto lido continua sendo o título inteiro
  const lines = pilot.title.split(/(?<=\.)\s+/);
  const button = (
    <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
      {cta.final}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
  return (
    <section id="contato" className={`cta theme-dark${compact ? " cta--compact" : ""}`} aria-labelledby="piloto-title">
      <div className="wrap cta-grid">
        {compact ? (
          <>
            <h2 id="piloto-title" className="cta-lead">{pilot.lead}</h2>
            {button}
          </>
        ) : (
          <>
            <h2 id="piloto-title" className="cta-title" data-reveal>
              {lines.map((line) => (
                <span key={line}>{line} </span>
              ))}
            </h2>
            <div className="cta-action" data-reveal="2">
              <p className="cta-lead">{pilot.lead}</p>
              {button}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
