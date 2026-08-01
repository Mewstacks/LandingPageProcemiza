import { pilot, site, cta } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

export function PilotCTA() {
  return (
    <section className="pilot-section" aria-labelledby="piloto-title">
      <div className="wrap">
        <Reveal>
          <span className="pilot-signal" aria-hidden="true" />
          <h2 id="piloto-title" className="pilot-title">{pilot.title}</h2>
        </Reveal>

        <div className="pilot-lower">
          <Reveal delay={0.06}>
            <p className="lede">{pilot.text}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ol className="pilot-next">
              {pilot.next.map((item, index) => (
                <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.14}>
            <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {cta.primary}<span className="arrow" aria-hidden="true">→</span>
            </a>
            <p className="pilot-note">{pilot.microcopy}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
