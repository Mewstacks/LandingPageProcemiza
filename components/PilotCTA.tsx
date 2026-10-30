import { cta, pilot, site } from "@/content/site";

/** Tinta de novo: a ideia do início volta como cartaz, com o único botão laranja da página. */
export function PilotCTA() {
  // uma frase por linha; o texto lido continua sendo o título inteiro
  const lines = pilot.title.split(/(?<=\.)\s+/);
  return (
    <section id="contato" className="cta theme-dark" aria-labelledby="piloto-title">
      <div className="wrap">
        <h2 id="piloto-title" className="cta-title">
          {lines.map((line) => (
            <span key={line}>{line} </span>
          ))}
        </h2>
        <div className="cta-row">
          <div>
            <p className="cta-lead">{pilot.lead}</p>
            <ol className="cta-steps">
              {pilot.next.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
          <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
            {cta.final}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
