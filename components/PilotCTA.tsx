import { cta, pilot, site } from "@/content/site";

export function PilotCTA() {
  return (
    <section id="contato" className="pilot-section" aria-labelledby="piloto-title">
      <div className="wrap pilot-grid">
        <div>
          <span className="pilot-signal" aria-hidden="true" />
          <h2 id="piloto-title" className="pilot-title">{pilot.title}</h2>
        </div>
        <div className="pilot-copy">
          <ol className="pilot-next">{pilot.next.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol>
          <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {cta.final}<span className="arrow" aria-hidden="true">↗</span>
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
